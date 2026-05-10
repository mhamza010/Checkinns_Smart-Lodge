import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load env
dotenv.config();

// ✅ Connect to database
connectDB();

// ✅ Import routes
import hotelRoutes from "./routes/hotelRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import loungeRoutes from "./routes/loungeRoutes.js";
import usersFixed from "./routes/usersFixed.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

const app = express();

// ✅ Setup file upload with multer (Cloud or Local)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

let storage;
if (process.env.CLOUDINARY_API_KEY) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'checkinns_uploads',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp']
    }
  });
  console.log('☁️  Cloudinary storage enabled for uploads');
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  console.log('💾 Local disk storage enabled for uploads');
}

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware
app.use(express.json()); // Use express.json instead of bodyParser
app.use(cors());

// Content Security Policy (compatible with Stripe Elements and cdnjs)
app.use((req, res, next) => {
  const csp = [
    "default-src 'self'",
    // Scripts: allow Stripe JS and Radar domains
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://m.stripe.com https://q.stripe.com https://*.stripe.com https://cdnjs.cloudflare.com https://www.googletagmanager.com",
    // XHR/WebSocket connections
    "connect-src 'self' https://api.stripe.com https://m.stripe.com https://q.stripe.com https://*.stripe.com https://cdnjs.cloudflare.com https://www.google-analytics.com https://www.googletagmanager.com",
    // Frames for Elements + 3DS challenge
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.stripe.com",
    // Child sources (legacy alias for frames in some browsers)
    "child-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.stripe.com",
    // Styles
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    // Images - allow data URLs, self, stripe, and external image services
    "img-src 'self' data: blob: https://*.stripe.com https://via.placeholder.com https://*.cloudinary.com https://images.unsplash.com https://www.googletagmanager.com https://*",
    // Fonts
    "font-src 'self' data: https://cdnjs.cloudflare.com"
  ].join('; ');
  res.setHeader('Content-Security-Policy', csp);
  next();
});

// ✅ API Routes
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/lounges", loungeRoutes);
// Use the fixed users router to ensure required endpoints exist
app.use("/api/users", usersFixed);
app.use("/api/owner", ownerRoutes); // ✅ owner summary routes
app.use("/api/chat", chatRoutes); // ✅ gemini proxy route
app.use("/api/payments", paymentRoutes); // ✅ stripe routes
app.use("/api/reviews", reviewRoutes); // ✅ review & ratings routes
app.use("/api/admin", adminRoutes); // ✅ super admin routes
app.use("/api/messages", messageRoutes); // ✅ direct messaging routes
app.use("/api/blogs", blogRoutes); // ✅ travel blogs routes
app.use("/api/support", supportRoutes); // ✅ live support chat routes

// ✅ Serve static frontend files
app.use(express.static("public"));

// ✅ Upload endpoint for images
app.post('/api/upload', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const filePaths = req.files.map(file => {
      // Cloudinary exposes the full URL on 'file.path', Local uses our filename block
      return file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`;
    });
    res.json({ files: filePaths, message: 'Images uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// ✅ Serve favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/images/Logo Checkinns.png'));
});

// ✅ Homepage route
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/checkinns3.html");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
console.log(`✅ Server running on port ${PORT}`);

export default app;
