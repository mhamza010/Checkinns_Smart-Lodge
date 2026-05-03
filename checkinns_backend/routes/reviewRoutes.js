import express from "express";
import Review from "../models/Review.js";
import authMiddleware from "../middleware/auth.js";
import Hotel from "../models/Hotel.js";
import Restaurant from "../models/Restaurant.js";
import Lounge from "../models/Lounge.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get all reviews for a property
router.get("/:propertyId", async (req, res) => {
    try {
        const reviews = await Review.find({ propertyId: req.params.propertyId }).populate("user", "name username");
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// Add a review
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { propertyId, onModel, rating, comment } = req.body;

        if (!propertyId || !onModel || !rating || !comment) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const review = new Review({
            user: req.user.id,
            propertyId,
            onModel,
            rating: Number(rating),
            comment
        });

        await review.save();

        try {
            let prop;
            if (onModel === "Hotel") prop = await Hotel.findById(propertyId);
            else if (onModel === "Restaurant") prop = await Restaurant.findById(propertyId);
            else if (onModel === "Lounge") prop = await Lounge.findById(propertyId);

            if (prop && prop.owner) {
                await Notification.create({
                    recipient: prop.owner,
                    role: "owner",
                    type: "new_review",
                    message: `You received a new ${rating}-star review for ${prop.name}!`
                });
            }
        } catch(err) { console.error("Review Notif error", err); }

        res.status(201).json({ message: "Review added successfully!", review });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "You have already reviewed this property." });
        }
        res.status(500).json({ error: "Failed to add review" });
    }
});

export default router;
