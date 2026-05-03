// routes/bookingRoutes.js
import express from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js"; // Hotel bookings
import LoungeBooking from "../models/LoungeBooking.js"; // Lounge bookings
import RestaurantBooking from "../models/RestaurantBooking.js"; // Restaurant bookings
import Hotel from "../models/Hotel.js";


const router = express.Router();

// ✅ Check Room Availability per date range
router.post("/check-availability", async (req, res) => {
  try {
    const { hotel, roomName, checkIn, checkOut } = req.body;
    if (!hotel || !roomName || !checkIn || !checkOut) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const hotelDoc = await Hotel.findById(hotel);
    if (!hotelDoc) return res.status(404).json({ error: "Hotel not found" });

    const roomDoc = hotelDoc.rooms.find(r => r.name === roomName);
    if (!roomDoc) return res.status(404).json({ error: "Room not found" });

    const totalRooms = roomDoc.totalRooms || 10;
    const inDateMid = new Date(checkIn);
    inDateMid.setHours(0, 0, 0, 0);
    const outDateMid = new Date(checkOut);
    outDateMid.setHours(0, 0, 0, 0);

    const overlappingBookings = await Booking.find({
      hotel: hotelDoc._id,
      "room.name": roomName,
      checkIn: { $lt: outDateMid },
      checkOut: { $gt: inDateMid },
      paymentStatus: { $nin: ["failed", "canceled"] },
      status: { $ne: "rejected" } // Do not count rejected bookings as occupying a room
    });

    const roomsAvailable = totalRooms - overlappingBookings.length;
    res.json({ available: roomsAvailable > 0, roomsAvailable, totalRooms });
  } catch (err) {
    console.error("Avail check error:", err);
    res.status(500).json({ error: "Server error during availability check" });
  }
});

