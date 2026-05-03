import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "onModel" },
    onModel: { type: String, required: true, enum: ["Hotel", "Restaurant", "Lounge"] },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
}, { timestamps: true });

// Ensure a user can only review a specific property once
reviewSchema.index({ user: 1, propertyId: 1 }, { unique: true });

// Calculate average rating
reviewSchema.statics.calcAverageRating = async function (propertyId, onModel) {
    const stats = await this.aggregate([
        { $match: { propertyId: propertyId } },
        { $group: { _id: "$propertyId", nRating: { $sum: 1 }, avgRating: { $avg: "$rating" } } }
    ]);

    const targetModel = mongoose.model(onModel);
    if (stats.length > 0) {
        await targetModel.findByIdAndUpdate(propertyId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            numberOfReviews: stats[0].nRating
        });
    } else {
        await targetModel.findByIdAndUpdate(propertyId, {
            rating: 0,
            numberOfReviews: 0
        });
    }
};

reviewSchema.post("save", function () {
    this.constructor.calcAverageRating(this.propertyId, this.onModel);
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
