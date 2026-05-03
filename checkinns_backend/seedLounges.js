// seedLounges.js
import mongoose from "mongoose";
import Lounge from "./models/Lounge.js";
import connectDB from "./config/db.js";

const seedLounges = async () => {
  await connectDB();

  const lounges = [
  {
    name: "Executive Business Lounge",
    location: "Dubai",
    rating: 4.8,
    mainImage: "/images/WALDORF ASTORIA INTERNAL 1.webp",
    images: [
      "/images/WALDORF ASTORIA INTERNAL 1.webp",
      "/images/WALDORF ASTORIA INTERNAL 2.webp",
      "/images/WALDORF ASTORIA INTERNAL 3.webp",
      "/images/WALDORF ASTORIA INTERNAL 4.webp"
    ],
    category: "Business",
    type: "Professional Workspace • 24/7 Access",
    description:
      "Perfect for business meetings and remote work with high-speed internet, conference facilities, and premium coffee service.",
    features: ["Meeting Rooms", "Premium Coffee", "High-Speed WiFi"]
  },
  {
    name: "Family Comfort Lounge",
    location: "Dubai",
    rating: 4.7,
    mainImage: "/images/WALDORF ASTORIA INTERNAL 2.webp",
    images: [
      "/images/Family Lounge interior 1.jpg",
      "/images/Family Lounge interior 2.jpg",
      "/images/Family Lounge interior 3.jpg",
      "/images/Family Lounge interior 4.jpg"
     
    ],
    category: "Family",
    type: "Family-Friendly • Kid's Corner",
    description:
      "Spacious and comfortable lounge designed for families with dedicated play areas, family seating, and kid-friendly refreshments.",
    features: ["Kid's Corner", "Family Seating", "Snacks"]
  },
  {
    name: "Skyline Rooftop Lounge",
    location: "Dubai",
    rating: 4.9,
    mainImage: "/images/Skyline Rooftop Lounge hero.jpg",
    images: [
      "/images/Skyline Rooftop Lounge interior 1.jpg",
      "/images/Skyline Rooftop Lounge interior 2.jpg",
      "/images/Skyline Rooftop Lounge interior 3.jpg",
      "/images/Skyline Rooftop Lounge interior 4.jpg"
    ],
    category: "Premium",
    type: "Exclusive • Sunset Views",
    description:
      "Elegant rooftop lounge with breathtaking city views, craft cocktails, and sophisticated atmosphere for special occasions.",
    features: ["Sunset Views", "Craft Cocktails", "Live Music"]
  },
  {
    name: "Wellness Spa Lounge",
    location: "Dubai",
    rating: 4.6,
    mainImage: "/images/Wellness Spa Lounge interior hero.webp",
    images: [
      "/images/Wellness Spa Lounge interior 1.webp",
      "/images/Wellness Spa Lounge interior 2.jpg",
      "/images/Wellness Spa Lounge interior 3.jpg",
      "/images/Wellness Spa Lounge interior 4.jpg"

    ],
    category: "Wellness",
    type: "Relaxation • Spa Access",
    description:
      "Tranquil lounge connected to spa facilities with herbal teas, relaxation areas, and wellness treatments available.",
    features: ["Meditation", "Herbal Teas", "Spa Access"]
  },
  {
    name: "Sports Bar Lounge",
    location: "Dubai",
    rating: 4.5,
    mainImage: "/images/WALDORF ASTORIA INTERNAL 5.webp",
    images: [
      "/images/Sports Bar Lounge interior hero.jpg",
      "/images/Sports Bar Lounge interior 2.jpg",
      "/images/Sports Bar Lounge interior 3.jpg",
      "/images/Sports Bar Lounge interior 4.jpg"
    ],
    category: "Entertainment",
    type: "Sports • Entertainment",
    description:
      "Dynamic sports bar with multiple screens, game tables, and a lively atmosphere perfect for sports enthusiasts and social gatherings.",
    features: ["Multiple Screens", "Game Tables", "Craft Beer"]
  }
];


  try {
    await Lounge.deleteMany();
    await Lounge.insertMany(lounges);
    console.log("✅ Lounges Seeded!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding lounges:", err);
    process.exit(1);
  }
};

seedLounges();
