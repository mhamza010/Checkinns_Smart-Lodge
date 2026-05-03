import mongoose from "mongoose";
import User from "./models/User.js";
import Owner from "./models/Owner.js";
import Hotel from "./models/Hotel.js";
import Restaurant from "./models/Restaurant.js";
import Lounge from "./models/Lounge.js";
import Booking from "./models/Booking.js";

const MONGO_URI = "mongodb+srv://muhammadhamza662c:vqGoA5nWO6hVYZ49@hotel-project.tputjmq.mongodb.net/checkinns_db?retryWrites=true&w=majority&appName=Hotel-project";

const seedComplete = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear all collections
    await User.deleteMany();
    await Owner.deleteMany();
    await Hotel.deleteMany();
    await Restaurant.deleteMany();
    await Lounge.deleteMany();
    await Booking.deleteMany();
    console.log("🗑️  Cleared all collections");

    // ========== CREATE USERS ==========
    const users = await User.insertMany([
      {
        name: "Ahmed Hassan",
        email: "ahmed@example.com",
        username: "ahmed123",
        password: "password123",
        preferences: {
          roomType: "Royal Suite",
          cuisine: "Pakistani",
          loungeType: "VIP"
        }
      },
      {
        name: "Fatima Khan",
        email: "fatima@example.com",
        username: "fatima123",
        password: "password123",
        preferences: {
          roomType: "Deluxe",
          cuisine: "Italian",
          loungeType: "Rooftop"
        }
      },
      {
        name: "Ali Ahmed",
        email: "ali@example.com",
        username: "ali123",
        password: "password123",
        preferences: {
          roomType: "Executive Suite",
          cuisine: "French",
          loungeType: "Classic"
        }
      },
      {
        name: "Sara Muhammad",
        email: "sara@example.com",
        username: "sara123",
        password: "password123",
        preferences: {
          roomType: "Standard",
          cuisine: "Chinese",
          loungeType: "VIP"
        }
      },
      {
        name: "Hassan Raza",
        email: "hassan@example.com",
        username: "hassan123",
        password: "password123",
        preferences: {
          roomType: "Luxury Suite",
          cuisine: "Pakistani",
          loungeType: "Rooftop"
        }
      }
    ]);
    console.log("👥 Added 5 users");

    // ========== CREATE OWNERS ==========
    const owners = await Owner.insertMany([
      {
        name: "Luxury Hotels Group",
        email: "luxury@hotels.com",
        password: "password123",
        username: "luxuryhotels"
      },
      {
        name: "Premium Dining Co",
        email: "premium@dining.com",
        password: "password123",
        username: "premiumdining"
      },
      {
        name: "Elite Lounges Ltd",
        email: "elite@lounges.com",
        password: "password123",
        username: "elitelounges"
      },
      {
        name: "Grand Properties",
        email: "grand@properties.com",
        password: "password123",
        username: "grandproperties"
      }
    ]);
    console.log("👨‍💼 Added 4 owners");

    // ========== CREATE HOTELS ==========
    const hotels = await Hotel.insertMany([
      {
        owner: owners[0]._id,
        name: "The Ritz-Carlton Riyadh",
        location: "Riyadh, Saudi Arabia",
        pricePerNight: 250,
        amenities: [
          { name: "5-Star Spa" },
          { name: "Olympic Pool" },
          { name: "24/7 Concierge" },
          { name: "Michelin Restaurant" }
        ],
        images: ["https://via.placeholder.com/400x250?text=Ritz+Riyadh+1", "https://via.placeholder.com/400x250?text=Ritz+Riyadh+2"],
        description: "Ultra-luxury 5-star hotel in the heart of Riyadh",
        rooms: [
          { name: "Royal Suite", description: "Presidential luxury", price: 250 },
          { name: "Deluxe Room", description: "Premium comfort", price: 180 }
        ]
      },
      {
        owner: owners[0]._id,
        name: "Burj Al Arab Jumeirah",
        location: "Dubai, UAE",
        pricePerNight: 400,
        amenities: [
          { name: "Private Beach" },
          { name: "Underwater Restaurant" },
          { name: "Gold Service" },
          { name: "Helipad" }
        ],
        images: ["https://via.placeholder.com/400x250?text=Burj+1", "https://via.placeholder.com/400x250?text=Burj+2"],
        description: "World-renowned luxury hotel with iconic architecture",
        rooms: [
          { name: "Two-Bedroom Suite", description: "Panoramic sea view", price: 400 },
          { name: "Royal Suite", description: "Exclusive penthouse", price: 600 }
        ]
      },
      {
        owner: owners[3]._id,
        name: "Pearl Continental Lahore",
        location: "Lahore, Pakistan",
        pricePerNight: 120,
        amenities: [
          { name: "Swimming Pool" },
          { name: "Fitness Center" },
          { name: "Restaurant" },
          { name: "Free WiFi" }
        ],
        images: ["https://via.placeholder.com/400x250?text=PC+Lahore+1", "https://via.placeholder.com/400x250?text=PC+Lahore+2"],
        description: "Elegant hotel in the heart of Lahore",
        rooms: [
          { name: "Standard Room", description: "Comfortable stay", price: 120 },
          { name: "Executive Suite", description: "Spacious suite", price: 180 }
        ]
      }
    ]);
    console.log("🏨 Added 3 hotels");

    // ========== CREATE RESTAURANTS ==========
    const restaurants = await Restaurant.insertMany([
      {
        owner: owners[1]._id,
        name: "Nobu Restaurant",
        location: "Dubai, UAE",
        cuisine: "Japanese",
        priceRange: "$$$$",
        amenities: ["Michelin Star", "Private Dining", "Chef's Table"],
        images: ["https://via.placeholder.com/400x250?text=Nobu+1", "https://via.placeholder.com/400x250?text=Nobu+2"],
        description: "World-class Japanese fine dining",
        seatsAvailable: 80
      },
      {
        owner: owners[1]._id,
        name: "Royal Biryani House",
        location: "Lahore, Pakistan",
        cuisine: "Pakistani",
        priceRange: "$$$",
        amenities: ["Family Dining", "Takeaway", "Catering"],
        images: ["https://via.placeholder.com/400x250?text=Biryani+1", "https://via.placeholder.com/400x250?text=Biryani+2"],
        description: "Authentic Pakistani cuisine",
        seatsAvailable: 120
      },
      {
        owner: owners[3]._id,
        name: "Trattoria Italiana",
        location: "Islamabad, Pakistan",
        cuisine: "Italian",
        priceRange: "$$$",
        amenities: ["Wine Selection", "Private Rooms", "Chef Specials"],
        images: ["https://via.placeholder.com/400x250?text=Italian+1", "https://via.placeholder.com/400x250?text=Italian+2"],
        description: "Authentic Italian dining experience",
        seatsAvailable: 100
      }
    ]);
    console.log("🍽️  Added 3 restaurants");

    // ========== CREATE LOUNGES ==========
    const lounges = await Lounge.insertMany([
      {
        owner: owners[2]._id,
        name: "The Sky Lounge",
        location: "Dubai, UAE",
        type: "Rooftop",
        capacity: 200,
        amenities: ["VIP Sections", "Live DJ", "Premium Bar", "City View"],
        images: ["https://via.placeholder.com/400x250?text=Sky+Lounge+1", "https://via.placeholder.com/400x250?text=Sky+Lounge+2"],
        description: "Exclusive rooftop lounge with panoramic views",
        pricePerPerson: 50
      },
      {
        owner: owners[2]._id,
        name: "The Velvet Club",
        location: "Lahore, Pakistan",
        type: "VIP Lounge",
        capacity: 150,
        amenities: ["Private Booths", "Live Music", "Premium Spirits", "Hookah Bar"],
        images: ["https://via.placeholder.com/400x250?text=Velvet+1", "https://via.placeholder.com/400x250?text=Velvet+2"],
        description: "Premium VIP lounge with exclusive ambiance",
        pricePerPerson: 35
      },
      {
        owner: owners[3]._id,
        name: "Darbar-e-Noor",
        location: "Islamabad, Pakistan",
        type: "Luxury Lounge",
        capacity: 180,
        amenities: ["Shisha", "Live Band", "Premium Seating", "Desi Vibes"],
        images: ["https://via.placeholder.com/400x250?text=Darbar+1", "https://via.placeholder.com/400x250?text=Darbar+2"],
        description: "Luxury lounge with traditional ambiance",
        pricePerPerson: 30
      }
    ]);
    console.log("🎵 Added 3 lounges");

    // ========== CREATE BOOKINGS ==========
    const now = new Date();
    const bookings = await Booking.insertMany([
      {
        username: "ahmed123",
        hotel: hotels[0]._id,
        room: { name: "Royal Suite", price: 250 },
        checkIn: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        checkOut: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        nights: 5,
        roomTotal: 1250,
        amenitiesTotal: 0,
        tax: 125,
        totalPrice: 1375,
        paymentStatus: "succeeded"
      },
      {
        username: "fatima123",
        hotel: hotels[1]._id,
        room: { name: "Two-Bedroom Suite", price: 400 },
        checkIn: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        checkOut: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        nights: 5,
        roomTotal: 2000,
        amenitiesTotal: 100,
        tax: 210,
        totalPrice: 2310,
        paymentStatus: "succeeded"
      },
      {
        username: "ali123",
        hotel: hotels[2]._id,
        room: { name: "Standard Room", price: 120 },
        checkIn: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        checkOut: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        nights: 3,
        roomTotal: 360,
        amenitiesTotal: 0,
        tax: 36,
        totalPrice: 396,
        paymentStatus: "succeeded"
      },
      {
        username: "sara123",
        hotel: hotels[1]._id,
        room: { name: "Royal Suite", price: 600 },
        checkIn: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        checkOut: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
        nights: 5,
        roomTotal: 3000,
        amenitiesTotal: 200,
        tax: 320,
        totalPrice: 3520,
        paymentStatus: "pending"
      },
      {
        username: "hassan123",
        hotel: hotels[0]._id,
        room: { name: "Deluxe Room", price: 180 },
        checkIn: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        checkOut: new Date(now.getTime() + 48 * 24 * 60 * 60 * 1000),
        nights: 3,
        roomTotal: 540,
        amenitiesTotal: 0,
        tax: 54,
        totalPrice: 594,
        paymentStatus: "pending"
      }
    ]);
    console.log("📅 Added 10 bookings");

    // Update user favorites
    await User.updateOne(
      { _id: users[0]._id },
      { 
        favorites: {
          hotels: [hotels[0]._id],
          restaurants: [restaurants[0]._id],
          lounges: [lounges[0]._id]
        }
      }
    );

    await User.updateOne(
      { _id: users[1]._id },
      { 
        favorites: {
          hotels: [hotels[1]._id],
          restaurants: [restaurants[1]._id],
          lounges: [lounges[0]._id]
        }
      }
    );

    console.log("⭐ Updated user favorites");

    console.log("\n✅ SEEDING COMPLETE!");
    console.log("📊 Summary:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Owners: ${owners.length}`);
    console.log(`   - Hotels: ${hotels.length}`);
    console.log(`   - Restaurants: ${restaurants.length}`);
    console.log(`   - Lounges: ${lounges.length}`);
    console.log(`   - Bookings: ${bookings.length}`);
    console.log("\n🔐 Test Credentials:");
    console.log("   User: ahmed@example.com / password123");
    console.log("   Owner: luxuryhotels / password123");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedComplete();
