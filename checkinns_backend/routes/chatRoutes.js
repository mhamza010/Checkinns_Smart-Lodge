import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Hotel from "../models/Hotel.js";
import Restaurant from "../models/Restaurant.js";
import Lounge from "../models/Lounge.js";

const router = express.Router();

// Store active chat sessions in memory (for production use Redis or DB)
const chatSessions = new Map();

// POST /api/chat { message?: string, sessionId?: string }
router.post("/", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    // Accept sessionId from frontend (or create one)
    const sessionId = req.body.sessionId || "default_session";
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", version: "v1beta" });

    // Always provide deep structural grounding context from DB
    let groundingContext = "";
    try {
      const hotels = await Hotel.find().limit(20).lean();
      const restaurants = await Restaurant.find().limit(20).lean();
      const lounges = await Lounge.find().limit(20).lean();

      groundingContext = [
        formatHotelContext(hotels),
        formatRestaurantContext(restaurants),
        formatLoungeContext(lounges)
      ].join('\n\n');
    } catch (e) {
      console.warn("Chat grounding lookup failed:", e?.message);
    }

    const systemPrompt = `You are Check-Inns's AI concierge.
Project context:
- Brand: Check-Inns platform
- Services: Hotels, Restaurants, Lounges
- User goals: find stays, dining, lounges by room type, price, rating, location, dates, and special requirements.
Guidelines:
- Be conversational, friendly, and act as a personalized travel agent answering questions specifically.
- Keep replies concise (2-4 bullet points max) unless detailing a specific itinerary.
- Recommend ONLY from our LIVE Database, do not hallucinate external properties.
- Use short emoji where helpful (⭐, 🏨, 💰, 📍).

Here is the LIVE Site Data Database:
${groundingContext}`;

    let chat;
    if (chatSessions.has(sessionId)) {
      chat = chatSessions.get(sessionId);
    } else {
      chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "System Instructions: " + systemPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "Understood! I am ready to act as the Check-Inns AI Concierge and will only recommend items from the Live Database provided." }],
          },
        ],
      });
      chatSessions.set(sessionId, chat);
    }

    // Send the user's message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply, sessionId });
  } catch (err) {
    console.error("/api/chat error", err);
    res.status(500).json({ error: "Server error", details: err?.message });
  }
});

// Optionally create an endpoint to clear chat history
router.post("/clear", (req, res) => {
  const sessionId = req.body.sessionId || "default_session";
  if (chatSessions.has(sessionId)) {
    chatSessions.delete(sessionId);
  }
  res.json({ success: true });
});

export default router;

// ---- Helpers to ground with DB ----
function buildHotelFilter(p) {
  const filter = {};
  if (p.location) filter.location = new RegExp(normalizeLocation(p.location), "i");
  if (p.country) {
    const countryRegex = new RegExp(p.country, "i");
    if (filter.location) {
      filter.$and = [
        { location: filter.location },
        { location: countryRegex }
      ];
      delete filter.location;
    } else {
      filter.location = countryRegex;
    }
  }
  if (p.rating) filter.rating = { $gte: ratingToMin(p.rating) };
  // Simple price approximation if your schema has pricePerNight
  if (p.priceRange) {
    const [min, max] = priceRangeToBounds(p.priceRange);
    if (min != null || max != null) filter.pricePerNight = {};
    if (min != null) filter.pricePerNight.$gte = min;
    if (max != null) filter.pricePerNight.$lte = max;
  }
  if (Array.isArray(p.special) && p.special.length) {
    filter["amenities.name"] = { $in: specialsToAmenityNames(p.special) };
  }
  if (p.roomType) filter["rooms.name"] = new RegExp(p.roomType, "i");
  return filter;
}

function buildRestaurantFilter(p) {
  const filter = {};
  if (p.location) filter.location = new RegExp(normalizeLocation(p.location), "i");
  if (p.country) {
    const countryRegex = new RegExp(p.country, "i");
    if (filter.location) {
      filter.$and = [
        { location: filter.location },
        { location: countryRegex }
      ];
      delete filter.location;
    } else {
      filter.location = countryRegex;
    }
  }
  if (p.priceRange) filter.priceRange = new RegExp(humanizePriceRange(p.priceRange), "i");
  if (Array.isArray(p.cuisines) && p.cuisines.length) filter.cuisines = { $in: p.cuisines };
  return filter;
}

function buildLoungeFilter(p) {
  const filter = {};
  if (p.location) filter.location = new RegExp(normalizeLocation(p.location), "i");
  if (p.country) {
    const countryRegex = new RegExp(p.country, "i");
    if (filter.location) {
      filter.$and = [
        { location: filter.location },
        { location: countryRegex }
      ];
      delete filter.location;
    } else {
      filter.location = countryRegex;
    }
  }
  if (p.priceRange) filter.priceRange = new RegExp(humanizePriceRange(p.priceRange), "i");
  if (Array.isArray(p.features) && p.features.length) filter.features = { $in: p.features };
  return filter;
}

function ratingToMin(r) {
  const map = { "5stars": 5, "4stars": 4, "3stars": 3, "2stars": 2 };
  return map[r] || 0;
}

function priceRangeToBounds(code) {
  switch (code) {
    case "budget": return [50, 100];
    case "midrange": return [100, 200];
    case "luxury_price": return [200, 500];
    case "premium": return [500, null];
    default: return [null, null];
  }
}

function specialsToAmenityNames(arr) {
  const map = {
    wheelchair: /wheelchair|accessible/i,
    pet_friendly: /pet/i,
    non_smoking: /non-?smoking/i,
    all_inclusive: /all[- ]?inclusive/i,
    pool: /pool/i,
  };
  // Return generic names, filtering will use regex via amenities.name in buildHotelFilter
  return arr.map(k => {
    if (k === 'wheelchair') return 'Wheelchair Accessible';
    if (k === 'pet_friendly') return 'Pet Friendly';
    if (k === 'non_smoking') return 'Non Smoking';
    if (k === 'all_inclusive') return 'All Inclusive';
    if (k === 'pool') return 'Pool';
    return k;
  });
}

function humanizePriceRange(code) {
  return {
    budget: 'Budget',
    midrange: 'Mid-range',
    luxury_price: 'Luxury',
    premium: 'Premium'
  }[code] || code;
}

function normalizeLocation(code) {
  return {
    city_center: 'city',
    beachfront: 'beach',
    mountain: 'mountain',
    airport: 'airport',
    shopping: 'shopping'
  }[code] || code;
}

function formatHotelContext(items = []) {
  if (!items.length) return 'No hotels matched filters.';
  return 'Hotels (top matches):\n' + items.map(h => `- ${h.name} • ${h.location || ''} • $${h.pricePerNight || ''} • ⭐${h.rating || ''}`).join('\n');
}

function formatRestaurantContext(items = []) {
  if (!items.length) return 'No restaurants matched filters.';
  return 'Restaurants (top matches):\n' + items.map(r => `- ${r.name} • ${r.location || ''} • ${r.priceRange || ''} • ${Array.isArray(r.cuisines) ? r.cuisines.join(', ') : ''}`).join('\n');
}

function formatLoungeContext(items = []) {
  if (!items.length) return 'No lounges matched filters.';
  return 'Lounges (top matches):\n' + items.map(l => `- ${l.name} • ${l.location || ''} • ${l.priceRange || ''} • ${Array.isArray(l.features) ? l.features.join(', ') : ''}`).join('\n');
}
