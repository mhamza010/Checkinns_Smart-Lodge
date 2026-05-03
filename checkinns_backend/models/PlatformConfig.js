import mongoose from "mongoose";

const platformConfigSchema = new mongoose.Schema({
  loyaltyPointsPerDollar: { type: Number, default: 0.1 }, // 10% conversion
  platformServiceFeePercent: { type: Number, default: 5 }, // 5% flat fee
  bookingCommissionPercent: { type: Number, default: 10 }, // 10% commission on every booking
  propertyOwnerMonthlyPercent: { type: Number, default: 15 }, // 15% monthly subscription fee
  silverPackagePrice: { type: Number, default: 50 },
  goldPackagePrice: { type: Number, default: 100 },
  premiumPackagePrice: { type: Number, default: 200 },
  maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("PlatformConfig", platformConfigSchema);
