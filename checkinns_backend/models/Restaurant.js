import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, default: 0 },
    numberOfReviews: { type: Number, default: 0 },
    mainImage: String,
    images: [String],
    description: String,
    cuisines: [String], // e.g. ["Italian", "Pakistani", "Chinese"]
    priceRange: String, // e.g. "$$", "$$$"
    owner: { type: String }, // Optional owner identifier
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
