import mongoose from "mongoose";

// Room sub-schema
const roomSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  totalRooms: { type: Number, default: 10 }
});

// Amenity sub-schema
const amenitySchema = new mongoose.Schema({
  name: String,
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 }
});

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    location: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    numberOfReviews: { type: Number, default: 0 },
    mainImage: String,          // 👈 cover image (exterior)
    images: [String],           // 👈 gallery images (detail page)
    amenities: [amenitySchema], // ✅ now objects
    description: String,
    rooms: [roomSchema],
    owner: { type: String }, // Optional owner identifier for dashboard grouping
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    boostData: {
      isBoosted: { type: Boolean, default: false },
      boostStartDate: { type: Date },
      views: { type: Number, default: 0 },
      bookings: { type: Number, default: 0 }
    },
    membershipTier: { type: String, enum: ['standard', 'silver', 'gold', 'premium'], default: 'standard' }
  },
  { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;
