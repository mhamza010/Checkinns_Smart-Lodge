import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: { type: String, required: true },
  senderRole: { type: String, required: true, default: "user" },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
