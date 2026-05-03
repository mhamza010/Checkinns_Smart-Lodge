import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: { type: String, required: true },
  userType: { type: String, enum: ["user", "owner", "admin", "system"], default: "system" },
  userId: { type: mongoose.Schema.Types.ObjectId },
  revenue: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("AuditLog", auditLogSchema);