// ✅ Create booking (hotel OR lounge)
router.post("/", async (req, res) => {
  try {
    if (req.body.type === "hotel") {
      // 🏨 HOTEL BOOKING LOGIC
      const { username, hotel, room, checkIn, checkOut, amenities } = req.body;

      // Basic required checks
      if (!username || !hotel || !room || !checkIn || !checkOut) {
        return res.status(400).json({ error: "Missing required fields for hotel booking" });
      }

      // Validate dates: check-in today or later, check-out after check-in (at least 1 night)
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      const inDateMid = new Date(inDate);
      const outDateMid = new Date(outDate);
      inDateMid.setHours(0, 0, 0, 0);
      outDateMid.setHours(0, 0, 0, 0);
      if (inDateMid < now) {
        return res.status(400).json({ error: "Check-in cannot be in the past" });
      }
      if (outDateMid <= inDateMid) {
        return res.status(400).json({ error: "Check-out must be after check-in" });
      }

      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
      );

      if (isNaN(nights) || nights <= 0) {
        return res
          .status(400)
          .json({ error: "Invalid check-in/check-out dates" });
      }

      // --- Room Availability Logic ---
      const hotelDoc = await Hotel.findById(hotel);
      if (!hotelDoc) {
        return res.status(404).json({ error: "Hotel not found" });
      }

      const roomDoc = hotelDoc.rooms.find(r => r.name === room.name);
      if (!roomDoc) {
        return res.status(400).json({ error: "Room not found in this hotel" });
      }

      const totalRooms = roomDoc.totalRooms || 10;

      // Check overlapping bookings
      const overlappingBookings = await Booking.find({
        hotel: hotelDoc._id,
        "room.name": room.name,
        checkIn: { $lt: outDateMid },
        checkOut: { $gt: inDateMid },
        paymentStatus: { $nin: ["failed", "canceled"] }
      });

      if (overlappingBookings.length >= totalRooms) {
        return res.status(400).json({ error: "Fully Booked" });
      }
      // -----------------------------

      const roomPrice = Number(room?.price) || 0;
      const roomTotal = roomPrice * nights;

      const amenitiesTotal = (amenities || []).reduce(
        (sum, a) => sum + ((Number(a?.price) || 0) * nights),
        0
      );

      const tax = 0.15 * (roomTotal + amenitiesTotal);
      const totalPrice = roomTotal + amenitiesTotal + tax;

      const booking = new Booking({
        username,
        hotel,
        room,
        checkIn,
        checkOut,
        nights,
        amenities,
        roomTotal,
        amenitiesTotal,
        tax,
        totalPrice,
      });

      await booking.save();
      return res.status(201).json(booking);
    }

    if (req.body.type === "restaurant") {
      // 🍽️ RESTAURANT BOOKING LOGIC
      const {
        restaurant,
        date,
        time,
        guests,
        tablePref,
        specialRequests,
        firstName,
        lastName,
        email,
        phone,
        username,
      } = req.body;

      // Required validations
      if (!restaurant || !date || !time || !guests || !firstName || !lastName || !email) {
        return res.status(400).json({ error: "Missing required fields for restaurant booking" });
      }
      const when = new Date(date);
      if (isNaN(when.getTime())) {
        return res.status(400).json({ error: "Invalid reservation date" });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const resDateMid = new Date(when);
      resDateMid.setHours(0, 0, 0, 0);
      if (resDateMid < today) {
        return res.status(400).json({ error: "Reservation date cannot be in the past" });
      }

      const guestCount = parseInt(guests, 10) || 0;
      if (guestCount <= 0) {
        return res.status(400).json({ error: "Guests must be greater than 0" });
      }

      // Optional simple tax calc (can be expanded later)
      const baseSubtotal = 0;
      const tax = 0;
      const totalPrice = baseSubtotal + tax;

      const booking = new RestaurantBooking({
        restaurant,
        date,
        time,
        guests: guestCount,
        tablePref,
        specialRequests,
        firstName,
        lastName,
        email,
        phone,
        username,
        subtotal: baseSubtotal,
        tax,
        totalPrice,
      });

      await booking.save();
      return res.status(201).json(booking);
    }

    if (req.body.type === "lounge") {
      // 🍸 LOUNGE BOOKING LOGIC
      const {
        lounge,
        date,
        time,
        guests,
        vipList,
        requests,
        firstName,
        lastName,
        email,
        phone,
        username,
      } = req.body;

      // Required validations
      if (!lounge || !date || !time || !guests || !firstName || !lastName || !email) {
        return res.status(400).json({ error: "Missing required fields for lounge booking" });
      }
      const when = new Date(date);
      if (isNaN(when.getTime())) {
        return res.status(400).json({ error: "Invalid lounge date" });
      }
      const todayL = new Date();
      todayL.setHours(0, 0, 0, 0);
      const loungeDateMid = new Date(when);
      loungeDateMid.setHours(0, 0, 0, 0);
      if (loungeDateMid < todayL) {
        return res.status(400).json({ error: "Lounge date cannot be in the past" });
      }

      const guestCount = parseInt(guests, 10) || 0;
      if (guestCount <= 0) {
        return res.status(400).json({ error: "Guests must be greater than 0" });
      }
      const vipCount = vipList ? vipList.split(",").length : 0;

      const guestCost = guestCount * 100; // Example: $100 per guest
      const vipCost = vipCount * 200; // Example: $200 per VIP
      const tax = 0.15 * (guestCost + vipCost);
      const totalPrice = guestCost + vipCost + tax;

      const booking = new LoungeBooking({
        lounge,
        date,
        time,
        guests: guestCount,
        vipList,
        requests,
        firstName,
        lastName,
        email,
        phone,
        username,
        guestCost,
        vipCost,
        tax,
        totalPrice,
      });

      await booking.save();
      return res.status(201).json(booking);
    }

    return res.status(400).json({ error: "Invalid booking type" });
  } catch (err) {
    console.error("❌ Booking error:", err);
    res.status(500).json({ error: "Booking failed" });
  }
});

// ✅ Get booking by ID (works for both models)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid booking id format" });
    }
    let booking =
      (await Booking.findById(id).populate("hotel")) ||
      (await RestaurantBooking.findById(id).populate("restaurant")) ||
      (await LoungeBooking.findById(id).populate("lounge"));

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
