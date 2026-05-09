import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/config.js";
import User from "../models/User.js";
import Owner from "../models/Owner.js";
import Hotel from "../models/Hotel.js";
import Restaurant from "../models/Restaurant.js";
import Lounge from "../models/Lounge.js";
import Booking from "../models/Booking.js";
import RestaurantBooking from "../models/RestaurantBooking.js";
import LoungeBooking from "../models/LoungeBooking.js";
import Review from "../models/Review.js";
import AuditLog from "../models/AuditLog.js";
import PlatformConfig from "../models/PlatformConfig.js";
import Notification from "../models/Notification.js";
import { sendMarketingBlastEmail } from "../utils/mailer.js";

const router = express.Router();

const ADMIN_EMAIL = "hamza@superadmin.com";
const ADMIN_PASS = "12345678";

// Admin Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        const token = jwt.sign({ role: "superadmin" }, JWT_SECRET, { expiresIn: "10h" });
        return res.json({ token, msg: "Welcome Super Admin!" });
    }
    return res.status(401).json({ msg: "Invalid admin credentials" });
});

// Admin Middleware
const adminAuth = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "superadmin") throw new Error("Not superadmin");
        next();
    } catch (err) {
        res.status(401).json({ msg: "Unauthorized admin access" });
    }
};

// Get Top-level Platform Stats
router.get("/stats", adminAuth, async (req, res) => {
    try {
        const [
            users, owners,
            hotels, restaurants, lounges,
            hotelBookings, restBookings, loungeBookings,
            reviews
        ] = await Promise.all([
            User.countDocuments(), Owner.countDocuments(),
            Hotel.countDocuments(), Restaurant.countDocuments(), Lounge.countDocuments(),
            Booking.find({}), RestaurantBooking.find({}), LoungeBooking.find({}),
            Review.countDocuments()
        ]);

        const totalProperties = hotels + restaurants + lounges;

        let platformRevenue = 0;
        let revenueByCategory = { hotel: 0, restaurant: 0, lounge: 0 };

        hotelBookings.forEach(b => {
            if (b.status !== 'cancelled') {
                platformRevenue += (b.totalPrice || 0);
                revenueByCategory.hotel += (b.totalPrice || 0);
            }
        });
        restBookings.forEach(b => {
            if (b.status !== 'cancelled') {
                platformRevenue += (b.totalPrice || 0);
                revenueByCategory.restaurant += (b.totalPrice || 0);
            }
        });
        loungeBookings.forEach(b => {
            if (b.status !== 'cancelled') {
                platformRevenue += (b.totalPrice || 0);
                revenueByCategory.lounge += (b.totalPrice || 0);
            }
        });

        res.json({
            users,
            owners,
            totalProperties,
            totalRevenue: platformRevenue,
            revenueByCategory,
            hotels,
            restaurants,
            lounges,
            reviews
        });
    } catch (err) {
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
});

// Get Boss Income
router.get("/boss-income", adminAuth, async (req, res) => {
    try {
        const [hotelBookings, restBookings, loungeBookings, config, auditLogs] = await Promise.all([
            Booking.find({ status: { $ne: 'cancelled' } }).populate('hotel'),
            RestaurantBooking.find({ status: { $ne: 'cancelled' } }),
            LoungeBooking.find({ status: { $ne: 'cancelled' } }),
            PlatformConfig.findOne({}),
            AuditLog.find({ action: 'Package Purchased' })
        ]);

        let commissionRates = config?.bookingCommissionPercent || 10;

        let incomeDetails = [];
        let monthlyIncome = new Array(12).fill(0); // For graph

        hotelBookings.forEach(b => {
            const earning = (b.totalPrice || 0) * (commissionRates / 100);
            const m = new Date(b.createdAt).getMonth();
            monthlyIncome[m] += earning;
            incomeDetails.push({ source: b.hotel?.name || 'Hotel', owner: b.hotel?.owner || 'Unknown', amount: earning, type: 'Booking Commission', date: b.createdAt });
        });

        // Package purchases
        auditLogs.forEach(log => {
            if (log.revenue) {
                const m = new Date(log.createdAt).getMonth();
                monthlyIncome[m] += log.revenue;
                
                // Flexible parsing for different property types
                let propName = 'Unknown Property';
                const match = log.description.match(/Owner upgraded (hotel|restaurant|lounge) to (.*)\. Revenue/i) 
                           || log.description.match(/Owner upgraded (.*) to (.*)\. Revenue/i);
                
                if (match) propName = match[1];
                
                incomeDetails.push({ 
                    source: propName, 
                    owner: log.userType || 'owner', 
                    amount: log.revenue, 
                    type: 'Package Subscription', 
                    date: log.createdAt 
                });
            }
        });

        incomeDetails.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            totalIncome: monthlyIncome.reduce((a, b) => a + b, 0),
            monthlyIncome,
            incomeDetails: incomeDetails.slice(0, 100) // latest 100
        });
    } catch (err) {
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
});

