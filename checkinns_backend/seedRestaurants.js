// seedRestaurants.js
import mongoose from "mongoose";
import Restaurant from "./models/Restaurant.js";
import connectDB from "./config/db.js";

const seedRestaurants = async () => {
  await connectDB();

  const restaurants = [
  {
    name: "Azure Sky Restaurant",
    location: "Dubai",
    rating: 4.8,
    mainImage: "/images/Azure sky resturant exterior.jpg",
    images: [
      "/images/Azure sky resturant interior 1.jpg",
      "/images/Azure sky resturant interior 2.jpg",
      "/images/Azure sky resturant interior 3.jpg",
      "/images/Azure sky resturant interior 4.jpg"
    ],
    category: "Fine Dining",
    cuisine: "International Fusion",
    priceRange: "$$$",
    description:
      "Elevated dining with panoramic city views and innovative cuisine that blends traditional flavors with modern techniques.",
    features: ["Rooftop Views", "Wine Pairing", "Chef's Table"]
  },
  {
    name: "The Oberoi Beach Resort",
    location: "Dubai",
    rating: 4.7,
    mainImage: "/images/The Oberoi Beach Resort exterior.jpg",
    images: [
      "/images/The Oberoi Beach Resort interior 1.jpg",
      "/images/The Oberoi Beach Resort interior 2.jpg",
      "/images/The Oberoi Beach Resort interior 3.jpg",
      "/images/The Oberoi Beach Resort interior 4.jpg"
    ],
    category: "Seafood Specialists",
    cuisine: "Mediterranean Seafood",
    priceRange: "$$",
    description:
      "Fresh catch of the day prepared with authentic Mediterranean spices and herbs, served in an elegant beachfront setting.",
    features: ["Beachfront", "Fresh Catch", "Organic"]
  },
  {
    name: "Eleven Madison Park",
    location: "New York",
    rating: 5.0,
    mainImage: "/images/Eleven Madison Park exterior.jpg",
    images: [
      "/images/Eleven Madison Park interior 1.jpg",
      "/images/Eleven Madison Park interior 2.webp",
      "/images/Eleven Madison Park interior 3.jpg",
      "/images/Eleven Madison Park interior 4.webp"
    ],
    category: "Michelin Star",
    cuisine: "Plant-Based Fine Dining",
    priceRange: "$$$$",
    description:
      "Globally acclaimed, EMP redefines plant-based haute cuisine with artistry, innovation, and a world-class tasting menu.",
    features: ["3 Michelin Stars", "Seasonal Menus", "Bespoke Wine Pairing"]
  },
  {
    name: "Château Étoile",
    location: "Paris",
    rating: 4.9,
    mainImage: "/images/Château Étoile exterior.jpg",
    images: [
      "/images/Château Étoile interior 1.webp",
      "/images/Château Étoile interior 2.jpg",
      "/images/Château Étoile interior 3.jpg",
      "/images/Château Étoile interior 4.jpg"
    ],
    category: "Wine & Dine",
    cuisine: "European Classics",
    priceRange: "$$$",
    description:
      "Timeless European cuisine in an intimate cellar setting with an extensive wine collection and expert sommelier service.",
    features: ["Wine Cellar", "Prime Cuts", "Intimate"]
  },
  {
    name: "Darbar-e-Noor",
    location: "Lahore",
    rating: 4.6,
    mainImage: "/images/Darbar-e-Noor exterior.avif",
    images: [
      "/images/Darbar-e-Noor interior 1.jpg",
      "/images/Darbar-e-Noor interior 2.jpg",
      "/images/Darbar-e-Noor interior 3.jpg",
      "/images/Darbar-e-Noor interior 4.jpg"
    ],
    category: "Local Cuisine",
    cuisine: "Middle Eastern",
    priceRange: "$$",
    description:
      "Authentic Middle Eastern flavors with traditional recipes passed down through generations, served in a warm, welcoming atmosphere.",
    features: ["Traditional", "Family Style", "Arabic Coffee"]
  },
  {
    name: "Qasr Al-Nakheel",
    location: "Abu Dhabi",
    rating: 4.8,
    mainImage: "/images/Qasr Al-Nakheel exterior.webp",
    images: [
      "/images/Qasr Al-Nakheel interior 1.jpg",
      "/images/Qasr Al-Nakheel interior 2.jpg",
      "/images/Qasr Al-Nakheel interior 3.jpg",
      "/images/Qasr Al-Nakheel interior 4.jpg"
    ],
    category: "Royal Dining",
    cuisine: "Non-Vegetarian Specialties",
    priceRange: "$$$",
    description:
      "A regal dining destination renowned for its signature lamb dishes, rich Arabian flavors, and opulent royal-inspired interiors.",
    features: ["Lamb Specialties", "Royal Ambience", "Signature Dishes"]
  }
];

  try {
    await Restaurant.deleteMany();
    await Restaurant.insertMany(restaurants);
    console.log("✅ Restaurants Seeded!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedRestaurants();
