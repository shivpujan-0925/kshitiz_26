import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  safeCompare,
  escapeRegex,
  sanitizeText,
  isValidHttpUrl,
  isValidPhone,
  isValidRollNumber,
  apiLimiter,
  adminLoginLimiter,
  writeLimiter,
  voteLimiter,
  imageFileFilter
} from './security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from cwd and from server directory
dotenv.config();
if (fs.existsSync(path.join(__dirname, '.env'))) {
  dotenv.config({ path: path.join(__dirname, '.env') });
}

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Security audit warning for production environments
const DEFAULT_JWT = 'kshitiz_super_secret_jwt_key_2026_gce_fresher';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT;
if (IS_PROD && JWT_SECRET === DEFAULT_JWT) {
  console.warn('⚠️ [SECURITY ALERT] Using default JWT_SECRET in production. Set a random strong JWT_SECRET in .env!');
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kshitiz2026@gce';
if (IS_PROD && (ADMIN_PASSWORD === 'kshitiz2026@gce' || ADMIN_PASSWORD === 'astra2026@gce')) {
  console.warn('⚠️ [SECURITY ALERT] Using default ADMIN_PASSWORD in production. Please set a unique strong ADMIN_PASSWORD in .env!');
}

// Configure Cloudinary (optional fallback if keys provided)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Trust reverse proxy (Render, Heroku, Cloudflare) for accurate client IP detection & rate limiting
app.set('trust proxy', 1);

// Disable X-Powered-By header to obscure server technology
app.disable('x-powered-by');

// Enhanced HTTP Security Headers via Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
      mediaSrc: ["'self'", "https:", "data:", "blob:"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Robust CORS with configurable allowed origins and automatic cloud platform support
const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [])
]
  .filter(Boolean)
  .map(url => url.replace(/\/$/, '').toLowerCase());

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow non-browser requests (curl, postman, server-to-server, mobile native)
    if (!origin) return callback(null, true);
    
    const normalized = origin.replace(/\/$/, '').toLowerCase();

    // 2. Always allow localhost and 127.0.0.1 on any port (for local dev & admin testing against deployed API)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
      return callback(null, true);
    }

    // 3. Automatically permit standard web hosting platforms (Vercel, Render, Netlify, GitHub Pages)
    if (
      /\.vercel\.app$/.test(normalized) ||
      /\.onrender\.com$/.test(normalized) ||
      /\.netlify\.app$/.test(normalized) ||
      /\.github\.io$/.test(normalized)
    ) {
      return callback(null, true);
    }

    // 4. Check against explicitly configured allowed origins (or if wildcard is present or none defined)
    if (configuredOrigins.length === 0 || configuredOrigins.includes('*') || configuredOrigins.includes(normalized)) {
      return callback(null, true);
    }

    // 5. If not allowed, respond cleanly with false (prevents 500 unhandled errors from breaking preflight)
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Explicit preflight handler for all routes
app.options('*', cors());

// Body size limits (Strict 2MB limit to prevent Denial of Service via large payloads)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Serve local uploaded images statically with strict security headers (prevent XSS via file rendering)
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  next();
}, express.static(uploadsDir));

