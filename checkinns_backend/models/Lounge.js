import mongoose from "mongoose";

const loungeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, default: 0 },
    numberOfReviews: { type: Number, default: 0 },
    mainImage: String,
    images: [String],
    description: String,
    features: [String], // e.g. ["Live Music", "VIP Area", "Cocktails"]
    priceRange: String,
    owner: { type: String }, // Optional owner identifier
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Lounge = mongoose.model("Lounge", loungeSchema);
export default Lounge;
