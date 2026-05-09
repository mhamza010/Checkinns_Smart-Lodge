// routes/loungeRoutes.js
import express from "express";
import Lounge from "../models/Lounge.js";

const router = express.Router();

// GET all lounges
router.get("/", async (req, res) => {
  try {
    const { owner } = req.query;
    const filter = owner ? { owner } : { isApproved: { $ne: false } };
    const lounges = await Lounge.find(filter).lean();
    res.json(lounges);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// GET lounge by ID
router.get("/:id", async (req, res) => {
  try {
    const lounge = await Lounge.findById(req.params.id);
    if (!lounge) return res.status(404).json({ msg: "Lounge not found" });

    // Track View for Boosted Performance
    if (lounge.boostData?.isBoosted) {
      lounge.boostData.views = (lounge.boostData.views || 0) + 1;
      await lounge.save();
    }

    res.json(lounge);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// POST create lounge
router.post("/", async (req, res) => {
  try {
    const doc = new Lounge(req.body);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ msg: "Invalid lounge data", details: err.message });
  }
});

// PUT update lounge
router.put("/:id", async (req, res) => {
  try {
    const updated = await Lounge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "Lounge not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ msg: "Invalid lounge data", details: err.message });
  }
});

// DELETE lounge
router.delete("/:id", async (req, res) => {
  try {
    const del = await Lounge.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ msg: "Lounge not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;  // ✅ Now consistent with ESM
