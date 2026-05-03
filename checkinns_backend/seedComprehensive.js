import mongoose from 'mongoose';
import User from './models/User.js';
import Owner from './models/Owner.js';
import Hotel from './models/Hotel.js';
import Restaurant from './models/Restaurant.js';
import Lounge from './models/Lounge.js';
import Booking from './models/Booking.js';
import bcrypt from 'bcryptjs';

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://muhammadhamza662c:vqGoA5nWO6hVYZ49@hotel-project.tputjmq.mongodb.net/checkinns_db?retryWrites=true&w=majority&appName=Hotel-project';

async function seedDatabase() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Owner.deleteMany({});
    await Hotel.deleteMany({});
    await Restaurant.deleteMany({});
    await Lounge.deleteMany({});
    await Booking.deleteMany({});

    // ==================== OWNERS ====================
    const owners = await Owner.insertMany([
      {
        name: 'Luxury Hotels Emirates',
        username: 'luxury@emirates.com',
        email: 'luxury@emirates.com',
        password: await bcrypt.hash('password123', 10),
        totalRevenue: 125000
      },
      {
        name: 'Premium Dining Group',
        username: 'premium@dining.com',
        email: 'premium@dining.com',
        password: await bcrypt.hash('password123', 10),
        totalRevenue: 85000
      },
      {
        name: 'Elite Lounges International',
        username: 'elite@lounges.com',
        email: 'elite@lounges.com',
        password: await bcrypt.hash('password123', 10),
        totalRevenue: 65000
      },
      {
        name: 'Grand Properties Ltd',
        username: 'grand@properties.com',
        email: 'grand@properties.com',
        password: await bcrypt.hash('password123', 10),
        totalRevenue: 95000
      }
    ]);
    console.log(`✅ Added ${owners.length} owners`);

    // ==================== HOTELS (18) ====================
    const hotels = await Hotel.insertMany([
      {
        name: 'Burj Al Arab Jumeirah',
        location: 'Dubai, UAE',
        owner: owners[0]._id.toString(),
        pricePerNight: 420,
        description: 'Ultra-luxury beachfront resort with world-class service and stunning Arabian Gulf views',
        mainImage: '/images/burj-al-arab-luxury-hotel-cityscape-night-lights-waterfront-3840x2160-6380.jpg',
        images: ['/images/burj-al-arab-luxury-hotel-cityscape-night-lights-waterfront-3840x2160-6380.jpg', '/images/burj internal 1.avif', '/images/burj internal 2.avif', '/images/burj internal 3.avif', '/images/burj internal 4.jpg'],
        amenities: [{ name: 'Private Beach' }, { name: 'Michelin Star Restaurant' }, { name: '24/7 Concierge' }, { name: 'Spa & Wellness' }]
      },
      {
        name: 'The Ritz-Carlton Riyadh',
        location: 'Riyadh, Saudi Arabia',
        owner: owners[0]._id.toString(),
        pricePerNight: 380,
        description: 'Iconic luxury hotel with state-of-the-art facilities and premium hospitality',
        mainImage: '/images/The Ritz-Carlton Riyadh external.webp',
        images: ['/images/The Ritz-Carlton Riyadh external.webp', '/images/The Ritz-Carlton Riyad internal 1.webp', '/images/The Ritz-Carlton Riyad internal 2.webp', '/images/The Ritz-Carlton Riyad internal 3.webp'],
        amenities: [{ name: '5-Star Spa' }, { name: 'Business Center' }, { name: 'Fine Dining' }, { name: 'Rooftop Bar' }]
      },
      {
        name: 'Waldorf Astoria Dubai',
        location: 'Downtown Dubai, UAE',
        owner: owners[0]._id.toString(),
        pricePerNight: 350,
        description: 'Elegant luxury hotel featuring exceptional service and contemporary design',
        mainImage: '/images/WALDORF ASTORIA_Hotel_Exterior.webp',
        images: ['/images/WALDORF ASTORIA_Hotel_Exterior.webp', '/images/WALDORF ASTORIA INTERNAL 1.webp', '/images/WALDORF ASTORIA INTERNAL 2.webp', '/images/WALDORF ASTORIA INTERNAL 3.webp'],
        amenities: [{ name: 'Olympic Pool' }, { name: 'Gym & Fitness' }, { name: 'Restaurant' }, { name: 'Conference Halls' }]
      },
      {
        name: 'Shangri-La Bangkok',
        location: 'Bangkok, Thailand',
        owner: owners[0]._id.toString(),
        pricePerNight: 280,
        description: 'Premier riverside hotel with breathtaking views of the Chao Phraya River',
        mainImage: '/images/Shangri-La Bangkok exterior.webp',
        images: ['/images/Shangri-La Bangkok exterior.webp', '/images/Shangri-La Bangkok internal 1.jpg', '/images/Shangri-La Bangkok internal 2.webp', '/images/Shangri-La Bangkok internal 3.jpg'],
        amenities: [{ name: 'River View Rooms' }, { name: 'Thai Spa' }, { name: 'Restaurants' }, { name: 'Water Sports' }]
      },
      {
        name: 'The Torch Doha',
        location: 'Doha, Qatar',
        owner: owners[0]._id.toString(),
        pricePerNight: 320,
        description: 'Modern luxury tower hotel with panoramic city views and premium amenities',
        mainImage: '/images/The Torch Doha external.webp',
        images: ['/images/The Torch Doha external.webp', '/images/The Torch Doha internal 1.jpg', '/images/The Torch Doha internal 2.jpg', '/images/The Torch Doha internal 3.webp'],
        amenities: [{ name: 'Sky Bar' }, { name: 'Infinity Pool' }, { name: 'Luxury Spa' }, { name: 'Fine Dining' }]
      },
      {
        name: 'Al Mashreq Boutique',
        location: 'Dubai, UAE',
        owner: owners[1]._id.toString(),
        pricePerNight: 240,
        description: 'Intimate boutique hotel blending Arabian architecture with modern luxury',
        mainImage: '/images/Al Mashreq Boutique internal 1.jpeg',
        images: ['/images/Al Mashreq Boutique internal 1.jpeg', '/images/Al Mashreq Boutique internal 2.jpg', '/images/Al Mashreq Boutique internal 3.jpg', '/images/Al Mashreq Boutique internal 4.jpg'],
        amenities: [{ name: 'Rooftop Lounge' }, { name: 'Spa Services' }, { name: 'Restaurant' }, { name: 'Art Gallery' }]
      },
      {
        name: 'Armani Hotel Dubai',
        location: 'Burj Khalifa, Dubai',
        owner: owners[1]._id.toString(),
        pricePerNight: 390,
        description: 'Designer luxury hotel within the world\'s tallest building',
        mainImage: '/images/armani hotel.jpg',
        images: ['/images/armani hotel.jpg', '/images/emirated internal 1.jpg', '/images/emirated internal 2.jpg', '/images/emirated internal 3.jpg'],
        amenities: [{ name: 'Giorgio\'s Restaurant' }, { name: 'Armani Spa' }, { name: 'Sky Views' }, { name: 'Premium Service' }]
      },
      {
        name: 'The Oberoi Beach Resort',
        location: 'Goa, India',
        owner: owners[1]._id.toString(),
        pricePerNight: 210,
        description: 'Beachfront luxury resort with stunning Arabian Sea views',
        mainImage: '/images/The Oberoi Beach Resort exterior.jpg',
        images: ['/images/The Oberoi Beach Resort exterior.jpg', '/images/The Oberoi Beach Resort interior 1.jpg', '/images/The Oberoi Beach Resort interior 2.jpg', '/images/The Oberoi Beach Resort interior 3.jpg'],
        amenities: [{ name: 'Private Beach' }, { name: 'Water Sports' }, { name: 'Spa' }, { name: 'Multiple Restaurants' }]
      },
      {
        name: 'Pearl Continental Lahore',
        location: 'Lahore, Pakistan',
        owner: owners[1]._id.toString(),
        pricePerNight: 140,
        description: 'Premium hotel in the heart of Lahore with excellent service',
        mainImage: '/images/pearl continental 1.webp',
        images: ['/images/pearl continental 1.webp', '/images/pc internal1.jpg', '/images/pc internal2.jpg', '/images/pc internal3.webp'],
        amenities: [{ name: 'Business Facilities' }, { name: 'Multiple Dining' }, { name: 'Conference Rooms' }, { name: 'Fitness Center' }]
      },
      {
        name: 'Qasr Al-Nakheel Resort',
        location: 'Riyadh, Saudi Arabia',
        owner: owners[2]._id.toString(),
        pricePerNight: 290,
        description: 'Luxurious palace-style resort with traditional Arabian elegance',
        mainImage: '/images/Qasr Al-Nakheel exterior.webp',
        images: ['/images/Qasr Al-Nakheel exterior.webp', '/images/Qasr Al-Nakheel interior 1.jpg', '/images/Qasr Al-Nakheel interior 2.jpg', '/images/Qasr Al-Nakheel interior 3.jpg'],
        amenities: [{ name: 'Palace Architecture' }, { name: 'Arabian Spa' }, { name: 'Gourmet Dining' }, { name: 'Gardens' }]
      },
      {
        name: 'The Indigo Hotel Islamabad',
        location: 'Islamabad, Pakistan',
        owner: owners[2]._id.toString(),
        pricePerNight: 130,
        description: 'Modern upscale hotel with comfortable rooms and excellent amenities',
        mainImage: '/images/indigo lahore 3.jpg',
        images: ['/images/indigo lahore 3.jpg', '/images/indigo internal1.jpg', '/images/indigo internal2.jpg', '/images/indigo internal3.jpg'],
        amenities: [{ name: 'Business Center' }, { name: 'Restaurant' }, { name: 'Conference Halls' }, { name: 'Gym' }]
      },
      {
        name: 'Swat Serena Lodge',
        location: 'Swat Valley, Pakistan',
        owner: owners[2]._id.toString(),
        pricePerNight: 120,
        description: 'Mountain retreat offering breathtaking valley views and natural beauty',
        mainImage: '/images/Swat Serena Lodge external.jpg',
        images: ['/images/Swat Serena Lodge external.jpg', '/images/Swat Serena Lodge internal 1.jpg', '/images/Swat Serena Lodge internal 2.jpg', '/images/Swat Serena Lodge internal 3.jpg'],
        amenities: [{ name: 'Mountain Views' }, { name: 'Hiking Trails' }, { name: 'Restaurant' }, { name: 'Adventure Sports' }]
      },
      {
        name: 'Ramada by Wyndham Dubai',
        location: 'Dubai, UAE',
        owner: owners[2]._id.toString(),
        pricePerNight: 170,
        description: 'Contemporary hotel combining comfort with modern amenities',
        mainImage: '/images/Ramada Dubai.jpg',
        images: ['/images/Ramada Dubai.jpg', '/images/Ramada by whyndham.jpg'],
        amenities: [{ name: 'Business Hotel' }, { name: 'Restaurant' }, { name: 'Fitness' }, { name: 'Conference' }]
      },
      {
        name: 'Marriott Islamabad',
        location: 'Islamabad, Pakistan',
        owner: owners[3]._id.toString(),
        pricePerNight: 150,
        description: 'Five-star hotel offering world-class service and facilities',
        mainImage: '/images/marriot isb 7.jpg',
        images: ['/images/marriot isb 7.jpg', '/images/marriot internal 1.jpg', '/images/marriot internal 2.jpg', '/images/marriot internal 3.jpg'],
        amenities: [{ name: 'Luxury Rooms' }, { name: 'Spa Services' }, { name: 'Fine Dining' }, { name: 'Pool' }]
      },
      {
        name: 'Movenpick Resort Bahrain',
        location: 'Bahrain',
        owner: owners[3]._id.toString(),
        pricePerNight: 200,
        description: 'Beachfront resort with vibrant atmosphere and excellent facilities',
        mainImage: '/images/movenpick bahrain external.jpg',
        images: ['/images/movenpick bahrain external.jpg', '/images/movenpick bahrain internal 1.webp', '/images/movenpick bahrain internal 2.jpg', '/images/movenpick bahrain internal 3.jpg'],
        amenities: [{ name: 'Beach Access' }, { name: 'Water Sports' }, { name: 'Restaurants' }, { name: 'Bar & Lounge' }]
      },
      {
        name: 'Holiday Inn Express Dubai',
        location: 'Dubai, UAE',
        owner: owners[3]._id.toString(),
        pricePerNight: 160,
        description: 'Comfortable mid-range hotel ideal for business and leisure travelers',
        mainImage: '/images/Holiday INN.jpg',
        images: ['/images/Holiday INN.jpg'],
        amenities: [{ name: 'Breakfast Included' }, { name: 'Business Center' }, { name: 'Fitness Center' }, { name: 'Restaurant' }]
      },
      {
        name: 'Nishat Hotel Lahore',
        location: 'Lahore, Pakistan',
        owner: owners[3]._id.toString(),
        pricePerNight: 125,
        description: 'Traditional heritage hotel in the historic city of Lahore',
        mainImage: '/images/nishat lahore 4.jpg',
        images: ['/images/nishat lahore 4.jpg', '/images/nishat internal1.jpg', '/images/nishat internal2.jpg', '/images/nishat internal3.jpg'],
        amenities: [{ name: 'Heritage Location' }, { name: 'Restaurant' }, { name: 'Banquet Hall' }, { name: 'Business Facilities' }]
      }
    ]);
    console.log(`✅ Added ${hotels.length} hotels`);

    // ==================== RESTAURANTS (6) ====================
    const restaurants = await Restaurant.insertMany([
      {
        name: 'Eleven Madison Park',
        location: 'New York, USA',
        owner: owners[0]._id.toString(),
        cuisines: ['French Contemporary'],
        priceRange: '$$$',
        description: 'Three-Michelin-star restaurant featuring innovative French cuisine',
        mainImage: '/images/Eleven Madison Park exterior.jpg',
        images: ['/images/Eleven Madison Park exterior.jpg', '/images/Eleven Madison Park interior 1.jpg', '/images/Eleven Madison Park interior 2.webp', '/images/Eleven Madison Park interior 3.jpg']
      },
      {
        name: 'Château Étoile',
        location: 'Paris, France',
        owner: owners[0]._id.toString(),
        cuisines: ['French Fine Dining'],
        priceRange: '$$$',
        description: 'Exquisite French fine dining with Michelin recognition',
        mainImage: '/images/Château Étoile exterior.jpg',
        images: ['/images/Château Étoile exterior.jpg', '/images/Château Étoile interior 1.webp', '/images/Château Étoile interior 2.jpg', '/images/Château Étoile interior 3.jpg']
      },
      {
        name: 'Darbar-e-Noor',
        location: 'Lahore, Pakistan',
        owner: owners[1]._id.toString(),
        cuisines: ['Pakistani Royal'],
        priceRange: '$$',
        description: 'Premium Pakistani cuisine inspired by royal kitchens',
        mainImage: '/images/Darbar-e-Noor exterior.avif',
        images: ['/images/Darbar-e-Noor exterior.avif', '/images/Darbar-e-Noor hero.jpg', '/images/Darbar-e-Noor interior 1.jpg', '/images/Darbar-e-Noor interior 2.jpg']
      },
      {
        name: 'Azure Sky Restaurant',
        location: 'Dubai, UAE',
        owner: owners[1]._id.toString(),
        cuisines: ['International Fusion'],
        priceRange: '$$',
        description: 'Rooftop dining with stunning city views and fusion cuisine',
        mainImage: '/images/Azure sky resturant exterior.jpg',
        images: ['/images/Azure sky resturant exterior.jpg', '/images/Azure sky resturant interior 1.jpg', '/images/Azure sky resturant interior 2.jpg', '/images/Azure sky resturant interior 3.jpg']
      },
      {
        name: 'Royal Biryani House',
        location: 'Karachi, Pakistan',
        owner: owners[2]._id.toString(),
        cuisines: ['Pakistani Traditional'],
        priceRange: '$',
        description: 'Authentic Pakistani biryani and traditional dishes',
        mainImage: '/images/Royal Biryani.avif',
        images: ['/images/Royal Biryani.avif']
      },
      {
        name: 'Mediterranean Shores',
        location: 'Athens, Greece',
        owner: owners[3]._id.toString(),
        cuisines: ['Mediterranean', 'Seafood'],
        priceRange: '$$',
        description: 'Fresh Mediterranean seafood with Aegean Sea views',
        mainImage: '/images/Seafood Paella.jpg',
        images: ['/images/Seafood Paella.jpg']
      }
    ]);
    console.log(`✅ Added ${restaurants.length} restaurants`);

    // ==================== LOUNGES (6) ====================
    const lounges = await Lounge.insertMany([
      {
        name: 'Skyline Rooftop Lounge',
        location: 'Dubai, UAE',
        owner: owners[0]._id.toString(),
        features: ['360-degree City Views', 'Cocktail Bar', 'DJ', 'VIP Tables'],
        priceRange: '$$$',
        description: 'Premium rooftop lounge with panoramic city views',
        mainImage: '/images/Skyline Rooftop Lounge hero.jpg',
        images: ['/images/Skyline Rooftop Lounge hero.jpg', '/images/Skyline Rooftop Lounge interior 1.jpg', '/images/Skyline Rooftop Lounge interior 2.jpg', '/images/Skyline Rooftop Lounge interior 3.jpg']
      },
      {
        name: 'Family Lounge Paradise',
        location: 'Riyadh, Saudi Arabia',
        owner: owners[0]._id.toString(),
        features: ['Family Rooms', 'Kids Entertainment', 'Dining', 'Games'],
        priceRange: '$$',
        description: 'Luxurious family lounge with entertainment and dining',
        mainImage: '/images/Family Lounge hero.jpg',
        images: ['/images/Family Lounge hero.jpg', '/images/Family Lounge interior 1.jpg', '/images/Family Lounge interior 2.jpg', '/images/Family Lounge interior 3.jpg']
      },
      {
        name: 'Sports Bar Lounge',
        location: 'Dubai, UAE',
        owner: owners[1]._id.toString(),
        features: ['Live Sports', 'Premium Sound', 'Craft Beer', 'Food'],
        priceRange: '$$',
        description: 'Upscale sports bar with live events and premium service',
        mainImage: '/images/Sports Bar Lounge interior hero.jpg',
        images: ['/images/Sports Bar Lounge interior hero.jpg', '/images/Sports Bar Lounge interior 1.jpg', '/images/Sports Bar Lounge interior 2.jpg', '/images/Sports Bar Lounge interior 3.jpg']
      },
      {
        name: 'Wellness Spa Lounge',
        location: 'Bangkok, Thailand',
        owner: owners[2]._id.toString(),
        features: ['Thai Spa', 'Massage', 'Meditation', 'Herbal Treatments'],
        priceRange: '$$',
        description: 'Serene wellness spa lounge for relaxation and rejuvenation',
        mainImage: '/images/Wellness Spa Lounge interior hero.webp',
        images: ['/images/Wellness Spa Lounge interior hero.webp', '/images/Wellness Spa Lounge interior 1.webp', '/images/Wellness Spa Lounge interior 2.jpg', '/images/Wellness Spa Lounge interior 3.jpg']
      },
      {
        name: 'Avalon Jumeira Lounge',
        location: 'Dubai, UAE',
        owner: owners[2]._id.toString(),
        features: ['VIP Area', 'Private Booths', 'Cocktails', 'Premium Service'],
        priceRange: '$$$',
        description: 'Exclusive VIP lounge with premium amenities',
        mainImage: '/images/Avalon Jumeira.jpg',
        images: ['/images/Avalon Jumeira.jpg']
      },
      {
        name: 'Canal Central Lounge',
        location: 'Venice, Italy',
        owner: owners[3]._id.toString(),
        features: ['Canal Views', 'Romantic Ambiance', 'Wine Bar', 'Live Music'],
        priceRange: '$$',
        description: 'Elegant canal-side lounge with romantic atmosphere',
        mainImage: '/images/canal central dubai 10.jpg',
        images: ['/images/canal central dubai 10.jpg', '/images/canal central internal1.jpg', '/images/canal central internal2.jpg', '/images/canal central internal3.jpg']
      }
    ]);
    console.log(`✅ Added ${lounges.length} lounges`);

    // ==================== USERS (8) ====================
    const users = await User.insertMany([
      {
        name: 'Ahmed Hassan',
        username: 'ahmed_hassan',
        email: 'ahmed@example.com',
        password: await bcrypt.hash('password123', 10),
        preferences: {
          roomType: 'Deluxe Suite',
          cuisine: 'Pakistani',
          loungeType: 'Rooftop'
        }
      },
      {
        name: 'Fatima Al-Mansouri',
        username: 'fatima_mansouri',
        email: 'fatima@example.com',
        password: await bcrypt.hash('password123', 10),
        preferences: {
          roomType: 'Royal Suite',
          cuisine: 'Mediterranean',
          loungeType: 'VIP'
        }
      },
      {
        name: 'Ali Khan',
        username: 'ali_khan',
        email: 'ali@example.com',
        password: await bcrypt.hash('password123', 10),
        preferences: {
          roomType: 'Ocean View',
          cuisine: 'French',
          loungeType: 'Spa'
        }
      },
      {
        name: 'Sara Ahmed',
        username: 'sara_ahmed',
        email: 'sara@example.com',
        password: await bcrypt.hash('password123', 10),
        preferences: {
          roomType: 'Premium Double',
          cuisine: 'Asian Fusion',
          loungeType: 'Sports Bar'
        }
      },
      {
        name: 'Hassan Mohammed',
        username: 'hassan_mohammed',
        email: 'hassan@example.com',
        password: await bcrypt.hash('password123', 10),
        preferences: {
          roomType: 'Suite',
          cuisine: 'International',
          loungeType: 'Rooftop'
        }
      },
      {
        name: 'Amira Omar',
        username: 'amira_omar',
        email: 'amira@example.com',
        password: await bcrypt.hash('password123', 10),
        preferences: {
          roomType: 'Luxury Room',
          cuisine: 'Italian',
          loungeType: 'VIP'
        }
      },
      {
        name: 'Muhammad Ali',
        username: 'muhammad_ali',
        email: 'muhammad@example.com',
        password: await bcrypt.hash('password123', 10),
        preferences: {
          roomType: 'Twin Room',
          cuisine: 'Pakistani',
          loungeType: 'Family Lounge'
        }
      },
      {
        name: 'Layla Ibrahim',
        username: 'layla_ibrahim',
        email: 'layla@example.com',
        password: await bcrypt.hash('password123', 10),
        preferences: {
          roomType: 'Garden View',
          cuisine: 'French',
          loungeType: 'Wellness Spa'
        }
      }
    ]);
    console.log(`✅ Added ${users.length} users`);

    // ==================== USER BOOKINGS ====================
    const bookings = await Booking.insertMany([
      {
        username: users[0].username,
        hotel: hotels[0]._id,
        room: { name: 'Deluxe Suite', price: hotels[0].pricePerNight },
        checkIn: new Date('2024-03-15'),
        checkOut: new Date('2024-03-20'),
        nights: 5,
        roomTotal: hotels[0].pricePerNight * 5,
        amenitiesTotal: 0,
        tax: Math.round(hotels[0].pricePerNight * 5 * 0.15),
        totalPrice: Math.round(hotels[0].pricePerNight * 5 * 1.15),
        paymentStatus: 'succeeded'
      },
      {
        username: users[0].username,
        hotel: hotels[1]._id,
        room: { name: 'Royal Suite', price: hotels[1].pricePerNight },
        checkIn: new Date('2024-04-10'),
        checkOut: new Date('2024-04-15'),
        nights: 5,
        roomTotal: hotels[1].pricePerNight * 5,
        amenitiesTotal: 0,
        tax: Math.round(hotels[1].pricePerNight * 5 * 0.15),
        totalPrice: Math.round(hotels[1].pricePerNight * 5 * 1.15),
        paymentStatus: 'succeeded'
      },
      {
        username: users[1].username,
        hotel: hotels[3]._id,
        room: { name: 'Riverside Suite', price: hotels[3].pricePerNight },
        checkIn: new Date('2024-03-20'),
        checkOut: new Date('2024-03-27'),
        nights: 7,
        roomTotal: hotels[3].pricePerNight * 7,
        amenitiesTotal: 0,
        tax: Math.round(hotels[3].pricePerNight * 7 * 0.15),
        totalPrice: Math.round(hotels[3].pricePerNight * 7 * 1.15),
        paymentStatus: 'succeeded'
      },
      {
        username: users[2].username,
        hotel: hotels[2]._id,
        room: { name: 'Premier Room', price: hotels[2].pricePerNight },
        checkIn: new Date('2024-05-01'),
        checkOut: new Date('2024-05-05'),
        nights: 4,
        roomTotal: hotels[2].pricePerNight * 4,
        amenitiesTotal: 0,
        tax: Math.round(hotels[2].pricePerNight * 4 * 0.15),
        totalPrice: Math.round(hotels[2].pricePerNight * 4 * 1.15),
        paymentStatus: 'pending'
      },
      {
        username: users[3].username,
        hotel: hotels[4]._id,
        room: { name: 'Tower Suite', price: hotels[4].pricePerNight },
        checkIn: new Date('2024-03-25'),
        checkOut: new Date('2024-03-28'),
        nights: 3,
        roomTotal: hotels[4].pricePerNight * 3,
        amenitiesTotal: 0,
        tax: Math.round(hotels[4].pricePerNight * 3 * 0.15),
        totalPrice: Math.round(hotels[4].pricePerNight * 3 * 1.15),
        paymentStatus: 'succeeded'
      },
      {
        username: users[4].username,
        hotel: hotels[8]._id,
        room: { name: 'Luxury Room', price: hotels[8].pricePerNight },
        checkIn: new Date('2024-04-01'),
        checkOut: new Date('2024-04-08'),
        nights: 7,
        roomTotal: hotels[8].pricePerNight * 7,
        amenitiesTotal: 0,
        tax: Math.round(hotels[8].pricePerNight * 7 * 0.15),
        totalPrice: Math.round(hotels[8].pricePerNight * 7 * 1.15),
        paymentStatus: 'succeeded'
      },
      {
        username: users[5].username,
        hotel: hotels[9]._id,
        room: { name: 'Palace Suite', price: hotels[9].pricePerNight },
        checkIn: new Date('2024-02-28'),
        checkOut: new Date('2024-03-03'),
        nights: 3,
        roomTotal: hotels[9].pricePerNight * 3,
        amenitiesTotal: 0,
        tax: Math.round(hotels[9].pricePerNight * 3 * 0.15),
        totalPrice: Math.round(hotels[9].pricePerNight * 3 * 1.15),
        paymentStatus: 'succeeded'
      },
      {
        username: users[6].username,
        hotel: hotels[11]._id,
        room: { name: 'Mountain View Room', price: hotels[11].pricePerNight },
        checkIn: new Date('2024-03-15'),
        checkOut: new Date('2024-03-18'),
        nights: 3,
        roomTotal: hotels[11].pricePerNight * 3,
        amenitiesTotal: 0,
        tax: Math.round(hotels[11].pricePerNight * 3 * 0.15),
        totalPrice: Math.round(hotels[11].pricePerNight * 3 * 1.15),
        paymentStatus: 'succeeded'
      }
    ]);
    console.log(`✅ Added ${bookings.length} hotel bookings`);

    // ==================== USER FAVORITES ====================
    await User.findByIdAndUpdate(users[0]._id, {
      favorites: {
        hotels: [hotels[0]._id, hotels[1]._id],
        restaurants: [restaurants[0]._id, restaurants[2]._id],
        lounges: [lounges[0]._id, lounges[1]._id]
      }
    });

    await User.findByIdAndUpdate(users[1]._id, {
      favorites: {
        hotels: [hotels[3]._id, hotels[4]._id],
        restaurants: [restaurants[1]._id, restaurants[3]._id],
        lounges: [lounges[3]._id, lounges[4]._id]
      }
    });

    await User.findByIdAndUpdate(users[2]._id, {
      favorites: {
        hotels: [hotels[2]._id],
        restaurants: [restaurants[0]._id],
        lounges: [lounges[2]._id]
      }
    });

    await User.findByIdAndUpdate(users[3]._id, {
      favorites: {
        hotels: [hotels[5]._id, hotels[6]._id],
        restaurants: [restaurants[2]._id, restaurants[4]._id],
        lounges: [lounges[2]._id, lounges[5]._id]
      }
    });

    console.log('✅ User favorites added');

    console.log('\n========== SEEDING COMPLETE ==========');
    console.log(`✅ ${hotels.length} Hotels`);
    console.log(`✅ ${restaurants.length} Restaurants`);
    console.log(`✅ ${lounges.length} Lounges`);
    console.log(`✅ ${users.length} Users`);
    console.log(`✅ ${bookings.length} Bookings`);
    console.log(`✅ ${owners.length} Owners`);
    console.log('\n========== LOGIN CREDENTIALS ==========');
    console.log('👤 User: ahmed@example.com / password123');
    console.log('👤 User: fatima@example.com / password123');
    console.log('👤 User: ali@example.com / password123');
    console.log('👤 User: sara@example.com / password123');
    console.log('\n📧 OWNER LOGIN CREDENTIALS:');
    console.log('👨‍💼 Owner: luxury@emirates.com / password123');
    console.log('👨‍💼 Owner: premium@dining.com / password123');
    console.log('👨‍💼 Owner: elite@lounges.com / password123');
    console.log('👨‍💼 Owner: grand@properties.com / password123');
    console.log('=====================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();
