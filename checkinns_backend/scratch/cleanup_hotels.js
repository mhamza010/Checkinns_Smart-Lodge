import mongoose from "mongoose";
import Hotel from "../models/Hotel.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://muhammadhamza662c:vqGoA5nWO6hVYZ49@hotel-project.tputjmq.mongodb.net/checkinns_db?retryWrites=true&w=majority&appName=Hotel-project";

const updateHotels = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        // Find hotels that look like test entries or have generic names
        const testHotels = await Hotel.find({
            $or: [
                { name: /ABC/i },
                { name: /DEF/i },
                { name: /ftgyhuji/i },
                { name: /hotel 1/i },
                { name: /32333323/i },
                { name: /2a/i },
                { name: /Hama/i }
            ]
        });

        console.log(`Found ${testHotels.length} test hotels to clean up.`);

        for (const hotel of testHotels) {
            await Hotel.findByIdAndDelete(hotel._id);
            console.log(`Deleted test hotel: ${hotel.name}`);
        }

        // Ensure we have some top-tier hotels at the "front line" (featured/boosted)
        // We'll update some existing high-quality hotels to be more prominent
        
        const bestHotels = [
            {
                name: "The Waldorf Astoria",
                location: "Kuwait City",
                country: "Kuwait",
                mainImage: "/images/WALDORF ASTORIA_Hotel_Exterior.webp",
                isFeatured: true,
                isBoosted: true,
                rating: 4.9,
                pricePerNight: 450
            },
            {
                name: "Burj Al Arab Jumeirah",
                location: "Dubai",
                country: "UAE",
                mainImage: "/images/burj al arab 7.jpg",
                isFeatured: true,
                isBoosted: true,
                rating: 5.0,
                pricePerNight: 1200
            },
            {
                name: "The Ritz-Carlton",
                location: "Riyadh",
                country: "Saudi Arabia",
                mainImage: "/images/The Ritz-Carlton Riyadh external.webp",
                isFeatured: true,
                rating: 4.9,
                pricePerNight: 550
            }
        ];

        for (const best of bestHotels) {
            await Hotel.findOneAndUpdate(
                { name: best.name },
                { $set: best },
                { upsert: true, new: true }
            );
            console.log(`Updated/Created premium hotel: ${best.name}`);
        }

        console.log("Hotel cleanup and premium update complete.");
        process.exit(0);
    } catch (err) {
        console.error("Error during hotel update:", err);
        process.exit(1);
    }
};

updateHotels();
