import express from "express";
import authMiddleware from "../middleware/auth.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Booking from "../models/Booking.js";
import RestaurantBooking from "../models/RestaurantBooking.js";
import LoungeBooking from "../models/LoungeBooking.js";

const router = express.Router();

// Get messages for a booking
router.get("/:bookingId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ bookingId: req.params.bookingId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    console.error("GET /api/messages error: ", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Send a message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { bookingId, text } = req.body;
    if (!bookingId || !text) {
      return res.status(400).json({ error: "bookingId and text required" });
    }
    
    // Determine sender Role. If req.user is populated, it usually means user. If there is owner token, `req.user.role` could be 'owner', but we can just use simple string 'user' or 'owner' if we pass it. For now, we will default to 'user' for user dashboard.
    const senderRole = req.body.senderRole || 'user';
    
    // Create message
    const message = await Message.create({
      bookingId,
      text,
      senderRole,
      senderId: req.user.id
    });

    // We can also create a notification for the other party if we want, but simple direct messaging works now.
    res.status(201).json({ message });
  } catch (err) {
    console.error("POST /api/messages error: ", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