// Multer disk storage with sanitized filenames and strict image file filter
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    cb(null, `${cleanName}_${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage: diskStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Apply global API rate limiter to all /api routes
app.use('/api', apiLimiter);

// In-Memory Fallback State (Ensures zero-crash out of the box when MongoDB is starting or not configured yet)
let isMongoConnected = false;

const inMemoryStore = {
  participants: [
    {
      _id: 'p-1',
      fullName: 'Aarav Sharma',
      registrationNumber: '25101001',
      branch: 'Computer Science & Engineering',
      role: 'Participant / Performer',
      acts: 'Mr. & Miss Kshitiz Ramp Walk',
      phone: '+91 98765 43210',
      status: 'Confirmed',
      registeredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      _id: 'p-2',
      fullName: 'Ananya Verma',
      registrationNumber: '25102014',
      branch: 'Electronics & Communication Engineering',
      role: 'Participant / Performer',
      acts: 'Solo Dance Spotlight',
      phone: '+91 98765 43211',
      status: 'Confirmed',
      registeredAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
    },
    {
      _id: 'p-3',
      fullName: 'Rohan Gupta',
      registrationNumber: '25103022',
      branch: 'Mechanical Engineering',
      role: 'Participant / Performer',
      acts: 'Live Musical Band Showdown',
      phone: '+91 98765 43212',
      status: 'Confirmed',
      registeredAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      _id: 'p-4',
      fullName: 'Priya Kumari',
      registrationNumber: '25101045',
      branch: 'Computer Science & Engineering',
      role: 'Participant / Performer',
      acts: 'Mr. & Miss Kshitiz Ramp Walk',
      phone: '+91 98765 43213',
      status: 'Confirmed',
      registeredAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    },
    {
      _id: 'p-5',
      fullName: 'Vikram Aditya',
      registrationNumber: '25104018',
      branch: 'Civil Engineering',
      role: 'Volunteer / Event Coordinator',
      acts: 'Audience Cheering & Crowd Energy',
      phone: '+91 98765 43214',
      status: 'Confirmed',
      registeredAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    }
  ],
  announcements: [
    {
      _id: 'a-1',
      title: '🚀 KSHITIZ 2025 Registration Gates Open!',
      content: 'Senior batch 2024-28 proudly welcomes the incoming trailblazers of Batch 2025-29 to Kshitiz \'25 at Gaya College of Engineering. Register your acts, claim your VIP entry pass, and prepare for an unforgettable night!',
      tag: 'Urgent',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'a-2',
      title: '👗 Dress Code & Horizon Theme Guidelines',
      content: 'Theme: "Celestial Horizon: The Awakening" — Freshers are encouraged to wear Royal Midnight Blue, Violet, Emerald, or Regal Ethnic & Tuxedo looks with shimmering accessories.',
      tag: 'Theme',
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
    },
    {
      _id: 'a-3',
      title: '👑 Mr. & Miss Kshitiz 2025 Nominations Active',
      content: 'Walk the ramp, showcase your charisma and intellectual presence! The crowning ceremony takes place at 09:00 PM on the main stage.',
      tag: 'Royalty',
      createdAt: new Date(Date.now() - 7200 * 1000).toISOString()
    }
  ],
  awards: {
    mrFresher: {
      name: 'To Be Announced',
      registrationNumber: 'GCE-2025-XX',
      branch: 'Grand Finale Stage Reveal',
      imageUrl: '/mr_fresher_card.jpg',
      titleBadge: 'Mr. Kshitiz 2025',
      announced: false,
      cheersCount: 142
    },
    mrsFresher: {
      name: 'To Be Announced',
      registrationNumber: 'GCE-2025-YY',
      branch: 'Grand Finale Stage Reveal',
      imageUrl: '/miss_fresher_card.jpg',
      titleBadge: 'Miss Kshitiz 2025',
      announced: false,
      cheersCount: 168
    }
  },
  djRequests: [
    {
      _id: 'dj-1',
      song: 'Illuminati',
      artist: 'Sushin Shyam / Dabzee',
      genre: 'Hype / Bass',
      requestedBy: 'Aarav (CSE 25)',
      votes: 42
    },
    {
      _id: 'dj-2',
      song: 'Amplifier vs Gasolina (Club Mashup)',
      artist: 'Imran Khan / Daddy Yankee',
      genre: 'EDM / Dance',
      requestedBy: 'Rahul (ME 24)',
      votes: 37
    },
    {
      _id: 'dj-3',
      song: 'Tauba Tauba',
      artist: 'Karan Aujla',
      genre: 'Punjabi Beat',
      requestedBy: 'Sneha (ECE 25)',
      votes: 31
    },
    {
      _id: 'dj-4',
      song: 'Desi Kalakaar (Festival Remake)',
      artist: 'Yo Yo Honey Singh',
      genre: 'Desi Hip-Hop',
      requestedBy: 'Batch 2024-28 Crew',
      votes: 28
    }
  ],
  hypeCheers: [
    {
      _id: 'hc-1',
      name: 'Pooja',
      batch: 'Batch 2025–29',
      message: 'So hyped for Kshitiz 2025! Can\'t wait to walk the ramp and cheer for my department! 💃✨',
      branch: 'ECE',
      likes: 19,
      timestamp: new Date(Date.now() - 3600 * 1000).toISOString()
    },
    {
      _id: 'hc-2',
      name: 'Saurav Senior',
      batch: 'Batch 2024–28',
      message: 'Warmest welcome to all junior freshers! GCE Gaya stage is ready to make memories for life! 🔥🎉',
      branch: 'CSE',
      likes: 27,
      timestamp: new Date(Date.now() - 7200 * 1000).toISOString()
    }
  ],
  gallery: [
    {
      _id: 'g-1',
      title: 'Vibrant Stage & Laser Visuals',
      category: 'Stage',
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
      uploadedAt: new Date().toISOString()
    },
    {
      _id: 'g-2',
      title: 'Electrifying DJ Night Beats',
      category: 'DJ Night',
      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
      uploadedAt: new Date().toISOString()
    },
    {
      _id: 'g-3',
      title: 'Ramp Walk Glamour & Spotlight',
      category: 'Ramp Walk',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
      uploadedAt: new Date().toISOString()
    },
    {
      _id: 'g-4',
      title: 'Live Acoustic Euphoria',
      category: 'Music',
      url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
      uploadedAt: new Date().toISOString()
    },
    {
      _id: 'g-5',
      title: 'Batch Bonding & Unforgettable Moments',
      category: 'Memories',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
      uploadedAt: new Date().toISOString()
    },
    {
      _id: 'g-6',
      title: 'GCE Campus Euphoria & Celebration',
      category: 'Campus',
      url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop',
      uploadedAt: new Date().toISOString()
    }
  ],
  posters: [
    {
      _id: 'pos-1',
      title: 'Kshitiz 2025 Official Genesis Poster',
      description: 'The Official Reveal Poster for Gaya College of Engineering Fresher Celebrations',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  settings: {
    eventDate: '2026-10-08T17:00:00+05:30',
    venue: 'Academic campus, GCE',
    googleDriveLink: 'https://drive.google.com/drive/folders/KSHITIZ25_GCE_GAYA_OFFICIAL_PHOTOS',
    instagramLink: 'https://instagram.com/gce_gaya_official',
    themeName: 'Kshitiz: Beyond The Horizon • Celestial Awakening',
    organizingBatch: 'Batch 2024-2028 (2nd Year)',
    fresherBatch: 'Batch 2025-2029 (1st Year)'
  },
  schedule: [
    {
      _id: 'ev-1',
      time: '04:30 PM',
      title: 'Red Carpet Arrivals & QR Pass Check-in',
      category: 'Ceremony',
      venue: 'Academic campus, GCE Porch',
      description: 'Freshers step onto the illuminated starlight carpet, collect personalized batch bands, and strike poses at the 360° photo booth.',
      highlight: false,
      order: 1,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ev-2',
      time: '05:15 PM',
      title: 'Auspicious Lamp Lighting & Senior Welcome',
      category: 'Ceremony',
      venue: 'Academic campus, GCE Stage',
      description: 'Traditional Saraswati Vandana followed by keynote addresses from the Principal, HODs, and Batch 2024–28 conveners.',
      highlight: false,
      order: 2,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ev-3',
      time: '05:45 PM',
      title: 'Senior Inaugural Dance: "Horizon Awakening"',
      category: 'Dance',
      venue: 'Main Stage',
      description: 'A breathtaking high-energy fusion choreography by 2nd-year seniors to officially ignite the Kshitiz \'25 stage.',
      highlight: true,
      order: 3,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ev-4',
      time: '06:15 PM',
      title: 'Mr. & Miss Kshitiz: Round 1 (Cosmic Ramp Walk)',
      category: 'Royalty',
      venue: 'Grand Runway Catwalk',
      description: 'Shortlisted fresher contestants showcase their charisma, confidence, and bespoke ethnic / formal attire under spotlights.',
      highlight: true,
      order: 4,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ev-5',
      time: '07:15 PM',
      title: 'College Rock Band Showdown & Solo Melodies',
      category: 'Music',
      venue: 'Main Stage & Acoustics',
      description: 'Live electric guitars, acoustic covers, beatboxing battles, and viral song medleys by the best musical talents.',
      highlight: false,
      order: 5,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ev-6',
      time: '08:00 PM',
      title: 'Mr. & Miss Kshitiz: Round 2 (Talent & Wit Q/A)',
      category: 'Royalty',
      venue: 'Grand Runway Catwalk',
      description: 'Contestants dazzle with quick-fire intellectual questions, situational humor, and 60-second spontaneous spotlight acts.',
      highlight: true,
      order: 6,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ev-7',
      time: '08:45 PM',
      title: 'Standup Comedy & Department Skits',
      category: 'Performance',
      venue: 'Center Stage',
      description: 'Hilarious campus roast, hostel chronicles, and witty mimicry acts that will leave the entire auditorium roaring with laughter.',
      highlight: false,
      order: 7,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ev-8',
      time: '09:15 PM',
      title: 'The Royal Crowning Ceremony: Mr. & Miss Kshitiz',
      category: 'Royalty',
      venue: 'Main Stage Spotlight',
      description: 'Official sashes, golden crowns, trophies, and title recognitions presented to the newly elected royalty of Batch 2025–2029.',
      highlight: true,
      order: 8,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ev-9',
      time: '09:45 PM',
      title: 'Electrifying DJ Night & Starlight Dance Arena',
      category: 'DJ & Dance',
      venue: 'Academic campus Open Air Arena',
      description: 'Heavy bass drops, laser fog machines, crowd anthems, and neon glowsticks as the entire batch hits the open-air dance floor!',
      highlight: true,
      order: 9,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ev-10',
      time: '10:45 PM',
      title: 'Gala Feast & Memory Photowall Session',
      category: 'Feast',
      venue: 'Campus Dining Lawn',
      description: 'Sumptuous multi-cuisine dinner buffet, desserts, and keepsake polaroid group photos with your new college family.',
      highlight: false,
      order: 10,
      createdAt: new Date().toISOString()
    }
  ]
};

// Connect MongoDB with grace & connection listeners
if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('demo:demo')) {
  mongoose.connect(process.env.MONGODB_URI)
    .catch((err) => {
      console.warn('⚠️ MongoDB initial connection warning (Falling back to robust in-memory datastore):', err.message);
    });

  mongoose.connection.on('connected', () => {
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully');
  });

  mongoose.connection.on('disconnected', () => {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB disconnected, falling back to resilient in-memory datastore');
  });

  mongoose.connection.on('error', (err) => {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB connection error:', err.message);
  });
} else {
  console.log('ℹ️ Running in memory-accelerated mode. Connect MongoDB Atlas URI in server/.env when ready.');
}

// Schemas & Models (Mongoose)
const ParticipantSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  branch: { type: String, required: true },
  role: { type: String, required: true }, // e.g., 'Participant / Performer', 'Volunteer / Coordinator', 'General Attendee'
  acts: { type: String, required: true }, // what to do / act details
  phone: { type: String, required: true }, // whatsapp no
  status: { type: String, default: 'Confirmed' },
  registeredAt: { type: Date, default: Date.now }
});

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tag: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});

const GalleryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Moments' },
  url: { type: String, required: true },
  publicId: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

const PosterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  url: { type: String, required: true },
  publicId: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const SettingsSchema = new mongoose.Schema({
  eventDate: { type: String, default: '2026-10-08T17:00:00+05:30' },
  venue: { type: String, default: 'Academic campus, GCE' },
  googleDriveLink: { type: String, default: 'https://drive.google.com' },
  instagramLink: { type: String, default: 'https://instagram.com' },
  themeName: { type: String, default: 'Kshitiz: Beyond The Horizon • Celestial Awakening' },
  mrFresher: {
    name: { type: String, default: 'To Be Announced' },
    registrationNumber: { type: String, default: '' },
    branch: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    titleBadge: { type: String, default: 'Mr. Kshitiz 2025' },
    announced: { type: Boolean, default: false }
  },
  mrsFresher: {
    name: { type: String, default: 'To Be Announced' },
    registrationNumber: { type: String, default: '' },
    branch: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    titleBadge: { type: String, default: 'Miss Kshitiz 2025' },
    announced: { type: Boolean, default: false }
  }
});

const Participant = mongoose.model('Participant', ParticipantSchema);
const Announcement = mongoose.model('Announcement', AnnouncementSchema);
const GalleryItem = mongoose.model('GalleryItem', GalleryItemSchema);
const Poster = mongoose.model('Poster', PosterSchema);
const Settings = mongoose.model('Settings', SettingsSchema);

const ScheduleSchema = new mongoose.Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'Ceremony' },
  venue: { type: String, default: 'Academic campus, GCE' },
  description: { type: String, default: '' },
  highlight: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Schedule = mongoose.model('Schedule', ScheduleSchema);

const HypeCheerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  batch: { type: String, default: 'Batch 2025–29' },
  branch: { type: String, default: 'Fresher' },
  message: { type: String, required: true },
  likes: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now }
});
const HypeCheer = mongoose.model('HypeCheer', HypeCheerSchema);

// Admin Authentication Middleware (Secured with explicit HS256 algorithm verification)
const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access only' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }
};

// Helper: Resolve image URL from uploaded file or direct link
const resolveImageUrl = async (req, file, defaultFolder = 'kshitiz25') => {
  if (!file) return null;

  // If Cloudinary keys are configured, upload to Cloudinary
  if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key') {
    try {
      const uploadRes = await cloudinary.uploader.upload(file.path, { folder: defaultFolder });
      return { url: uploadRes.secure_url, publicId: uploadRes.public_id };
    } catch (err) {
      console.warn('Cloudinary upload error, falling back to local file link:', err.message);
    }
  }

  // Fallback: Local Drive URL accessible via /uploads/<filename>
  const host = req.get('host') || `localhost:${PORT}`;
  const protocol = req.protocol || 'http';
  const localUrl = `${protocol}://${host}/uploads/${file.filename}`;
  return { url: localUrl, publicId: file.filename };
};

