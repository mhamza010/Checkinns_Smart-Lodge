import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Fraud Tracking
  cancellationsCount: { type: Number, default: 0 },
  isFraud: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving
ownerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
ownerSchema.methods.comparePassword = async function (plainPassword) {
  return await bcryptjs.compare(plainPassword, this.password);
};

export default mongoose.model("Owner", ownerSchema);
