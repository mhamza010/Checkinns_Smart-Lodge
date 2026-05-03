import mongoose from 'mongoose';
import User from './models/User.js';
import Owner from './models/Owner.js';
import Hotel from './models/Hotel.js';
import Restaurant from './models/Restaurant.js';
import Lounge from './models/Lounge.js';
import Booking from './models/Booking.js';
import LoungeBooking from './models/LoungeBooking.js';
import RestaurantBooking from './models/RestaurantBooking.js';

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://muhammadhamza662c:vqGoA5nWO6hVYZ49@hotel-project.tputjmq.mongodb.net/checkinns_db?retryWrites=true&w=majority&appName=Hotel-project';

async function cleanupData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    await User.deleteMany({});
    console.log('✅ Cleared Users');

    await Owner.deleteMany({});
    console.log('✅ Cleared Owners');

    await Hotel.deleteMany({});
    console.log('✅ Cleared Hotels');

    await Restaurant.deleteMany({});
    console.log('✅ Cleared Restaurants');

    await Lounge.deleteMany({});
    console.log('✅ Cleared Lounges');

    await Booking.deleteMany({});
    console.log('✅ Cleared Bookings');

    await LoungeBooking.deleteMany({});
    console.log('✅ Cleared Lounge Bookings');

    await RestaurantBooking.deleteMany({});
    console.log('✅ Cleared Restaurant Bookings');

    console.log('\n✅ CLEANUP COMPLETE! All dummy data removed.');
    console.log('💾 Database is now clean and ready for your own data.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup error:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

cleanupData();
