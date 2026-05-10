import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Can be session ID for guests or User ID for logged in
    userName: { type: String, default: "Guest" },
    text: { type: String, required: true },
    senderRole: { type: String, enum: ['user', 'admin'], required: true },
    isRead: { type: Boolean, default: false },
    isAdminReplied: { type: Boolean, default: false }
}, { timestamps: true });

const SupportMessage = mongoose.model("SupportMessage", supportMessageSchema);
export default SupportMessage;
