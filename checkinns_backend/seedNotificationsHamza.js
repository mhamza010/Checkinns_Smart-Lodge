import mongoose from "mongoose";
import Notification from "./models/Notification.js";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const seedNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/checkinns");
    console.log("Connected to MongoDB");

    const email = "hamza@test.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User hamza@test.com not found. Please create it first.");
      process.exit(1);
    }

    const dummyNotifications = [
      {
        recipient: email,
        role: "user",
        type: "booking",
        message: "Your booking at Grand Hyatt has been confirmed!",
        isRead: false
      },
      {
        recipient: email,
        role: "user",
        type: "review",
        message: "Your review for 'The Spice Garden' is now live.",
        isRead: false
      },
      {
        recipient: email,
        role: "user",
        type: "system",
        message: "Welcome to CheckInns! Explore our new features.",
        isRead: true
      },
      {
        recipient: email,
        role: "user",
        type: "booking",
        message: "A new message from 'Skyline Lounge' regarding your reservation.",
        isRead: false
      }
    ];

    await Notification.insertMany(dummyNotifications);
    console.log("Dummy notifications seeded successfully for hamza@test.com");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding notifications:", err);
    process.exit(1);
  }
};

seedNotifications();
