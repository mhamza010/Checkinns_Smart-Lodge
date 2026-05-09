// routes/restaurantRoutes.js
import express from "express";
import Restaurant from "../models/Restaurant.js";

const router = express.Router();

// ✅ Get all restaurants
router.get("/", async (req, res) => {
  try {
    const { owner } = req.query;
    const filter = owner ? { owner } : { isApproved: { $ne: false } };
    const restaurants = await Restaurant.find(filter).lean();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get restaurant by ID
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    // Track View for Boosted Performance
    if (restaurant.boostData?.isBoosted) {
      restaurant.boostData.views = (restaurant.boostData.views || 0) + 1;
      await restaurant.save();
    }

    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Create restaurant
router.post("/", async (req, res) => {
  try {
    const doc = new Restaurant(req.body);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Invalid restaurant data", details: err.message });
  }
});

// ✅ Update restaurant
router.put("/:id", async (req, res) => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Restaurant not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Invalid restaurant data", details: err.message });
  }
});

// ✅ Delete restaurant
router.delete("/:id", async (req, res) => {
  try {
    const del = await Restaurant.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: "Restaurant not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
