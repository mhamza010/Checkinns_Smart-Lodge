// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },  // ✅ Add username
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    room: {
      name: String,
      price: Number,
    },
    amenities: [
      {
        name: String,
        price: Number,
      }
    ],
    checkIn: Date,
    checkOut: Date,
    nights: Number,
    roomTotal: Number,
    amenitiesTotal: Number,
    tax: Number,
    totalPrice: Number,
    // Stripe payment tracking
    paymentStatus: { type: String, enum: ["pending", "requires_payment_method", "processing", "succeeded", "failed", "canceled"], default: "pending" },
    paymentIntentId: { type: String },
    // Booking confirmation status
    status: { type: String, enum: ["pending", "confirmed", "rejected", "cancelled"], default: "pending" },
    refundStatus: { type: String, enum: ["pending", "refunded"], default: "pending" },
    cancellationReason: { type: String }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
