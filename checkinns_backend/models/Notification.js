import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: String, required: true }, // username or email of the recipient
    role: { type: String, enum: ["user", "owner", "admin"] },
    type: { type: String }, // 'booking', 'review', 'system'
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
