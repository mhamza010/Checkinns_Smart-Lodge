import mongoose from "mongoose";
import Hotel from "./models/Hotel.js";

const MONGO_URI = "mongodb+srv://muhammadhamza662c:vqGoA5nWO6hVYZ49@hotel-project.tputjmq.mongodb.net/checkinns_db?retryWrites=true&w=majority&appName=Hotel-project";

const seedHotels = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    // Clear old data
    await Hotel.deleteMany();

    // Insert hotels with images + rooms
    await Hotel.insertMany([
      {
        name: "Pearl Continental Hotel",
        location: "Lahore, Pakistan",
        pricePerNight: 120,
        amenities: ["Free WiFi", "Swimming Pool", "Breakfast", "Parking"],
        images: [
          "https://via.placeholder.com/400x250?text=PC+Front",
          "https://via.placeholder.com/400x250?text=PC+Lobby"
        ],
        description: "A luxury 5-star hotel in the heart of Lahore.",
        rooms: [
          { name: "Deluxe Room", description: "Spacious and modern.", price: 120 },
          { name: "Executive Suite", description: "Premium comfort.", price: 200 }
        ]
      },
      {
        name: "Serena Hotel",
        location: "Islamabad, Pakistan",
        pricePerNight: 150,
        amenities: ["Spa", "Gym", "Airport Pickup"],
        images: [
          "https://via.placeholder.com/400x250?text=Serena+Ext",
          "https://via.placeholder.com/400x250?text=Serena+Room"
        ],
        description: "An elegant hotel with mountain views.",
        rooms: [
          { name: "Standard Room", description: "Cozy and well furnished.", price: 150 },
          { name: "Presidential Suite", description: "Luxurious stay with a view.", price: 300 }
        ]
      },
      {
        name: "Marriott Hotel",
        location: "Karachi, Pakistan",
        pricePerNight: 100,
        amenities: ["Free WiFi", "Restaurant", "Conference Hall"],
        images: [
          "https://via.placeholder.com/400x250?text=Marriott+Front",
          "https://via.placeholder.com/400x250?text=Marriott+Room"
        ],
        description: "Perfect for business trips and family stays.",
        rooms: [
          { name: "Business Room", description: "Ideal for work trips.", price: 100 },
          { name: "Family Suite", description: "Spacious for families.", price: 180 }
        ]
      }
    ]);

    console.log("✅ Hotels seeded successfully with images & rooms!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding hotels:", err);
    process.exit(1);
  }
};

seedHotels();
