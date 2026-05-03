import express from "express";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/config.js";
import RestaurantBooking from "../models/RestaurantBooking.js";
import LoungeBooking from "../models/LoungeBooking.js";
import Notification from "../models/Notification.js";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../utils/mailer.js";

const router = express.Router();

// POST /api/users/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    const existing = await User.findOne({ $or: [{ email }, { username: email }] });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode });
    await sendOtpEmail(email, otpCode);

    return res.status(200).json({ msg: "OTP sent" });
  } catch (err) {
    console.error("/users/signup error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/verify-signup
router.post("/verify-signup", async (req, res) => {
  try {
    const { name, email, password, otp, ref } = req.body || {};
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "All fields and OTP are required" });
    }

    const otpRec = await Otp.findOne({ email, otp });
    if (!otpRec) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username: email }] });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const user = await User.create({ name, email, username: email, password });
    await Otp.deleteOne({ _id: otpRec._id });

    if (ref) {
      try {
        const referrer = await User.findById(ref);
        if (referrer) {
          referrer.vipPoints = (referrer.vipPoints || 0) + 500;
          await referrer.save();
          await Notification.create({
            recipient: referrer.email,
            role: "user",
            type: "system",
            message: `Someone signed up using your referral link! You earned 500 VIP points.`,
            isRead: false
          });
        }
      } catch (err) {
        console.error("Referral processing error", err);
      }
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Send Welcome Notification
    await Notification.create({
      recipient: user.email,
      role: "user",
      type: "system",
      message: "Welcome to CheckInns! We are thrilled to have you here. Start exploring your favorite venues.",
      isRead: false
    });

    return res.status(201).json({ token, user: { id: user._id, username: user.username, name: user.name, email: user.email } });
  } catch (err) {
    console.error("/users/verify-signup error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/resend-otp
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode });
    await sendOtpEmail(email, otpCode);

    return res.status(200).json({ msg: "OTP resent" });
  } catch (err) {
    console.error("/users/resend-otp error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/login
router.post("/login", async (req, res) => {
  const { email, password, username } = req.body || {};
  const loginField = email || username;
  try {
    const user = await User.findOne({ $or: [{ email: loginField }, { username: loginField }] });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, user: { id: user._id, username: user.username, name: user.name, email: user.email } });
  } catch (err) {
    console.error("/users/login error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/users/profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        vipPoints: user.vipPoints || 0
      },
      preferences: {
        preferredRoomType: user.preferences?.roomType || '',
        preferredCuisine: user.preferences?.cuisine || '',
        preferredLoungeType: user.preferences?.loungeType || ''
      }
    });
  } catch (err) {
    console.error("/users/profile error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/users/favorites
router.get("/favorites", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("favorites.hotels")
      .populate("favorites.restaurants")
      .populate("favorites.lounges");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ favorites: user.favorites || { hotels: [], restaurants: [], lounges: [] } });
  } catch (err) {
    console.error("/users/favorites get error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/favorites
router.post("/favorites", authMiddleware, async (req, res) => {
  try {
    const { type, id, itemType, itemId, action } = req.body || {};
    const reqType = type || itemType;
    const reqId = id || itemId;
    const reqAction = action || 'add';

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (!user.favorites) user.favorites = { hotels: [], restaurants: [], lounges: [] };

    if (reqAction === 'remove') {
      if (reqType === "hotel") user.favorites.hotels = user.favorites.hotels.filter(h => h.toString() !== reqId);
      else if (reqType === "restaurant") user.favorites.restaurants = user.favorites.restaurants.filter(r => r.toString() !== reqId);
      else if (reqType === "lounge") user.favorites.lounges = user.favorites.lounges.filter(l => l.toString() !== reqId);
    } else {
      if (reqType === "hotel" && !user.favorites.hotels.includes(reqId)) user.favorites.hotels.push(reqId);
      else if (reqType === "restaurant" && !user.favorites.restaurants.includes(reqId)) user.favorites.restaurants.push(reqId);
      else if (reqType === "lounge" && !user.favorites.lounges.includes(reqId)) user.favorites.lounges.push(reqId);
    }

    if (!reqType) return res.status(400).json({ msg: "Invalid type" });
    await user.save();
    return res.json({ msg: reqAction === 'remove' ? "Removed from favorites" : "Added to favorites", favorites: user.favorites });
  } catch (err) {
    console.error("/users/favorites post error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/users/bookings
router.get("/bookings", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hotelBookings = await Booking.find({ username: user.username }).populate("hotel").lean();
    const restBookings = await RestaurantBooking.find({ $or: [{ email: user.email }, { username: user.username }] }).populate("restaurant").lean();
    const loungeBookings = await LoungeBooking.find({ $or: [{ email: user.email }, { username: user.username }] }).populate("lounge").lean();

    // Merge & sort descending
    const bookings = [...hotelBookings, ...restBookings, ...loungeBookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ bookings });
  } catch (err) {
    console.error("/users/bookings error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/preferences
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

// GET /api/users/notifications
router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Users are identified by email or username in bookings, but our Notification uses recipient=username or email
    const notifications = await Notification.find({
      $or: [
        { recipient: user.username },
        { recipient: user.email },
        { recipient: "all" }
      ],
      role: "user"
    }).sort({ createdAt: -1 }).limit(20);

    res.json({ notifications });
  } catch (err) {
    console.error("/users/notifications error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/notifications/:id/read
router.put("/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ notification: notif });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/profile-settings
router.put("/profile-settings", authMiddleware, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;

    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });
      user.password = newPassword;
    }

    await user.save();
    return res.json({ message: "Profile updated successfully", user: { name: user.name, username: user.username } });
  } catch (err) {
    console.error("/users/profile-settings error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// FORGOT PASSWORD
// --------------------

// POST /api/users/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode });
    await sendOtpEmail(email, otpCode);

    return res.status(200).json({ msg: "Password reset OTP sent" });
  } catch (err) {
    console.error("/users/forgot-password error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP and new password are required" });
    }

    const otpRec = await Otp.findOne({ email, otp });
    if (!otpRec) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();
    await Otp.deleteOne({ _id: otpRec._id });

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("/users/reset-password error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// CANCELLATION & REFUND
// --------------------

// POST /api/users/bookings/:id/cancel
router.post("/bookings/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Check all booking collections
    let booking = await Booking.findById(id).populate("hotel");
    let model = Booking;
    
    if (!booking) {
      booking = await RestaurantBooking.findById(id).populate("restaurant");
      model = RestaurantBooking;
    }
    if (!booking) {
      booking = await LoungeBooking.findById(id).populate("lounge");
      model = LoungeBooking;
    }
    
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Check ownership
    const user = await User.findById(req.user.id);
    if (booking.username !== user.username && booking.email !== user.email) {
      return res.status(403).json({ message: "Unauthorized to cancel this booking" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason || "User cancelled";
    booking.refundStatus = "pending"; // Initially pending
    await booking.save();

    // Create notification for user
    await Notification.create({
      recipient: user.email,
      role: "user",
      type: "booking",
      message: `Your booking (ID: ${id}) has been cancelled. A refund of $${booking.totalPrice || 0} is being processed.`,
      isRead: false
    });

    // Create notification for owner
    const prop = booking.hotel || booking.restaurant || booking.lounge;
    if (prop && prop.owner) {
      await Notification.create({
        recipient: prop.owner,
        role: "owner",
        type: "booking",
        message: `A booking (ID: ${id}) at ${prop.name} was cancelled by the user. Refund of $${booking.totalPrice || 0} is pending.`,
        isRead: false
      });
    }

    return res.json({ message: "Booking cancelled successfully", refundStatus: "pending" });
  } catch (err) {
    console.error("/users/bookings/cancel error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