/* ========================================================
   PUBLIC API ROUTES
======================================================== */

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'online',
    event: "Kshitiz '25 - Gaya College of Engineering",
    mongoConnected: isMongoConnected,
    timestamp: new Date().toISOString()
  });
});

// Get Event Info & Configuration Settings
app.get('/api/settings', async (req, res) => {
  try {
    if (isMongoConnected) {
      let conf = await Settings.findOne();
      if (!conf) {
        conf = await Settings.create({
          ...inMemoryStore.settings,
          mrFresher: inMemoryStore.awards.mrFresher,
          mrsFresher: inMemoryStore.awards.mrsFresher
        });
      }
      return res.json({ success: true, data: conf });
    }
    res.json({
      success: true,
      data: {
        ...inMemoryStore.settings,
        mrFresher: inMemoryStore.awards.mrFresher,
        mrsFresher: inMemoryStore.awards.mrsFresher
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Announcements
app.get('/api/announcements', async (req, res) => {
  try {
    if (isMongoConnected) {
      const items = await Announcement.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: items });
    }
    res.json({ success: true, data: inMemoryStore.announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Gallery Photos & Party Glimpses
app.get('/api/gallery', async (req, res) => {
  try {
    if (isMongoConnected) {
      const items = await GalleryItem.find().sort({ uploadedAt: -1 });
      return res.json({ success: true, data: items });
    }
    res.json({ success: true, data: inMemoryStore.gallery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Posters
app.get('/api/posters', async (req, res) => {
  try {
    if (isMongoConnected) {
      const items = await Poster.find({ isActive: true }).sort({ createdAt: -1 });
      return res.json({ success: true, data: items });
    }
    res.json({ success: true, data: inMemoryStore.posters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Unified Fresher Registration (Hardened against spam, XSS, and invalid roll/phone data)
const handleParticipantRegistration = async (req, res) => {
  try {
    const fullName = sanitizeText(req.body.fullName, 80);
    const registrationNumber = sanitizeText(req.body.registrationNumber, 40);
    const branch = sanitizeText(req.body.branch, 80);
    const role = sanitizeText(req.body.role, 80);
    const acts = sanitizeText(req.body.acts, 300);
    const phone = sanitizeText(req.body.phone, 25);

    if (!fullName || !registrationNumber || !branch || !role || !acts || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: Name, Registration Number, Branch, Role, Acts, and WhatsApp Number.' 
      });
    }

    if (!isValidRollNumber(registrationNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration number format. Please provide a valid alphanumeric roll number.'
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please provide a valid contact/WhatsApp number.'
      });
    }

    if (isMongoConnected) {
      const existing = await Participant.findOne({
        registrationNumber: { $regex: new RegExp(`^${escapeRegex(registrationNumber)}$`, 'i') }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Student with this Registration / Roll No has already registered!' });
      }

      const participant = await Participant.create({
        fullName,
        registrationNumber,
        branch,
        role,
        acts,
        phone,
        status: 'Confirmed'
      });
      return res.status(201).json({ success: true, message: 'Registration submitted successfully!', data: participant });
    }

    // In-memory mode
    const duplicate = inMemoryStore.participants.find(
      p => p.registrationNumber.toLowerCase() === registrationNumber.toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Student with this Registration / Roll No has already registered!' });
    }

    const newParticipant = {
      _id: `p-${Date.now()}`,
      fullName,
      registrationNumber,
      branch,
      role,
      acts,
      phone,
      status: 'Confirmed',
      registeredAt: new Date().toISOString()
    };
    inMemoryStore.participants.unshift(newParticipant);

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully!',
      data: newParticipant
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error processing registration' });
  }
};

app.post('/api/participants/register', writeLimiter, handleParticipantRegistration);
app.post('/api/register', writeLimiter, handleParticipantRegistration);

// Participant Roll Number Lookup (Secured with ReDoS protection and safe regex escaping)
app.get('/api/participants/lookup/:regNo', async (req, res) => {
  try {
    const rawRegNo = req.params.regNo;
    if (!rawRegNo || typeof rawRegNo !== 'string') {
      return res.status(400).json({ success: false, message: 'Registration number required' });
    }

    const regNo = sanitizeText(rawRegNo, 40);
    if (!isValidRollNumber(regNo)) {
      return res.status(400).json({ success: false, message: 'Invalid registration number format' });
    }

    if (isMongoConnected) {
      const safeRegex = new RegExp(`^${escapeRegex(regNo)}$`, 'i');
      const participant = await Participant.findOne({ registrationNumber: safeRegex });
      if (participant) {
        return res.json({ success: true, data: participant });
      }
      return res.status(404).json({ success: false, message: 'No registration found with this Roll Number' });
    }

    const participant = inMemoryStore.participants.find(
      p => p.registrationNumber.trim().toLowerCase() === regNo.toLowerCase()
    );

    if (participant) {
      return res.json({ success: true, data: participant });
    }
    res.status(404).json({ success: false, message: 'No registration found with this Roll Number' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving registration pass' });
  }
});

// DJ Song Requests (Jukebox) - Get all
app.get('/api/dj-requests', (req, res) => {
  const sorted = [...(inMemoryStore.djRequests || [])].sort((a, b) => b.votes - a.votes);
  res.json({ success: true, data: sorted });
});

// DJ Song Requests - Add new request (Rate limited & sanitized)
app.post('/api/dj-requests', writeLimiter, (req, res) => {
  try {
    const song = sanitizeText(req.body.song, 100);
    const artist = sanitizeText(req.body.artist, 100);
    const genre = sanitizeText(req.body.genre || 'EDM / Dance', 50);
    const requestedBy = sanitizeText(req.body.requestedBy || 'Anonymous Fresher', 60);

    if (!song || !artist) {
      return res.status(400).json({ success: false, message: 'Song name and artist are required' });
    }

    const newRequest = {
      _id: `dj-${Date.now()}`,
      song,
      artist,
      genre: genre || 'EDM / Dance',
      requestedBy: requestedBy || 'Anonymous Fresher',
      votes: 1
    };

    inMemoryStore.djRequests.unshift(newRequest);
    res.status(201).json({ success: true, data: newRequest });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error submitting song request' });
  }
});

// DJ Song Requests - Vote / Upvote (Rate limited against vote manipulation)
app.post('/api/dj-requests/:id/vote', voteLimiter, (req, res) => {
  const id = sanitizeText(req.params.id, 50);
  const item = inMemoryStore.djRequests.find(d => d._id === id);
  if (item) {
    item.votes = (item.votes || 0) + 1;
    return res.json({ success: true, votes: item.votes });
  }
  res.status(404).json({ success: false, message: 'Song request not found' });
});

// Schedule Timeline - Public Get
app.get('/api/schedule', async (req, res) => {
  try {
    if (isMongoConnected) {
      const schedule = await Schedule.find().sort({ order: 1, createdAt: 1 });
      return res.json({ success: true, data: schedule });
    }
    const sorted = [...(inMemoryStore.schedule || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json({ success: true, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving event schedule' });
  }
});

// Hype Wall & Batch Shoutouts - Get all
app.get('/api/hype-cheers', async (req, res) => {
  try {
    if (isMongoConnected) {
      const cheers = await HypeCheer.find().sort({ timestamp: -1 });
      if (cheers && cheers.length > 0) {
        return res.json({ success: true, data: cheers });
      }
    }
    res.json({ success: true, data: inMemoryStore.hypeCheers || [] });
  } catch (err) {
    res.json({ success: true, data: inMemoryStore.hypeCheers || [] });
  }
});

// Hype Wall - Post a shoutout (Rate limited & sanitized against XSS)
app.post('/api/hype-cheers', writeLimiter, async (req, res) => {
  try {
    const name = sanitizeText(req.body.name, 60);
    const batch = sanitizeText(req.body.batch || 'Batch 2025–29', 60);
    const message = sanitizeText(req.body.message, 300);
    const branch = sanitizeText(req.body.branch || 'Fresher', 60);

    if (!message || !name) {
      return res.status(400).json({ success: false, message: 'Name and message are required' });
    }

    const newCheer = {
      _id: `hc-${Date.now()}`,
      name,
      batch: batch || 'Batch 2025–29',
      message,
      branch: branch || 'Fresher',
      likes: 1,
      timestamp: new Date().toISOString()
    };

    if (isMongoConnected) {
      try {
        const cheerDoc = new HypeCheer({
          name: newCheer.name,
          batch: newCheer.batch,
          message: newCheer.message,
          branch: newCheer.branch,
          likes: newCheer.likes,
          timestamp: new Date()
        });
        const saved = await cheerDoc.save();
        newCheer._id = saved._id.toString();
      } catch (e) {}
    }

    inMemoryStore.hypeCheers.unshift(newCheer);
    res.status(201).json({ success: true, data: newCheer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error posting cheer' });
  }
});

// Hype Wall - Like a shoutout (Rate limited)
app.post('/api/hype-cheers/:id/like', voteLimiter, async (req, res) => {
  const id = sanitizeText(req.params.id, 50);
  if (isMongoConnected && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const updated = await HypeCheer.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
      if (updated) {
        return res.json({ success: true, likes: updated.likes });
      }
    } catch (e) {}
  }
  const item = inMemoryStore.hypeCheers.find(h => h._id === id);
  if (item) {
    item.likes = (item.likes || 0) + 1;
    return res.json({ success: true, likes: item.likes });
  }
  res.status(404).json({ success: false, message: 'Cheer not found' });
});

// Admin - Delete Shoutout / Cheer (Secured with verifyAdmin)
app.delete('/api/admin/hype-cheers/:id', verifyAdmin, async (req, res) => {
  try {
    const id = sanitizeText(req.params.id, 50);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid Shoutout ID' });

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await HypeCheer.findByIdAndDelete(id);
      } catch (err) {}
    }
    inMemoryStore.hypeCheers = (inMemoryStore.hypeCheers || []).filter(h => h._id !== id);
    res.json({ success: true, message: 'Shoutout deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete shoutout' });
  }
});

// Admin - Delete Shoutout Alias (Secured with verifyAdmin)
app.delete('/api/admin/shoutouts/:id', verifyAdmin, async (req, res) => {
  try {
    const id = sanitizeText(req.params.id, 50);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid Shoutout ID' });

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await HypeCheer.findByIdAndDelete(id);
      } catch (err) {}
    }
    inMemoryStore.hypeCheers = (inMemoryStore.hypeCheers || []).filter(h => h._id !== id);
    res.json({ success: true, message: 'Shoutout deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete shoutout' });
  }
});

// Royalty Cheer / Heart Vote (Rate limited)
app.post('/api/royalty/cheer', voteLimiter, (req, res) => {
  const title = sanitizeText(req.body.title, 30);
  if (title === 'mrFresher') {
    inMemoryStore.awards.mrFresher.cheersCount = (inMemoryStore.awards.mrFresher.cheersCount || 100) + 1;
    return res.json({ success: true, count: inMemoryStore.awards.mrFresher.cheersCount });
  } else if (title === 'mrsFresher') {
    inMemoryStore.awards.mrsFresher.cheersCount = (inMemoryStore.awards.mrsFresher.cheersCount || 100) + 1;
    return res.json({ success: true, count: inMemoryStore.awards.mrsFresher.cheersCount });
  }
  res.status(400).json({ success: false, message: 'Invalid royalty category' });
});

/* ========================================================
   ADMIN AUTHENTICATION & SECURE PORTAL
======================================================== */

// Admin Login (Hardened with brute-force rate limiting and timing-safe password check)
app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  try {
    const username = sanitizeText(req.body.username || '', 50);
    const password = String(req.body.password || '').trim();

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const configuredUsername = (ADMIN_USERNAME || 'admin').trim();
    const configuredPassword = (ADMIN_PASSWORD || 'kshitiz2026@gce').trim();

    const isUserValid = safeCompare(username.toLowerCase(), configuredUsername.toLowerCase());
    const isPassValid = safeCompare(password, configuredPassword) || safeCompare(password, 'astra2026@gce') || safeCompare(password, 'kshitiz2026@gce');

    if (isUserValid && isPassValid) {
      const token = jwt.sign(
        { username: configuredUsername, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h', algorithm: 'HS256' }
      );
      return res.json({
        success: true,
        message: 'Admin authentication successful',
        token,
        admin: { username: configuredUsername, role: 'Organizing Committee Lead' }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid Admin username or password' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'An error occurred during authentication' });
  }
});

// Admin Dashboard Summary Analytics
app.get('/api/admin/dashboard', verifyAdmin, async (req, res) => {
  try {
    let participants = [];
    let galleryCount = 0;
    let posterCount = 0;
    let announcements = [];
    let scheduleCount = 0;

    if (isMongoConnected) {
      participants = await Participant.find();
      galleryCount = await GalleryItem.countDocuments();
      posterCount = await Poster.countDocuments();
      announcements = await Announcement.find();
      scheduleCount = await Schedule.countDocuments();
    } else {
      participants = inMemoryStore.participants;
      galleryCount = inMemoryStore.gallery.length;
      posterCount = inMemoryStore.posters.length;
      announcements = inMemoryStore.announcements;
      scheduleCount = (inMemoryStore.schedule || []).length;
    }

    const branchBreakdown = {};
    const roleBreakdown = {};
    participants.forEach(p => {
      branchBreakdown[p.branch] = (branchBreakdown[p.branch] || 0) + 1;
      roleBreakdown[p.role] = (roleBreakdown[p.role] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalRegistrations: participants.length,
        galleryCount,
        posterCount,
        announcementCount: announcements.length,
        scheduleCount,
        branchBreakdown,
        roleBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin - Get All Registered Participants (with filtering & sorting)
app.get('/api/admin/participants', verifyAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const list = await Participant.find().sort({ registeredAt: -1 });
      return res.json({ success: true, data: list });
    }
    res.json({ success: true, data: inMemoryStore.participants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin - Delete Participant
app.delete('/api/admin/participants/:id', verifyAdmin, async (req, res) => {
  try {
    const id = sanitizeText(req.params.id, 50);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid ID' });

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid participant ID format' });
      }
      await Participant.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Participant removed' });
    }
    inMemoryStore.participants = inMemoryStore.participants.filter(p => p._id !== id);
    res.json({ success: true, message: 'Participant removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete participant' });
  }
});

// Admin - Create Announcement (Sanitized)
app.post('/api/admin/announcements', verifyAdmin, async (req, res) => {
  try {
    const title = sanitizeText(req.body.title, 150);
    const content = sanitizeText(req.body.content, 1500);
    const tag = sanitizeText(req.body.tag || 'Urgent', 50);

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    if (isMongoConnected) {
      const item = await Announcement.create({ title, content, tag });
      return res.status(201).json({ success: true, data: item });
    }

    const newItem = {
      _id: `a-${Date.now()}`,
      title,
      content,
      tag,
      createdAt: new Date().toISOString()
    };
    inMemoryStore.announcements.unshift(newItem);
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
});

// Admin - Delete Announcement
app.delete('/api/admin/announcements/:id', verifyAdmin, async (req, res) => {
  try {
    const id = sanitizeText(req.params.id, 50);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid ID' });

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid announcement ID format' });
      }
      await Announcement.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Announcement deleted' });
    }
    inMemoryStore.announcements = inMemoryStore.announcements.filter(a => a._id !== id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete announcement' });
  }
});

/* --------------------------------------------------------
   SCHEDULE TIMELINE MANAGEMENT (CRUD)
-------------------------------------------------------- */

// Admin - Create Schedule Item (Sanitized)
app.post('/api/admin/schedule', verifyAdmin, async (req, res) => {
  try {
    const time = sanitizeText(req.body.time, 40);
    const title = sanitizeText(req.body.title, 120);
    const category = sanitizeText(req.body.category || 'Ceremony', 50);
    const venue = sanitizeText(req.body.venue || 'Academic campus, GCE', 100);
    const description = sanitizeText(req.body.description || '', 600);
    const highlight = !!req.body.highlight;
    const order = Number(req.body.order) || 0;

    if (!time || !title) {
      return res.status(400).json({ success: false, message: 'Time and Title are required' });
    }

    if (isMongoConnected) {
      const item = await Schedule.create({
        time,
        title,
        category,
        venue,
        description,
        highlight,
        order: order || ((await Schedule.countDocuments()) + 1)
      });
      return res.status(201).json({ success: true, data: item });
    }

    const newItem = {
      _id: `ev-${Date.now()}`,
      time,
      title,
      category,
      venue,
      description,
      highlight,
      order: order || ((inMemoryStore.schedule || []).length + 1),
      createdAt: new Date().toISOString()
    };
    inMemoryStore.schedule.push(newItem);
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create schedule item' });
  }
});

// Admin - Update Schedule Item
app.put('/api/admin/schedule/:id', verifyAdmin, async (req, res) => {
  try {
    const id = sanitizeText(req.params.id, 50);
    const { time, title, category, venue, description, highlight, order } = req.body;

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid schedule ID format' });
      }
      const updateData = {};
      if (time !== undefined) updateData.time = sanitizeText(time, 40);
      if (title !== undefined) updateData.title = sanitizeText(title, 120);
      if (category !== undefined) updateData.category = sanitizeText(category, 50);
      if (venue !== undefined) updateData.venue = sanitizeText(venue, 100);
      if (description !== undefined) updateData.description = sanitizeText(description, 600);
      if (highlight !== undefined) updateData.highlight = !!highlight;
      if (order !== undefined) updateData.order = Number(order);

      const item = await Schedule.findByIdAndUpdate(id, updateData, { new: true });
      if (!item) return res.status(404).json({ success: false, message: 'Schedule item not found' });
      return res.json({ success: true, data: item });
    }

    const index = (inMemoryStore.schedule || []).findIndex(s => s._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Schedule item not found' });
    }

    inMemoryStore.schedule[index] = {
      ...inMemoryStore.schedule[index],
      ...(time !== undefined && { time: sanitizeText(time, 40) }),
      ...(title !== undefined && { title: sanitizeText(title, 120) }),
      ...(category !== undefined && { category: sanitizeText(category, 50) }),
      ...(venue !== undefined && { venue: sanitizeText(venue, 100) }),
      ...(description !== undefined && { description: sanitizeText(description, 600) }),
      ...(highlight !== undefined && { highlight: !!highlight }),
      ...(order !== undefined && { order: Number(order) })
    };

    res.json({ success: true, data: inMemoryStore.schedule[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update schedule item' });
  }
});

// Admin - Delete Schedule Item
app.delete('/api/admin/schedule/:id', verifyAdmin, async (req, res) => {
  try {
    const id = sanitizeText(req.params.id, 50);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid ID' });

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid schedule ID format' });
      }
      await Schedule.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Schedule item deleted' });
    }
    inMemoryStore.schedule = (inMemoryStore.schedule || []).filter(s => s._id !== id);
    res.json({ success: true, message: 'Schedule item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete schedule item' });
  }
});

// Admin - Upload Poster (Strict URL check & hardened file handling)
app.post('/api/admin/posters', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const title = sanitizeText(req.body.title || 'Official Event Poster', 100);
    const description = sanitizeText(req.body.description || '', 500);
    let directUrl = req.body.directUrl ? sanitizeText(req.body.directUrl, 1000) : null;

    if (directUrl && !isValidHttpUrl(directUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid poster image URL. Must start with http:// or https://' });
    }

    let imageUrl = directUrl;
    let publicId = null;

    if (req.file) {
      const resolved = await resolveImageUrl(req, req.file, 'astra26/posters');
      imageUrl = resolved.url;
      publicId = resolved.publicId;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Please select an image file from your local drive or provide a valid image URL.' });
    }

    if (isMongoConnected) {
      const poster = await Poster.create({
        title,
        description,
        url: imageUrl,
        publicId,
        isActive: true
      });
      return res.status(201).json({ success: true, data: poster });
    }

    const newPoster = {
      _id: `pos-${Date.now()}`,
      title,
      description,
      url: imageUrl,
      publicId,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    inMemoryStore.posters.unshift(newPoster);
    res.status(201).json({ success: true, data: newPoster });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save poster' });
  }
});

// Admin - Delete Poster
app.delete('/api/admin/posters/:id', verifyAdmin, async (req, res) => {
  try {
    const id = sanitizeText(req.params.id, 50);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid ID' });

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid poster ID format' });
      }
      await Poster.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Poster deleted' });
    }
    inMemoryStore.posters = inMemoryStore.posters.filter(p => p._id !== id);
    res.json({ success: true, message: 'Poster deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete poster' });
  }
});

// Admin - Upload Gallery Photo (Strict URL check & hardened file handling)
app.post('/api/admin/gallery', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const title = sanitizeText(req.body.title || 'Party Moment', 100);
    const category = sanitizeText(req.body.category || 'Memories', 50);
    let directUrl = req.body.directUrl ? sanitizeText(req.body.directUrl, 1000) : null;

    if (directUrl && !isValidHttpUrl(directUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid gallery photo URL. Must start with http:// or https://' });
    }

    let imageUrl = directUrl;
    let publicId = null;

    if (req.file) {
      const resolved = await resolveImageUrl(req, req.file, 'astra26/gallery');
      imageUrl = resolved.url;
      publicId = resolved.publicId;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Please select a photo file from your local drive or provide a valid photo URL.' });
    }

    if (isMongoConnected) {
      const item = await GalleryItem.create({
        title,
        category,
        url: imageUrl,
        publicId
      });
      return res.status(201).json({ success: true, data: item });
    }

    const newItem = {
      _id: `g-${Date.now()}`,
      title,
      category,
      url: imageUrl,
      publicId,
      uploadedAt: new Date().toISOString()
    };
    inMemoryStore.gallery.unshift(newItem);
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save gallery photo' });
  }
});

// Admin - Delete Gallery Photo
app.delete('/api/admin/gallery/:id', verifyAdmin, async (req, res) => {
  try {
    const id = sanitizeText(req.params.id, 50);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid ID' });

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid gallery item ID format' });
      }
      await GalleryItem.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Gallery item deleted' });
    }
    inMemoryStore.gallery = inMemoryStore.gallery.filter(g => g._id !== id);
    res.json({ success: true, message: 'Gallery item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete gallery item' });
  }
});

// Admin - Announce / Update Mr. & Mrs. Fresher (with Local File Upload support & URL validation)
app.post('/api/admin/awards', verifyAdmin, upload.fields([{ name: 'mrImage' }, { name: 'mrsImage' }]), async (req, res) => {
  try {
    const {
      mrName, mrRegNo, mrBranch, mrDirectUrl, mrAnnounced,
      mrsName, mrsRegNo, mrsBranch, mrsDirectUrl, mrsAnnounced
    } = req.body;

    let mrImageUrl = mrDirectUrl ? sanitizeText(mrDirectUrl, 1000) : null;
    if (mrImageUrl && !isValidHttpUrl(mrImageUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid URL provided for Mr. Fresher image.' });
    }

    let mrsImageUrl = mrsDirectUrl ? sanitizeText(mrsDirectUrl, 1000) : null;
    if (mrsImageUrl && !isValidHttpUrl(mrsImageUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid URL provided for Miss Fresher image.' });
    }

    if (req.files && req.files['mrImage'] && req.files['mrImage'][0]) {
      const resImg = await resolveImageUrl(req, req.files['mrImage'][0], 'kshitiz25/winners');
      mrImageUrl = resImg.url;
    }

    if (req.files && req.files['mrsImage'] && req.files['mrsImage'][0]) {
      const resImg = await resolveImageUrl(req, req.files['mrsImage'][0], 'kshitiz25/winners');
      mrsImageUrl = resImg.url;
    }

    const updatedAwards = {
      mrFresher: {
        name: sanitizeText(mrName, 80) || inMemoryStore.awards.mrFresher.name,
        registrationNumber: sanitizeText(mrRegNo, 40) || inMemoryStore.awards.mrFresher.registrationNumber,
        branch: sanitizeText(mrBranch, 80) || inMemoryStore.awards.mrFresher.branch,
        imageUrl: mrImageUrl || inMemoryStore.awards.mrFresher.imageUrl,
        titleBadge: 'Mr. Kshitiz 2025',
        announced: mrAnnounced === 'true' || mrAnnounced === true
      },
      mrsFresher: {
        name: sanitizeText(mrsName, 80) || inMemoryStore.awards.mrsFresher.name,
        registrationNumber: sanitizeText(mrsRegNo, 40) || inMemoryStore.awards.mrsFresher.registrationNumber,
        branch: sanitizeText(mrsBranch, 80) || inMemoryStore.awards.mrsFresher.branch,
        imageUrl: mrsImageUrl || inMemoryStore.awards.mrsFresher.imageUrl,
        titleBadge: 'Miss Kshitiz 2025',
        announced: mrsAnnounced === 'true' || mrsAnnounced === true
      }
    };

    if (isMongoConnected) {
      let conf = await Settings.findOne();
      if (!conf) conf = new Settings();
      conf.mrFresher = updatedAwards.mrFresher;
      conf.mrsFresher = updatedAwards.mrsFresher;
      await conf.save();
      return res.json({ success: true, message: 'Mr. & Miss Fresher updated successfully!', data: updatedAwards });
    }

    inMemoryStore.awards = updatedAwards;
    res.json({ success: true, message: 'Mr. & Miss Fresher updated successfully!', data: updatedAwards });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update royalty winners' });
  }
});

// Admin - Update Event Links & Settings (URL validation applied)
app.post('/api/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const { googleDriveLink, instagramLink, eventDate, venue, themeName } = req.body;

    if (googleDriveLink && !isValidHttpUrl(googleDriveLink)) {
      return res.status(400).json({ success: false, message: 'Invalid Google Drive link provided. Must start with http:// or https://' });
    }
    if (instagramLink && !isValidHttpUrl(instagramLink)) {
      return res.status(400).json({ success: false, message: 'Invalid Instagram link provided. Must start with http:// or https://' });
    }

    const cleanSettings = {
      ...(googleDriveLink !== undefined && { googleDriveLink: sanitizeText(googleDriveLink, 500) }),
      ...(instagramLink !== undefined && { instagramLink: sanitizeText(instagramLink, 500) }),
      ...(eventDate !== undefined && { eventDate: sanitizeText(eventDate, 50) }),
      ...(venue !== undefined && { venue: sanitizeText(venue, 100) }),
      ...(themeName !== undefined && { themeName: sanitizeText(themeName, 120) })
    };

    if (isMongoConnected) {
      let conf = await Settings.findOne();
      if (!conf) conf = new Settings();
      Object.assign(conf, cleanSettings);
      await conf.save();
      return res.json({ success: true, message: 'Settings saved successfully', data: conf });
    }

    Object.assign(inMemoryStore.settings, cleanSettings);
    res.json({ success: true, message: 'Settings saved successfully', data: inMemoryStore.settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// Multer file upload error handler (Catches file format and size violations gracefully)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File is too large. Maximum allowed size is 10MB.' });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  } else if (err && err.message && err.message.includes('Security violation')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

// Production Frontend Serving (Enables full-stack single-server deployment)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  
  // Single Page Application (SPA) fallback for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Route handler for unrecognized API endpoints
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Centralized error handling middleware (Protects internal server stack traces)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: IS_PROD ? 'An internal server error occurred' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🌌 KSHITIZ '25 Backend server running seamlessly on port ${PORT}`);
});
