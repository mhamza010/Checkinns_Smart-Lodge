// routes/paymentRoutes.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendBookingReceiptEmail, sendMarketingBlastEmail } from "../utils/mailer.js";

// Ensure env vars are loaded even if server loads this file before calling dotenv.config()
dotenv.config();

const router = express.Router();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn("[Stripe] STRIPE_SECRET_KEY missing in .env. Payment endpoints will not work until set.");
}
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

// Get publishable key for client
router.get("/config", (req, res) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || "";
  res.json({ publishableKey });
});

// Create a PaymentIntent for a booking
router.post("/create-intent", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: "bookingId is required" });

    const booking = await Booking.findById(bookingId).populate("hotel");
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Convert amount to cents
    const amount = Math.round(Number(booking.totalPrice || 0) * 100);
    if (amount <= 0) return res.status(400).json({ error: "Invalid booking amount" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        bookingId: booking._id.toString(),
        type: "hotel",
        hotel: booking.hotel?.name || "",
        username: booking.username || "",
      },
      automatic_payment_methods: { enabled: true },
    });

    booking.paymentIntentId = paymentIntent.id;
    booking.paymentStatus = paymentIntent.status || "requires_payment_method";
    await booking.save();

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error("[Stripe] create-intent error:", err);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// Optionally update booking status from client after confirmation
router.post("/update-status", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ error: "paymentIntentId is required" });

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    const bookingId = pi.metadata?.bookingId;
    if (!bookingId) return res.status(404).json({ error: "Related booking not found on PI" });

    const booking = await Booking.findById(bookingId).populate("hotel");
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Determine if we need to send an email (only when transitioning to 'succeeded')
    const justSucceeded = booking.paymentStatus !== "succeeded" && pi.status === "succeeded";

    booking.paymentStatus = pi.status;
    await booking.save();

    if (justSucceeded) {
      // Find the user if they're registered to ensure correct email fallback
      const user = await User.findOne({ username: booking.username });
      const targetEmail = booking.email || (user ? user.email : null);
      const guestName = (user && user.name) ? user.name : (booking.username || "Valued Guest");

      if (targetEmail) {
        sendBookingReceiptEmail(targetEmail, {
          hotelName: booking.hotel?.name || "CheckInns",
          guestName: guestName,
          nights: booking.nights,
          checkInDate: booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "N/A",
          checkOutDate: booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "N/A",
          totalPrice: booking.totalPrice,
          paymentId: pi.id
        });
      }
    }

    res.json({ ok: true, status: pi.status, bookingId });
  } catch (err) {
    console.error("[Stripe] update-status error:", err);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// Create a PaymentIntent for Owner Membership Upgrade
router.post("/create-upgrade-intent", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

    const { hotelId, tier, price } = req.body;
    if (!hotelId || !tier) return res.status(400).json({ error: "hotelId and tier are required" });

    const amount = Math.round(Number(price || 50) * 100); // 50 USD if not specified

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        hotelId,
        tier,
        type: "upgrade"
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error("[Stripe] create-upgrade-intent error:", err);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

router.post("/update-upgrade-status", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ error: "paymentIntentId is required" });

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    // We only process if payment succeeded
    if (pi.status === "succeeded") {
      const hotelId = pi.metadata?.hotelId;
      const tier = pi.metadata?.tier;
      const amountPaid = pi.amount / 100;

      if (hotelId && tier) {
        const Hotel = (await import("../models/Hotel.js")).default;
        const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, { membershipTier: tier }, { new: true });

        // Log this into AuditLog to act as admin income
        const AuditLog = (await import("../models/AuditLog.js")).default;
        await AuditLog.create({
          action: "Package Purchased",
          description: `Owner upgraded hotel to ${tier}. Revenue: $${amountPaid}`,
          userType: "owner",
          revenue: amountPaid
        });

        // Blast an email to all users
        if (updatedHotel) {
          const users = await User.find({ email: { $exists: true, $ne: null } }).select("email").lean();
          const emailList = users.map(u => u.email).filter(e => e);
          if (emailList.length > 0) {
            await sendMarketingBlastEmail(emailList, updatedHotel.name, tier);
          }
        }
      }
    }

    res.json({ ok: true, status: pi.status });
  } catch (err) {
    console.error("[Stripe] update-upgrade-status error:", err);
    res.status(500).json({ error: "Failed to update upgrade status" });
  }
});

export default router;
