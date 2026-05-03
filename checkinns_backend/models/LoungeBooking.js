// models/LoungeBooking.js
import mongoose from "mongoose";

const loungeBookingSchema = new mongoose.Schema(
  {
    lounge: { type: mongoose.Schema.Types.ObjectId, ref: "Lounge", required: true },
    username: { type: String },

    // Guest details
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },

    // Booking details
    date: { type: Date, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    vipList: { type: String },       // Comma-separated names
    requests: { type: String },      // Special requests

    // Cost calculation
    guestCost: { type: Number, default: 0 },
    vipCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ["pending", "requires_payment_method", "processing", "succeeded", "failed", "canceled"], default: "pending" },
    status: { type: String, enum: ["pending", "confirmed", "rejected", "cancelled"], default: "pending" },
    refundStatus: { type: String, enum: ["pending", "refunded"], default: "pending" },
    cancellationReason: { type: String }
  },
  { timestamps: true }
);

const LoungeBooking = mongoose.model("LoungeBooking", loungeBookingSchema);
export default LoungeBooking;
