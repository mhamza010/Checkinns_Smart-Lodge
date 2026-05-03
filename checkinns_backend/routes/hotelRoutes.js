import express from "express";
import Hotel from "../models/Hotel.js";

const router = express.Router();

// ✅ Get all hotels
router.get("/", async (req, res) => {
  try {
    const { owner } = req.query;
    const filter = owner ? { owner } : { isApproved: { $ne: false } };
    const hotels = await Hotel.find(filter).lean();
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get single hotel by ID
router.get("/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Add a new hotel (for owner dashboard later)
router.post("/", async (req, res) => {
  try {
    const newHotel = new Hotel(req.body);
    await newHotel.save();
    res.status(201).json(newHotel);
  } catch (err) {
    res.status(400).json({ error: "Invalid hotel data", details: err.message });
  }
});

// ✅ Update hotel
router.put("/:id", async (req, res) => {
  try {
    const updated = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Hotel not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Invalid hotel data", details: err.message });
  }
});

// ✅ Delete hotel
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Hotel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Hotel not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Rooms: add
router.post("/:id/rooms", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    hotel.rooms.push({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      totalRooms: req.body.totalRooms || 10
    });
    await hotel.save();
    res.status(201).json(hotel);
  } catch (err) {
    res.status(400).json({ error: "Invalid room data", details: err.message });
  }
});

// ✅ Rooms: update
router.put("/:id/rooms/:roomId", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    const room = hotel.rooms.id(req.params.roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    room.set(req.body);
    await hotel.save();
    res.json(hotel);
  } catch (err) {
    res.status(400).json({ error: "Invalid room data", details: err.message });
  }
});

// ✅ Rooms: delete
router.delete("/:id/rooms/:roomId", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    const room = hotel.rooms.id(req.params.roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    room.remove();
    await hotel.save();
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
