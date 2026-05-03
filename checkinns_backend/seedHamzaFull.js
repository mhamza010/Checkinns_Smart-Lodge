import mongoose from "mongoose";
import User from "./models/User.js";
import Notification from "./models/Notification.js";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import connectDB from "./config/db.js";

dotenv.config();

const seedHamza = async () => {
    try {
        await connectDB();

        const email = "hamza@test.com";

        // Create or update user
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: "Hamza",
                username: "hamza_test",
                email: email,
                password: "12345678"
            });
            console.log("User hamza@test.com created.");
        } else {
            user.password = "12345678";
            await user.save();
            console.log("User hamza@test.com updated with correct password.");
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
        console.error("Error seeding hamza:", err);
        process.exit(1);
    }
};

seedHamza();
