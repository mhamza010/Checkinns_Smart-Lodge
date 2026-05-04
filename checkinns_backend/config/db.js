// config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  // Always prioritize environment variable for security
  const MONGO_URI = process.env.MONGO_URI;
  
  if (!MONGO_URI) {
    console.warn("⚠️  MONGO_URI not found in environment. Falling back to local database.");
  }

  const connectionString = MONGO_URI || "mongodb://localhost:27017/checkinns_db";

  try {
    await mongoose.connect(connectionString);
    console.log(`✅ MongoDB connected successfully to ${MONGO_URI ? 'Cloud' : 'Local'}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️  Server continuing, but database-dependent features will fail.");
  }
};

export default connectDB;
