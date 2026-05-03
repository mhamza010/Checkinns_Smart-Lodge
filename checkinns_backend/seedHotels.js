// seedHotels.js
import mongoose from "mongoose";
import Hotel from "./models/Hotel.js"; // adjust path if needed

const MONGO_URI = "mongodb+srv://muhammadhamza662c:vqGoA5nWO6hVYZ49@hotel-project.tputjmq.mongodb.net/checkinns_db?retryWrites=true&w=majority&appName=Hotel-project";

const hotels = [
  {
    name: "Pearl Continental",
    location: "Lahore",
    country: "Pakistan",
    rating: 4.6,
    pricePerNight: 180,
    mainImage: "/images/pearl continental 1.webp",
    images: ["/images/pc internal1.jpg", "/images/pc internal2.jpg", "/images/pc internal3.webp"],
    description: "5-star comfort in the heart of the city.",
    amenities: [
      { name: "Wi-Fi", isPaid: false },
      { name: "Pool", isPaid: false },
      { name: "Spa", isPaid: true, price: 30 },
      { name: "Restaurant", isPaid: false },
      { name: "Gym", isPaid: false },
      { name: "Airport Shuttle", isPaid: true, price: 25 }
    ],
    rooms: [
      { name: "Standard Room", price: 180, description: "City view, double bed" },
      { name: "Deluxe King Room", price: 220, description: "Spacious king bed with modern decor" },
      { name: "Executive Suite", price: 300, description: "Luxury suite with premium facilities" },
      { name: "Presidential Suite", price: 420, description: "Top floor suite with private lounge" },
      { name: "Royal Suite", price: 550, description: "Elegant suite with personalized services" }
    ]
  },

  {
    name: "Ramada Gulberg",
    location: "Lahore",
    country: "Pakistan",
    rating: 4.5,
    pricePerNight: 160,
    mainImage: "/images/ramada gulberg 2.webp",
    images: ["/images/ramada gulberg internal1.webp", "/images/ramada gulberg internal2.webp", "/images/ramada gulberg internal3.webp"],
    description: "Iconic hotel with unmatched luxury and service.",
    amenities: [
      { name: "Wi-Fi", isPaid: false },
      { name: "Restaurant", isPaid: false },
      { name: "Conference Hall", isPaid: true, price: 75 },
      { name: "Gym", isPaid: false },
      { name: "Spa", isPaid: true, price: 35 },
      { name: "Business Center", isPaid: true, price: 20 }
    ],
    rooms: [
      { name: "Deluxe Room", price: 160, description: "Spacious room with city view" },
      { name: "Family Suite", price: 230, description: "Large suite with two bedrooms" },
      { name: "Luxury Suite", price: 280, description: "Modern decor and premium comfort" },
      { name: "Executive King", price: 320, description: "Business-friendly room with king bed" },
      { name: "Junior Suite", price: 200, description: "Compact suite ideal for couples" }
    ]
  },
  {
    name: "Indigo Lahore",
    location: "Lahore",
    country: "Pakistan",
    rating: 4.4,
    pricePerNight: 150,
    mainImage: "/images/indigo lahore 3.jpg",
    images: ["/images/indigo internal1.jpg", "/images/indigo internal2.jpg", "/images/indigo internal3.jpg"],
    description: "Relax by the pool with stunning views.",
    amenities: [
      { name: "Wi-Fi", isPaid: false },
      { name: "Pool", isPaid: false },
      { name: "Restaurant", isPaid: false },
      { name: "Bar", isPaid: true, price: 20 },
      { name: "Airport Pickup", isPaid: true, price: 35 }
    ],
    rooms: [
      { name: "Standard Room", price: 150, description: "Comfortable double bed" },
      { name: "Deluxe Room", price: 220, description: "Poolside view and premium amenities" },
      { name: "Business Suite", price: 280, description: "Work desk and lounge area for business travelers" },
      { name: "Executive Suite", price: 350, description: "Spacious suite with modern decor" },
      { name: "Penthouse Suite", price: 480, description: "Luxury top-floor suite with skyline view" }
    ]
  },
  {
    name: "The Nishat Hotel Johar Town",
    location: "Lahore",
    country: "Pakistan",
    rating: 4.6,
    pricePerNight: 170,
    mainImage: "/images/nishat lahore 4.jpg",
    images: ["/images/nishat internal1.jpg", "/images/nishat internal1.jpg", "/images/nishat internal1.jpg"],
    description: "Cozy stay in the city.",
    amenities: [
      { name: "Wi-Fi", isPaid: false },
      { name: "Restaurant", isPaid: false },
      { name: "Conference Room", isPaid: true, price: 50 },
      { name: "Valet Parking", isPaid: true, price: 15 },
      { name: "Spa", isPaid: true, price: 40 },
      { name: "Laundry Service", isPaid: true, price: 10 }
    ],
    rooms: [
      { name: "Standard Room", price: 170, description: "Modern room with essential amenities" },
      { name: "Executive Suite", price: 280, description: "Premium suite with city views" },
      { name: "Presidential Suite", price: 400, description: "Top luxury suite with personal service" },
      { name: "Royal Suite", price: 550, description: "Extra-spacious suite with private lounge" },
      { name: "Honeymoon Suite", price: 310, description: "Romantic suite with special touches" }
    ]
  },
    
  {
    name: "Serena Hotel Islamabad",
    location: "Islamabad",
    country: "Pakistan",
    rating: 4.8,
    pricePerNight: 200,
    mainImage: "/images/sarena isb 5.jpg",
    images: ["/images/sarena internal1.jpg", "/images/sarena internal2.jpg", "/images/sarena internal3.jpg"],
    description: "Conveniently located near attractions.",
    amenities: [
      { name: "Wi-Fi", isPaid: false },
      { name: "Pool", isPaid: false },
      { name: "Spa", isPaid: true, price: 40 },
      { name: "Restaurant", isPaid: false },
      { name: "Garden", isPaid: false },
      { name: "Airport Shuttle", isPaid: true, price: 25 }
    ],
    rooms: [
      { name: "Deluxe Room", price: 200, description: "Garden view, double bed" },
      { name: "Luxury Suite", price: 350, description: "Mountain view, premium decor" },
      { name: "Royal Suite", price: 500, description: "Private terrace and butler service" },
      { name: "Presidential Suite", price: 650, description: "Top-tier luxury with private lounge" },
      { name: "Penthouse", price: 800, description: "Exclusive top floor with panoramic views" }
    ]
  },
 {
  name: "Burj Al Arab Jumeirah",
  location: "Dubai",
  country: "UAE",
  rating: 5.0,
  pricePerNight: 1200,
  mainImage: "/images/burj al arab 7.jpg",
  images: [
    "/images/burj internal 1.avif",
    "/images/burj internal 2.avif",
    "/images/burj internal 3.avif",
    "/images/burj internal 4.jpg",
    "/images/burj internal 5.jpg"
  ],
  description: "Iconic 7-star luxury hotel offering unparalleled opulence and service.",
  amenities: [
    { name: "High-Speed Wi-Fi", isPaid: false },
    { name: "Private Beach Access", isPaid: false },
    { name: "Infinity Pool with Arabian Gulf View", isPaid: false },
    { name: "Personal Butler Service", isPaid: false },
    { name: "Talise Spa & Wellness", isPaid: true, price: 150 },
    { name: "Helipad & Helicopter Transfers", isPaid: true, price: 1200 },
    { name: "Chauffeur Service with Rolls-Royce", isPaid: true, price: 500 },
    { name: "Michelin-Starred Dining", isPaid: true, price: 300 },
    { name: "Underwater Aquarium Restaurant", isPaid: true, price: 250 },
    { name: "Exclusive Yacht Excursions", isPaid: true, price: 2000 }
  ],
  rooms: [
    { name: "Royal Suite", price: 1200, description: "Duplex suite with ocean views" },
    { name: "Panoramic Suite", price: 1800, description: "360-degree view of the Arabian Gulf" },
    { name: "Diplomatic Suite", price: 2500, description: "Three bedrooms with private meeting room" },
    { name: "Sky Villa", price: 3200, description: "Private villa in the sky with luxury interiors" },
    { name: "Presidential Suite", price: 4000, description: "Elite level opulence with private elevator" },
    { name: "Penthouse Palace", price: 5500, description: "Unparalleled royal-style residence with staff" }
  ]
},


  {
  name: "Emirates Grand Hotel",
  location: "Dubai",
  country: "UAE",
  rating: 4.3,
  pricePerNight: 220,
  mainImage: "/images/emirated external.jpg",
  images: [
    "/images/emirated internal 1.jpg",
    "/images/emirated internal 2.jpg",
    "/images/emirated internal 3.jpg",
    "/images/emirated internal 4.jpg",
    "/images/emirated internal 5.jpg",
    "/images/emirated internal 6.webp"
  ],
  description: "Luxury apartment-style stay with panoramic views and full hotel services.",
  amenities: [
    { name: "Wi-Fi", isPaid: false },
    { name: "Pool", isPaid: false },
    { name: "Kitchenette", isPaid: false },
    { name: "Gym", isPaid: false },
    { name: "Spa", isPaid: true, price: 60 },
    { name: "Airport Shuttle", isPaid: true, price: 40 },
    { name: "Housekeeping Service", isPaid: true, price: 25 }
  ],
  rooms: [
    { name: "Studio Apartment", price: 220, description: "Compact space with kitchenette" },
    { name: "Executive Apartment", price: 350, description: "Spacious living area with luxury features" },
    { name: "Penthouse Suite", price: 600, description: "Top floor suite with panoramic city views" },
    { name: "Family Suite", price: 480, description: "Large space suitable for families" },
    { name: "Luxury Loft", price: 420, description: "Open-plan loft with designer furnishings" }
  ]
},

  {
  name: "Mövenpick Hotel Bahrain",
  location: "Manama",
  country: "Bahrain",
  rating: 4.5,
  pricePerNight: 210,
  mainImage: "/images/movenpick bahrain external.jpg",
  images: [
    "/images/movenpick bahrain internal 1.webp",
    "/images/movenpick bahrain internal 2.jpg",
    "/images/movenpick bahrain internal 3.jpg",
    "/images/movenpick bahrain internal 4.jpg"
  ],
  description: "Spacious rooms for the whole family.",
  amenities: [
    { name: "Wi-Fi", isPaid: false },
    { name: "Pool", isPaid: false },
    { name: "Restaurant", isPaid: false },
    { name: "Spa", isPaid: true, price: 50 },
    { name: "Kids Club", isPaid: true, price: 30 },
    { name: "Airport Shuttle", isPaid: true, price: 35 },
    { name: "Beach Access", isPaid: true, price: 20 }
  ],
  rooms: [
    { name: "Family Room", price: 210, description: "Large room with family amenities" },
    { name: "Luxury Suite", price: 340, description: "Premium suite with ocean views" },
    { name: "Royal Suite", price: 500, description: "Private balcony and luxury service" },
    { name: "Executive Room", price: 260, description: "Modern business room with amenities" },
    { name: "Junior Suite", price: 300, description: "Smaller suite perfect for couples" }
  ]
},

  {
  name: "The Ritz-Carlton Riyadh",
  location: "Riyadh",
  country: "Saudi Arabia",
  rating: 4.9,
  pricePerNight: 500,
  mainImage: "/images/The Ritz-Carlton Riyadh external.webp",
  images: [
    "/images/The Ritz-Carlton Riyad internal 1.webp",
    "/images/The Ritz-Carlton Riyad internal 2.webp",
    "/images/The Ritz-Carlton Riyad internal 3.webp",
    "/images/The Ritz-Carlton Riyad internal 4.webp",
    "/images/The Ritz-Carlton Riyad internal 5.webp",
    "/images/The Ritz-Carlton Riyad internal 6.webp",
    "/images/The Ritz-Carlton Riyad internal 7.webp",
    "/images/The Ritz-Carlton Riyad internal 8.avif"
  ],
  description: "The pinnacle of luxury in Riyadh. Unmatched elegance and service.",
  amenities: [
    { name: "High-Speed Wi-Fi", isPaid: false },
    { name: "Indoor Swimming Pool", isPaid: false },
    { name: "Fine-Dining Restaurant", isPaid: false },
    { name: "Butler Service", isPaid: false },
    { name: "Luxury Spa & Hammam", isPaid: true, price: 75 },
    { name: "Private Limousine Airport Transfer", isPaid: true, price: 80 },
    { name: "Cigar Lounge", isPaid: true, price: 40 },
    { name: "Conference & Banquet Halls", isPaid: true, price: 200 }
  ],
  rooms: [
    { name: "Deluxe Room", price: 500, description: "Elegant room with city views" },
    { name: "Presidential Suite", price: 1200, description: "Exclusive luxury with personalized service" },
    { name: "Royal Villa", price: 2000, description: "Private villa with garden and pool" },
    { name: "Executive Suite", price: 800, description: "Business suite with luxury decor" },
    { name: "King's Palace Suite", price: 3000, description: "Ultimate royal experience with private staff" }
  ]
},

  {
  name: "The Torch Doha",
  location: "Doha",
  country: "Qatar",
  rating: 4.7,
  pricePerNight: 300,
  mainImage: "/images/The Torch Doha inetrnal 11.jpeg",
  images: [
    "/images/The Torch Doha internal 1.jpg",
    "/images/The Torch Doha internal 2.jpg",
    "/images/The Torch Doha internal 3.webp",
    "/images/The Torch Doha internal 4.jpg",
    "/images/The Torch Doha internal 5.webp",
    "/images/The Torch Doha internal 6.webp"
  ],
  description: "A landmark hotel with panoramic city views.",
  amenities: [
    { name: "High-Speed Wi-Fi", isPaid: false },
    { name: "Infinity Pool with City Views", isPaid: false },
    { name: "Sky Lounge & Fine Dining", isPaid: true, price: 85 },
    { name: "Observation Deck Access", isPaid: true, price: 30 },
    { name: "Luxury Spa & Wellness Center", isPaid: true, price: 70 },
    { name: "Airport Shuttle Service", isPaid: true, price: 40 },
    { name: "Concierge Service", isPaid: true, price: 15 }
  ],
  rooms: [
    { name: "Superior Room", price: 300, description: "Modern room with city views" },
    { name: "Sky Suite", price: 600, description: "Panoramic view suite on higher floors" },
    { name: "Royal Suite", price: 900, description: "Exclusive suite with VIP services" },
    { name: "Presidential Suite", price: 1200, description: "Ultimate luxury suite with lounge access" },
    { name: "Executive Junior", price: 450, description: "Business-friendly junior suite" }
  ]
},

  {
  name: "Swat Serena Lodge",
  location: "Swat",
  country: "Pakistan",
  rating: 4.6,
  pricePerNight: 180,
  mainImage: "/images/Swat Serena Lodge external.jpg",
  images: [
    "/images/Swat Serena Lodge internal 1.jpg",
    "/images/Swat Serena Lodge internal 2.jpg",
    "/images/Swat Serena Lodge internal 3.jpg",
    "/images/Swat Serena Lodge internal 4.jpg",
    "/images/Swat Serena Lodge internal 5.jpg",
    "/images/Swat Serena Lodge internal 6.jpg",
    "/images/Swat Serena Lodge internal 7.jpg"
  ],
  description: "Luxury lodge in the heart of Swat Valley.",
  amenities: [
    { name: "Wi-Fi", isPaid: false },
    { name: "Nature Trails & Guided Hikes", isPaid: false },
    { name: "Traditional Restaurant", isPaid: false },
    { name: "Lodge Garden & Picnic Area", isPaid: false },
    { name: "Spa & Wellness Center", isPaid: true, price: 45 },
    { name: "Bonfire Nights with Folk Music", isPaid: true, price: 30 },
    { name: "Horse Riding Excursion", isPaid: true, price: 50 }
  ],
  rooms: [
    { name: "Lodge Room", price: 180, description: "Rustic decor with modern comfort" },
    { name: "Luxury Suite", price: 320, description: "Premium lodge with valley views" },
    { name: "Mountain Villa", price: 450, description: "Private villa with scenic mountain view" },
    { name: "Family Cottage", price: 380, description: "Spacious lodge for families" },
    { name: "Honeymoon Cabin", price: 250, description: "Cozy cabin for couples" }
  ]
},

 {
  name: "Al Mashreq Boutique Hotel Riyadh",
  location: "Riyadh",
  country: "Saudi Arabia",
  rating: 4.4,
  pricePerNight: 240,
  mainImage: "/images/Al Mashreq Boutique internal 2.jpg",
  images: [
    "/images/Al Mashreq Boutique internal 1.jpeg",
    "/images/Al Mashreq Boutique internal 3.jpeg",
    "/images/Al Mashreq Boutique internal 4.jpeg",
    "/images/Al Mashreq Boutique internal 5.jpeg",
    "/images/Al Mashreq Boutique internal 6.jpeg",
    "/images/Al Mashreq Boutique internal 7.jpeg"
  ],
  description: "Boutique luxury in Riyadh with Arabian elegance.",
  amenities: [
    { name: "High-Speed Wi-Fi", isPaid: false },
    { name: "Indoor Pool", isPaid: false },
    { name: "Fine-Dining Restaurant", isPaid: false },
    { name: "Boutique Arabian Courtyard & Garden", isPaid: false },
    { name: "Luxury Spa & Hammam", isPaid: true, price: 55 },
    { name: "Private Chauffeur Service", isPaid: true, price: 70 }
  ],
  rooms: [
    { name: "Standard Room", price: 240, description: "Boutique-style comfort" },
    { name: "Arabian Suite", price: 400, description: "Unique decor with premium amenities" },
    { name: "Royal Suite", price: 650, description: "Exclusive decor with personal butler" },
    { name: "Deluxe Room", price: 300, description: "Spacious boutique-style room" },
    { name: "Executive Suite", price: 500, description: "Premium suite for business travelers" }
  ]
},

  {
  name: "Shangri-La Bangkok",
  location: "Bangkok",
  country: "Thailand",
  rating: 4.8,
  pricePerNight: 280,
  mainImage: "/images/Shangri-La Bangkok exterior.webp",
  images: [
    "/images/Shangri-La Bangkok internal 1.jpg",
    "/images/Shangri-La Bangkok internal 2.webp",
    "/images/Shangri-La Bangkok internal 3.jpg",
    "/images/Shangri-La Bangkok internal 4.webp",
    "/images/Shangri-La Bangkok internal 5.jpg",
    "/images/Shangri-La Bangkok internal 6.webp"
  ],
  description: "Riverside luxury in the heart of Bangkok.",
  amenities: [
    { name: "High-Speed Wi-Fi", isPaid: false },
    { name: "Infinity Riverside Pool", isPaid: false },
    { name: "Luxury Spa & Wellness Center", isPaid: true, price: 50 },
    { name: "Riverside Fine Dining Restaurant", isPaid: false },
    { name: "Tropical Garden Lounge", isPaid: false },
    { name: "Airport Limousine Transfer", isPaid: true, price: 35 }
  ],
  rooms: [
    { name: "Deluxe Room", price: 280, description: "River view with modern design" },
    { name: "Horizon Suite", price: 500, description: "Exclusive club access with premium service" },
    { name: "Presidential Suite", price: 950, description: "Panoramic river view with luxury service" },
    { name: "Executive King", price: 400, description: "Spacious riverside room with king bed" }
  ]
},

  {
  name: "Waldorf Astoria Kuwait",
  location: "Kuwait City",
  country: "Kuwait",
  rating: 4.9,
  pricePerNight: 400,
  mainImage: "/images/WALDORF ASTORIA_Hotel_Exterior.webp",
  images: [
    "/images/WALDORF ASTORIA INTERNAL 1.webp",
    "/images/WALDORF ASTORIA INTERNAL 2.webp",
    "/images/WALDORF ASTORIA INTERNAL 3.webp",
    "/images/WALDORF ASTORIA INTERNAL 4.webp",
    "/images/WALDORF ASTORIA INTERNAL 5.webp",
    "/images/WALDORF ASTORIA INTERNAL 6.webp",
    "/images/WALDORF ASTORIA INTERNAL 7.webp",
    "/images/WALDORF ASTORIA INTERNAL 8.webp",
    "/images/WALDORF ASTORIA INTERNAL 9.webp"
  ],
  description: "The pinnacle of luxury in Kuwait. Unmatched elegance and service.",
  amenities: [
    { name: "High-Speed Wi-Fi", isPaid: false },
    { name: "Indoor & Outdoor Pools", isPaid: false },
    { name: "World-Class Spa & Hammam", isPaid: true, price: 70 },
    { name: "Michelin-Starred Dining", isPaid: false },
    { name: "24/7 Concierge & Butler Service", isPaid: false },
    { name: "Chauffeur & Luxury Car Transfer", isPaid: true, price: 60 }
  ],
  rooms: [
    { name: "Deluxe Room", price: 400, description: "Elegant stay with city views" },
    { name: "Luxury Suite", price: 700, description: "Premium suite with luxury decor" },
    { name: "Royal Palace Suite", price: 1500, description: "Exclusive palace-style suite with private staff" },
    { name: "Executive King Room", price: 550, description: "Elegant room designed for business travelers" },
    { name: "Presidential Suite", price: 1000, description: "Prestigious suite with dedicated butler" }
  ]
}

];


async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected for seeding");

    await Hotel.deleteMany(); // clear old data
    await Hotel.insertMany(hotels);

    console.log("🌱 Hotels seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    mongoose.connection.close();
  }
}

seedDB();
