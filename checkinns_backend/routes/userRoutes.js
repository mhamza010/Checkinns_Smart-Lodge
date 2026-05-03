/*
import express from "express";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/config.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// --------------------
// SIGNUP ROUTE
// POST /api/users/signup
// --------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "name, email and password are required" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username: email }] });
    if (existing) {
      return res.status(409).json({ msg: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      username: email, // using email as username for login consistency
      password // ⚠️ For production hash with bcrypt
    });

  // --------------------
  // GET /api/users/favorites
  // --------------------
  router.get("/favorites", authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });
      return res.json(user.favorites || { hotels: [], restaurants: [], lounges: [] });
    } catch (err) {
      console.error("/users/favorites error", err);
      return res.status(500).json({ msg: "Server error" });
    }
  });

  // --------------------
  // GET /api/users/bookings
  // --------------------
  router.get("/bookings", authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });
      const bookings = await Booking.find({ username: user.username }).populate("hotel").lean();
      return res.json(bookings || []);
    } catch (err) {
      console.error("/users/bookings error", err);
      return res.status(500).json({ msg: "Server error" });
    }
  });

  // --------------------
  // PUT /api/users/preferences
  // --------------------
  router.put("/preferences", authMiddleware, async (req, res) => {
    try {
      const { roomType, cuisine, loungeType } = req.body || {};
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });
      user.preferences = {
        ...(user.preferences || {}),
        ...(roomType !== undefined ? { roomType } : {}),
        ...(cuisine !== undefined ? { cuisine } : {}),
        ...(loungeType !== undefined ? { loungeType } : {}),
      };
      await user.save();
      return res.json({ msg: "Preferences updated", preferences: user.preferences });
    } catch (err) {
      console.error("/users/preferences error", err);
      return res.status(500).json({ msg: "Server error" });
    }
  });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      token,
      user: { id: user._id, username: user.username, name: user.name }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
    }
  });

    // Add to the correct favorites array
    switch (type) {
      case "hotel":
        if (!user.favorites.hotels.includes(id)) user.favorites.hotels.push(id);
        break;
      case "restaurant":
        if (!user.favorites.restaurants.includes(id)) user.favorites.restaurants.push(id);
        break;
      case "lounge":
        if (!user.favorites.lounges.includes(id)) user.favorites.lounges.push(id);
        break;
      default:
        return res.status(400).json({ msg: "Invalid type" });
    }

    await user.save();
    return res.json({ msg: "Added to favorites", favorites: user.favorites });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;
*/
