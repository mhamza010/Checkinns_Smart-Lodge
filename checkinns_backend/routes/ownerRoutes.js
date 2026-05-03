import express from "express";
import Hotel from "../models/Hotel.js";
import Lounge from "../models/Lounge.js";
import Restaurant from "../models/Restaurant.js";
import Booking from "../models/Booking.js";
import LoungeBooking from "../models/LoungeBooking.js";
import RestaurantBooking from "../models/RestaurantBooking.js";
import Owner from "../models/Owner.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/config.js";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../utils/mailer.js";

const router = express.Router();

// --------------------
// SIGNUP ROUTE (Owner)
// POST /api/owner/signup
// --------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "name, email and password are required" });
    }

    const existing = await Owner.findOne({ $or: [{ email }, { username: email }] });
    if (existing) {
      return res.status(409).json({ msg: "Owner already exists" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode });
    await sendOtpEmail(email, otpCode);

    return res.status(200).json({ msg: "OTP sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/verify-signup", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ msg: "All fields and OTP are required" });
    }

    const otpRec = await Otp.findOne({ email, otp });
    if (!otpRec) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    const existing = await Owner.findOne({ $or: [{ email }, { username: email }] });
    if (existing) {
      return res.status(409).json({ msg: "Owner already exists" });
    }

    const owner = await Owner.create({
      name,
      email,
      username: email,
      password // ⚠️ hash in production
    });
    await Otp.deleteOne({ _id: otpRec._id });

    const token = jwt.sign({ id: owner._id, username: owner.username, role: "owner" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      token,
      owner: { id: owner._id, username: owner.username, name: owner.name }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode });
    await sendOtpEmail(email, otpCode);

    return res.status(200).json({ msg: "OTP resent" });
  } catch (err) {
    console.error("/owner/resend-otp error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// --------------------
// LOGIN ROUTE (Owner)
// POST /api/owner/login
// --------------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const owner = await Owner.findOne({ username });
    if (!owner) return res.status(404).json({ msg: "Owner not found" });

    const isPasswordValid = await owner.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: owner._id, username: owner.username, role: "owner" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, owner: { id: owner._id, username: owner.username, name: owner.name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/owner/summary?owner=OwnerName
router.get("/summary", async (req, res) => {
  try {
    const owner = req.query.owner;
    if (!owner) return res.status(400).json({ error: "owner is required" });

    // Entities
    const [hotels, lounges, restaurants] = await Promise.all([
      Hotel.find({ owner }),
      Lounge.find({ owner }),
      Restaurant.find({ owner }),
    ]);

    const hotelIds = hotels.map(h => h._id);
    const loungeIds = lounges.map(l => l._id);
    const restaurantIds = restaurants.map(r => r._id);

    // Date range for current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Bookings linked to owner's entities (fetch all for all-time revenue)
    const [hotelBookings, loungeBookings, restaurantBookings] = await Promise.all([
      Booking.find({ hotel: { $in: hotelIds } }),
      LoungeBooking.find({ lounge: { $in: loungeIds } }),
      RestaurantBooking.find({ restaurant: { $in: restaurantIds } }),
    ]);

    const allBookingsThisMonth = [...hotelBookings, ...loungeBookings, ...restaurantBookings]
      .filter(b => b.createdAt >= monthStart && b.createdAt < monthEnd).length;

    // Only count CONFIRMED bookings for Revenue
    const confHotel = hotelBookings.filter(b => b.status === 'confirmed');
    const confLounge = loungeBookings.filter(b => b.status === 'confirmed');
    const confRest = restaurantBookings.filter(b => b.status === 'confirmed');

    const hotelRevenue = confHotel.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const loungeRevenue = confLounge.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const restaurantRevenue = confRest.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const totalRevenue = hotelRevenue + loungeRevenue + restaurantRevenue;

    // Simple occupancy approximation for hotels this month:
    // total nights booked in month (from confirmed) / (number of hotels * 30) -> percentage
    const totalNightsThisMonth = confHotel.reduce((s, b) => {
       if (b.createdAt >= monthStart && b.createdAt < monthEnd) {
           return s + (b.nights || 0);
       }
       return s;
    }, 0);
    const denom = Math.max(hotels.length * 30, 1);
    const occupancyRate = Math.round((totalNightsThisMonth / denom) * 100);

    res.json({
      owner,
      counts: {
        hotels: hotels.length,
        lounges: lounges.length,
        restaurants: restaurants.length,
        bookingsThisMonth: allBookingsThisMonth,
      },
      revenue: {
        hotel: hotelRevenue,
        lounge: loungeRevenue,
        restaurant: restaurantRevenue,
        total: totalRevenue,
      },
      occupancyRate,
    });
  } catch (err) {
    console.error("/api/owner/summary error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/owner/reviews?owner=OwnerName
router.get("/reviews", async (req, res) => {
  try {
    const owner = req.query.owner;
    if (!owner) return res.status(400).json({ error: "owner is required" });

    // Fetch owner's properties
    const [hotels, lounges, restaurants] = await Promise.all([
      Hotel.find({ owner }),
      Lounge.find({ owner }),
      Restaurant.find({ owner }),
    ]);

    const propertyIds = [
      ...hotels.map(h => h._id),
      ...lounges.map(l => l._id),
      ...restaurants.map(r => r._id)
    ];

    const propertyMap = {};
    hotels.forEach(h => propertyMap[h._id.toString()] = { name: h.name, type: "Hotel" });
    lounges.forEach(l => propertyMap[l._id.toString()] = { name: l.name, type: "Lounge" });
    restaurants.forEach(r => propertyMap[r._id.toString()] = { name: r.name, type: "Restaurant" });

    const reviews = await Review.find({ propertyId: { $in: propertyIds } })
      .populate("user", "username name email")
      .sort({ createdAt: -1 })
      .lean();

    const formattedReviews = reviews.map(r => ({
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      propertyName: propertyMap[r.propertyId.toString()]?.name || "Unknown Property",
      propertyType: propertyMap[r.propertyId.toString()]?.type || "Unknown Type",
      user: r.user ? (r.user.name || r.user.username || "Guest") : "Verified User"
    }));

    // Analytics
    const totalReviews = formattedReviews.length;
    const avgRating = totalReviews > 0
      ? (formattedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    // Distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    formattedReviews.forEach(r => {
      if (distribution[Math.floor(r.rating)] !== undefined) {
        distribution[Math.floor(r.rating)]++;
      }
    });

    res.json({
      reviews: formattedReviews,
      stats: {
        totalReviews,
        avgRating,
        distribution
      }
    });

  } catch (err) {
    console.error("/api/owner/reviews error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/owner/analytics?owner=OwnerName
router.get("/analytics", async (req, res) => {
  try {
    const owner = req.query.owner;
    if (!owner) return res.status(400).json({ error: "owner is required" });

    const hotels = await Hotel.find({ owner });
    const hotelIds = hotels.map(h => h._id);

    const matchHotelConf = { hotel: { $in: hotelIds }, status: "confirmed" };

    // Group bookings by hotel to find top performing hotels
    const topHotelsAgg = await Booking.aggregate([
      { $match: matchHotelConf },
      { $group: { _id: "$hotel", totalRevenue: { $sum: "$totalPrice" }, totalBookings: { $sum: 1 } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 4 }
    ]);
    
    // Get hotel names
    for (let h of topHotelsAgg) {
        const hotelDoc = await Hotel.findById(h._id);
        h.name = hotelDoc ? hotelDoc.name : "Unknown";
    }

    // Most active users (guests who booked most frequently or spent most)
    const activeUsersAgg = await Booking.aggregate([
      { $match: matchHotelConf },
      { $group: { _id: "$username", totalSpent: { $sum: "$totalPrice" }, bookingsCount: { $sum: 1 } } },
      { $sort: { bookingsCount: -1 } },
      { $limit: 5 }
    ]);

    // Revenue trends (daily/monthly) - last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueTrendsMonthly = await Booking.aggregate([
      { $match: { ...matchHotelConf, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { 
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, 
          revenue: { $sum: "$totalPrice" } 
      } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Most booked cities
    // First map hotel IDs to their cities
    const cityMap = {};
    for (let h of hotels) {
      // assume location has the city, or we just use location string
      const city = h.location.split(',')[0].trim();
      cityMap[h._id.toString()] = city;
    }
    
    const cityCount = {};
    const allOwnerBookings = await Booking.find({ hotel: { $in: hotelIds } });
    allOwnerBookings.forEach(b => {
       if(b.hotel) {
         const city = cityMap[b.hotel.toString()] || "Unknown City";
         cityCount[city] = (cityCount[city] || 0) + 1;
       }
    });
    
    const sortedCities = Object.keys(cityCount).map(c => ({ city: c, count: cityCount[c] }))
      .sort((a,b) => b.count - a.count).slice(0, 5);

    res.json({
        topHotels: topHotelsAgg,
        activeUsers: activeUsersAgg,
        revenueTrendsMonthly,
        mostBookedCities: sortedCities
    });

  } catch (err) {
    console.error("/api/owner/analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/owner/bookings?owner=OwnerName
router.get("/bookings", async (req, res) => {
  try {
    const owner = req.query.owner;
    if (!owner) return res.status(400).json({ error: "owner is required" });

    // Fetch owner's properties
    const [hotels, lounges, restaurants] = await Promise.all([
      Hotel.find({ owner }),
      Lounge.find({ owner }),
      Restaurant.find({ owner }),
    ]);

    const propertyMap = {};
    hotels.forEach(h => propertyMap[h._id.toString()] = h.name);
    lounges.forEach(h => propertyMap[h._id.toString()] = h.name);
    restaurants.forEach(h => propertyMap[h._id.toString()] = h.name);

    const [hotelBookings, loungeBookings, restBookings] = await Promise.all([
      Booking.find({ hotel: { $in: hotels.map(h => h._id) } }).lean(),
      LoungeBooking.find({ lounge: { $in: lounges.map(l => l._id) } }).lean(),
      RestaurantBooking.find({ restaurant: { $in: restaurants.map(r => r._id) } }).lean()
    ]);

    let formattedBookings = [
      ...hotelBookings.map(b => ({
        _id: b._id,
        customerName: b.username || b.firstName || "Guest",
        roomName: b.room?.name || "Hotel Booking",
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        totalPrice: b.totalPrice || 0,
        paymentStatus: b.paymentStatus || "unknown",
        status: b.status || "pending",
        refundStatus: b.refundStatus || "pending",
        cancellationReason: b.cancellationReason || "",
        propertyName: propertyMap[b.hotel?.toString()] || "Unknown Hotel",
        createdAt: b.createdAt
      })),
      ...loungeBookings.map(b => ({
        _id: b._id,
        customerName: b.username || b.firstName || "Guest",
        roomName: `Lounge Access (${b.guests} Guests)`,
        checkIn: b.date,
        checkOut: b.date,
        totalPrice: b.totalPrice || 0,
        paymentStatus: b.paymentStatus || "unknown",
        status: b.status || "pending",
        refundStatus: b.refundStatus || "pending",
        cancellationReason: b.cancellationReason || "",
        propertyName: propertyMap[b.lounge?.toString()] || "Unknown Lounge",
        createdAt: b.createdAt
      })),
      ...restBookings.map(b => ({
        _id: b._id,
        customerName: b.username || b.firstName || "Guest",
        roomName: `Table Reservation (${b.guests} Seats)`,
        checkIn: b.date,
        checkOut: b.date,
        totalPrice: b.totalPrice || 0,
        paymentStatus: b.paymentStatus || "unknown",
        status: b.status || "pending",
        refundStatus: b.refundStatus || "pending",
        cancellationReason: b.cancellationReason || "",
        propertyName: propertyMap[b.restaurant?.toString()] || "Unknown Restaurant",
        createdAt: b.createdAt
      }))
    ];

    formattedBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(formattedBookings);
  } catch (err) {
    console.error("/api/owner/bookings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/owner/bookings/:id/status
router.put("/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    let booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) booking = await LoungeBooking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) booking = await RestaurantBooking.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // ✅ Notify User about Booking Confirmation or Rejection
    const customer = booking.username || booking.email;
    if (customer) {
      await Notification.create({
        recipient: customer,
        role: "user",
        type: "booking",
        message: `Your booking at ${booking.propertyName || 'the property'} has been ${status}.`
      });
    }

    res.json({ message: "Booking status updated successfully", booking });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/owner/bookings/:id/refund
router.put("/bookings/:id/refund", async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) booking = await LoungeBooking.findById(req.params.id);
    if (!booking) booking = await RestaurantBooking.findById(req.params.id);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== "cancelled") {
      return res.status(400).json({ error: "Only cancelled bookings can be refunded" });
    }

    booking.refundStatus = "refunded";
    await booking.save();

    // Notify User
    const customer = booking.username || booking.email;
    if (customer) {
      await Notification.create({
        recipient: customer,
        role: "user",
        type: "booking",
        message: `Your requested refund for ${booking.propertyName || 'the property'} has been processed successfully.`
      });
    }

    res.json({ message: "Refund processed successfully", booking });
  } catch (err) {
    console.error("Error processing refund:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --------------------
// NOTIFICATIONS
// GET /api/owner/notifications?owner=OwnerName
// --------------------
router.get("/notifications", async (req, res) => {
  try {
    const owner = req.query.owner;
    if (!owner) return res.status(400).json({ error: "owner is required" });
    const notifications = await Notification.find({ 
        $or: [{ recipient: owner }, { recipient: "all_owner" }, { recipient: "all_owners" }],
        role: "owner" 
    }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/owner/notifications/:id/read
router.put("/notifications/:id/read", async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --------------------
// SETTINGS
// PUT /api/owner/profile
// --------------------
router.put("/profile", async (req, res) => {
  try {
    const { owner, name, currentPassword, newPassword } = req.body;
    if (!owner) return res.status(400).json({ error: "owner is required" });

    const ownerDoc = await Owner.findOne({ username: owner });
    if (!ownerDoc) return res.status(404).json({ error: "Owner not found" });

    if (name) ownerDoc.name = name;

    if (currentPassword && newPassword) {
      const isMatch = await ownerDoc.comparePassword(currentPassword);
      if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });
      ownerDoc.password = newPassword; // gets hashed in pre-save hook
    }

    await ownerDoc.save();
    res.json({ message: "Profile updated successfully", owner: { name: ownerDoc.name, username: ownerDoc.username } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