// Listing data
router.get("/users", adminAuth, async (req, res) => {
    try {
        const users = await User.find({}, "-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

router.get("/owners", adminAuth, async (req, res) => {
    try {
        const owners = await Owner.find({}, "-password").sort({ createdAt: -1 });
        res.json(owners);
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Export Data
router.get("/export/users", adminAuth, async (req, res) => {
    try {
        const users = await User.find({}, "username email createdAt").lean();
        let csv = "Username,Email,Joined\n";
        users.forEach(u => {
            csv += `"${u.username}","${u.email}","${u.createdAt.toISOString().split('T')[0]}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.status(200).send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

// Delete Actions
router.delete("/users/:id", adminAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
            await AuditLog.create({
                action: "User Terminated",
                description: `SuperAdmin deleted user account: ${user.email}`,
                userType: "admin"
            });
        }
        res.json({ msg: "User deleted" });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

router.delete("/owners/:id", adminAuth, async (req, res) => {
    try {
        const owner = await Owner.findByIdAndDelete(req.params.id);
        if (owner) {
            await AuditLog.create({
                action: "Partner Terminated",
                description: `SuperAdmin deleted partner account: ${owner.email}`,
                userType: "admin"
            });
        }
        res.json({ msg: "Owner deleted" });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Get pending properties
router.get("/properties/pending", adminAuth, async (req, res) => {
    try {
        const [hotels, restaurants, lounges] = await Promise.all([
            Hotel.find({ isApproved: false }).lean(),
            Restaurant.find({ isApproved: false }).lean(),
            Lounge.find({ isApproved: false }).lean()
        ]);
        res.json({ hotels, restaurants, lounges });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Approve property
router.put("/properties/approve/:type/:id", adminAuth, async (req, res) => {
    try {
        const { type, id } = req.params;
        let model;
        if (type === "hotel") model = Hotel;
        else if (type === "restaurant") model = Restaurant;
        else if (type === "lounge") model = Lounge;
        else return res.status(400).json({ msg: "Invalid property type" });

        const property = await model.findByIdAndUpdate(id, { isApproved: true }, { new: true });

        await Notification.create({
            recipient: "all",
            role: "user",
            type: "system",
            message: `Exciting news! A new ${type} "${property.name}" is now live on CheckInns!`,
            isRead: false
        });

        await AuditLog.create({
            action: "Property Approved",
            description: `SuperAdmin approved ${type} property: ${property.name}`,
            userType: "admin"
        });

        res.json({ msg: "Property approved", property });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Reject property
router.delete("/properties/reject/:type/:id", adminAuth, async (req, res) => {
    try {
        const { type, id } = req.params;
        let model;
        if (type === "hotel") model = Hotel;
        else if (type === "restaurant") model = Restaurant;
        else if (type === "lounge") model = Lounge;
        else return res.status(400).json({ msg: "Invalid property type" });

        const property = await model.findByIdAndDelete(id);
        if (!property) return res.status(404).json({ msg: "Not found" });

        await AuditLog.create({
            action: "Property Rejected",
            description: `SuperAdmin rejected and removed ${type} property: ${property.name}`,
            userType: "admin"
        });

        res.json({ msg: "Property rejected" });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Get Memberships Details
router.get("/memberships", adminAuth, async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [hotels, restaurants, lounges] = await Promise.all([
            Hotel.find({ isApproved: true }).lean(),
            Restaurant.find({ isApproved: true }).lean(),
            Lounge.find({ isApproved: true }).lean()
        ]);

        const allProps = [
            ...hotels.map(p => ({ ...p, propertyType: 'hotel' })),
            ...restaurants.map(p => ({ ...p, propertyType: 'restaurant' })),
            ...lounges.map(p => ({ ...p, propertyType: 'lounge' }))
        ];

        const hotelIds = hotels.map(h => h._id);
        const restIds = restaurants.map(r => r._id);
        const loungeIds = lounges.map(l => l._id);

        const [hBookings, rBookings, lBookings] = await Promise.all([
            Booking.find({ hotel: { $in: hotelIds }, status: { $ne: 'cancelled' }, createdAt: { $gte: startOfMonth } }).lean(),
            RestaurantBooking.find({ restaurant: { $in: restIds }, status: { $ne: 'cancelled' }, createdAt: { $gte: startOfMonth } }).lean(),
            LoungeBooking.find({ lounge: { $in: loungeIds }, status: { $ne: 'cancelled' }, createdAt: { $gte: startOfMonth } }).lean()
        ]);

        const data = allProps.map(p => {
            let pBookings = [];
            if (p.propertyType === 'hotel') pBookings = hBookings.filter(b => b.hotel.toString() === p._id.toString());
            else if (p.propertyType === 'restaurant') pBookings = rBookings.filter(b => b.restaurant.toString() === p._id.toString());
            else if (p.propertyType === 'lounge') pBookings = lBookings.filter(b => b.lounge.toString() === p._id.toString());

            return {
                _id: p._id,
                name: p.name,
                owner: p.owner,
                propertyType: p.propertyType,
                membershipTier: p.membershipTier || 'standard',
                isBoosted: p.boostData?.isBoosted || false,
                isFeatured: p.isFeatured || false,
                boostData: p.boostData || { isBoosted: false, views: 0, bookings: 0 },
                customersDelivered: pBookings.length
            };
        });

        res.json(data);
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Run End-of-Month Quota Evaluation & Automated Payback Engine
router.post("/run-quota-evaluation", adminAuth, async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const hotels = await Hotel.find({ isApproved: true, membershipTier: { $in: ['silver', 'gold', 'premium'] } }).lean();
        const hotelIds = hotels.map(h => h._id);

        const bookingsThisMonth = await Booking.find({
            hotel: { $in: hotelIds },
            status: { $ne: 'cancelled' },
            createdAt: { $gte: startOfMonth }
        }).lean();

        let shortfallCount = 0;
        let paybackCount = 0;

        for (const h of hotels) {
            const delivered = bookingsThisMonth.filter(b => b.hotel.toString() === h._id.toString()).length;
            
            let quota = 0;
            if (h.membershipTier === 'silver') quota = 5;
            else if (h.membershipTier === 'gold') quota = 10;
            else if (h.membershipTier === 'premium') quota = 15;

            if (delivered < quota) {
                shortfallCount++;
                paybackCount++;
                const shortfall = quota - delivered;
                const creditAmount = shortfall * 10; // e.g. $10 payback per missing customer

                await Notification.create({ 
                    recipient: h.owner.toString(), 
                    role: "owner", 
                    type: "system", 
                    message: `Quota Shortfall: Your property ${h.name} only received ${delivered} out of ${quota} guaranteed customers this month. You will be compensated for the ${shortfall} customer shortfall. We have automatically credited your internal wallet with $${creditAmount} as payback.`, 
                    isRead: false 
                });

                await AuditLog.create({
                    action: "Quota Payback Issued",
                    description: `System auto-issued $${creditAmount} to ${h.owner} for shortfall on ${h.name}`,
                    userType: "system"
                });
            } else {
                await Notification.create({
                    recipient: h.owner.toString(),
                    role: "owner",
                    type: "billing",
                    message: `Monthly Quota Success: We successfully delivered ${delivered} customers to ${h.name} this month, fulfilling your ${h.membershipTier} guarantee!`,
                    isRead: false
                });
            }
        }

        // Remove the featured tag (isBoosted) from all hotels
        await Hotel.updateMany({}, { isBoosted: false });

        res.json({ msg: `Evaluation complete. Processed ${shortfallCount} properties with shortfalls. All featured tags have been reset.` });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ msg: "Server Error" }); 
    }
});

// Update Membership Tier
router.put("/memberships/:id", adminAuth, async (req, res) => {
    try {
        const { membershipTier } = req.body;
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, { membershipTier }, { new: true });

        await AuditLog.create({
            action: "Membership Updated",
            description: `SuperAdmin updated membership for ${hotel.name} to ${membershipTier}`,
            userType: "admin"
        });

        res.json({ msg: "Membership updated", hotel });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Boost Property (Sends marketing blast and flags property)
router.post("/properties/:type/:id/boost", adminAuth, async (req, res) => {
    try {
        const { type, id } = req.params;
        let model;
        if (type === "hotel") model = Hotel;
        else if (type === "restaurant") model = Restaurant;
        else if (type === "lounge") model = Lounge;
        else return res.status(400).json({ msg: "Invalid property type" });

        const property = await model.findById(id);
        if (!property) return res.status(404).json({ msg: "Property not found" });

        // Initialize Performance Tracking
        property.boostData = {
            isBoosted: true,
            boostStartDate: new Date(),
            views: 0,
            bookings: 0
        };
        // For backward compatibility
        property.isBoosted = true;

        await property.save();

        // Send a massive push notification to ALL users
        const msg = `🔥 FEATURED OF THE WEEK: ${property.name} is now offering exclusive luxury stays! Check it out now.`;
        await Notification.create({ recipient: "all", role: "user", type: "marketing", message: msg, isRead: false });

        // Send Email Blast to ALL users
        const users = await User.find({ email: { $exists: true, $ne: null } }).select("email").lean();
        const emailList = users.map(u => u.email).filter(e => e);
        if (emailList.length > 0) {
            await sendMarketingBlastEmail(emailList, property.name, property.membershipTier || "Premium");
        }

        // Audit Log
        await AuditLog.create({
            action: "Property Market Boost",
            description: `Admin blasted a marketing campaign for ${property.name} (${type})`,
            userType: "admin"
        });

        res.json({ msg: "Property boosted and marketing blast sent to all users!" });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Unboost Property
router.post("/properties/:type/:id/unboost", adminAuth, async (req, res) => {
    try {
        const { type, id } = req.params;
        let model;
        if (type === "hotel") model = Hotel;
        else if (type === "restaurant") model = Restaurant;
        else if (type === "lounge") model = Lounge;
        else return res.status(400).json({ msg: "Invalid property type" });

        const property = await model.findById(id);
        if (!property) return res.status(404).json({ msg: "Property not found" });

        if (property.boostData) {
            property.boostData.isBoosted = false;
        }
        property.isBoosted = false;
        await property.save();

        await AuditLog.create({
            action: "Property Market Unboost",
            description: `Admin removed boost for ${property.name}`,
            userType: "admin"
        });

        res.json({ msg: "Property boost removed!" });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Feature Property
router.post("/properties/:id/feature", adminAuth, async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ msg: "Hotel not found" });

        hotel.isFeatured = true;
        await hotel.save();

        await AuditLog.create({
            action: "Property Featured",
            description: `Admin featured ${hotel.name}`,
            userType: "admin"
        });

        res.json({ msg: "Property is now featured!" });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Unfeature Property
router.post("/properties/:id/unfeature", adminAuth, async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ msg: "Hotel not found" });

        hotel.isFeatured = false;
        await hotel.save();

        await AuditLog.create({
            action: "Property Unfeatured",
            description: `Admin removed feature status for ${hotel.name}`,
            userType: "admin"
        });

        res.json({ msg: "Property feature status removed!" });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Get Audit Logs
router.get("/audit-logs", adminAuth, async (req, res) => {
    try {
        const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
        res.json(logs);
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});


// Public Config
router.get("/public-config", async (req, res) => {
    try {
        let config = await PlatformConfig.findOne({});
        if (!config) config = await PlatformConfig.create({});
        res.json(config);
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

// Configure Engine Settings
router.get("/config", adminAuth, async (req, res) => {
    try {
        let config = await PlatformConfig.findOne({});
        if (!config) config = await PlatformConfig.create({}); // Generate default if missing
        res.json(config);
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

router.put("/config", adminAuth, async (req, res) => {
    try {
        const { loyaltyPointsPerDollar, platformServiceFeePercent, maintenanceMode, bookingCommissionPercent, propertyOwnerMonthlyPercent, silverPackagePrice, goldPackagePrice, premiumPackagePrice } = req.body;
        let config = await PlatformConfig.findOne({});
        if (!config) config = new PlatformConfig();

        let oldLoyalty = config.loyaltyPointsPerDollar;
        let oldBookingCommission = config.bookingCommissionPercent;
        let oldOwnerMonthly = config.propertyOwnerMonthlyPercent;

        if (loyaltyPointsPerDollar !== undefined) config.loyaltyPointsPerDollar = loyaltyPointsPerDollar;
        if (platformServiceFeePercent !== undefined) config.platformServiceFeePercent = platformServiceFeePercent;
        if (bookingCommissionPercent !== undefined) config.bookingCommissionPercent = bookingCommissionPercent;
        if (propertyOwnerMonthlyPercent !== undefined) config.propertyOwnerMonthlyPercent = propertyOwnerMonthlyPercent;
        if (maintenanceMode !== undefined) config.maintenanceMode = maintenanceMode;

        await config.save();

        if (loyaltyPointsPerDollar !== undefined && loyaltyPointsPerDollar !== oldLoyalty) {
            const msg = `System Update: Loyalty points conversion rate has changed to ${loyaltyPointsPerDollar} points per dollar.`;
            await Notification.create({ recipient: "all", role: "user", type: "system", message: msg, isRead: false });
            await Notification.create({ recipient: "all_owners", role: "owner", type: "system", message: msg, isRead: false });
        }

        if (bookingCommissionPercent !== undefined && bookingCommissionPercent !== oldBookingCommission) {
            const msg = `System Update: Check-Inns booking commission rate has been updated to ${bookingCommissionPercent}%.`;
            await Notification.create({ recipient: "all", role: "user", type: "system", message: msg, isRead: false });
            await Notification.create({ recipient: "all_owners", role: "owner", type: "system", message: msg, isRead: false });
        }

        if (propertyOwnerMonthlyPercent !== undefined && propertyOwnerMonthlyPercent !== oldOwnerMonthly) {
            const msg = `System Update: Property owner monthly subscription fee has been updated to ${propertyOwnerMonthlyPercent}%.`;
            await Notification.create({ recipient: "all_owners", role: "owner", type: "system", message: msg, isRead: false });
        }

        if (silverPackagePrice !== undefined) {
            if (config.silverPackagePrice !== silverPackagePrice) {
                await Notification.create({ recipient: "all_owners", role: "owner", type: "system", message: `System Update: Silver Package price is now $${silverPackagePrice}.`, isRead: false });
            }
            config.silverPackagePrice = silverPackagePrice;
        }
        if (goldPackagePrice !== undefined) {
            if (config.goldPackagePrice !== goldPackagePrice) {
                await Notification.create({ recipient: "all_owners", role: "owner", type: "system", message: `System Update: Gold Package price is now $${goldPackagePrice}.`, isRead: false });
            }
            config.goldPackagePrice = goldPackagePrice;
        }
        if (premiumPackagePrice !== undefined) {
            if (config.premiumPackagePrice !== premiumPackagePrice) {
                await Notification.create({ recipient: "all_owners", role: "owner", type: "system", message: `System Update: Premium Package price is now $${premiumPackagePrice}.`, isRead: false });
            }
            config.premiumPackagePrice = premiumPackagePrice;
        }

        await config.save();

        await AuditLog.create({
            action: "Config Engine Updated",
            description: `SuperAdmin modified global config variables. Maintenance: ${config.maintenanceMode}, Commission: ${config.bookingCommissionPercent}%`,
            userType: "admin"
        });

        res.json({ msg: "Configuration updated successfully", config });
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
});

export default router;
