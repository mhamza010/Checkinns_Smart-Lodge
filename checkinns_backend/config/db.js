// config/db.js
import mongoose from "mongoose";

const CLOUD_MONGO_URI =
  "mongodb+srv://muhammadhamza662c:vqGoA5nWO6hVYZ49@hotel-project.tputjmq.mongodb.net/checkinns_db?retryWrites=true&w=majority&appName=Hotel-project";

const LOCAL_MONGO_URI = "mongodb://localhost:27017/checkinns_db";

const connectDB = async () => {
  let MONGO_URI = process.env.MONGO_URI || CLOUD_MONGO_URI;
  
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected to:", MONGO_URI);
  } catch (err) {
    console.error("❌ Failed to connect to:", MONGO_URI);
    console.log("🔄 Attempting to connect to local MongoDB...");
    
    try {
      await mongoose.connect(LOCAL_MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB connected to local instance");
    } catch (localErr) {
      console.error("❌ MongoDB connection error (both cloud and local failed):", localErr.message);
      console.log("⚠️  Server continuing without database. Some features may not work.");
    }
  }
};

export default connectDB;
