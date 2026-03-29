'use strict';

require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const helmet   = require('helmet');
const cors     = require('cors');

const app = express();

// Vercel/Proxy support
app.set('trust proxy', 1);

// ════════════════════════════════════════════════════════════════
// ALLOWED ORIGINS (SECURE & OPTIMIZED)
// ════════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = [
  'https://nexsignfrontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: (origin, callback) => {
    // If no origin, it might be a server-to-server or mobile app request
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list OR is a Vercel preview/deployment
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || 
                     origin.endsWith('.vercel.app') ||
                     origin === 'https://nexsignfrontend.vercel.app';

    if (isAllowed) {
      return callback(null, true);
    }
    
    console.warn(`🚫 CORS blocked: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'X-CSRF-Token', 
    'Accept-Version', 
    'Content-Length', 
    'Content-MD5', 
    'Date', 
    'X-Api-Version'
  ],
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply CORS before any other middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ════════════════════════════════════════════════════════════════
// SECURITY HEADERS (PRODUCTION GRADE)
// ════════════════════════════════════════════════════════════════
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Set to false to allow PDF rendering/blobs
  crossOriginEmbedderPolicy: false,
  frameguard: false, // CRITICAL: Allows embedding PDF in iframes (SignerView)
}));

// Manual override for X-Frame-Options (redundant but safe)
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL'); // or 'ALLOW-FROM https://nexsignfrontend.vercel.app'
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// ════════════════════════════════════════════════════════════════
// BODY PARSER & TIMEOUT
// ════════════════════════════════════════════════════════════════
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Dynamic Timeout Middleware
app.use((req, res, next) => {
  const isLargeRequest = req.path.includes('upload') || req.path.includes('sign');
  const timeout = isLargeRequest ? 28000 : 15000; // Vercel limit is 30s

  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT'
      });
    }
  }, timeout);

  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));
  next();
});

// ════════════════════════════════════════════════════════════════
// MONGODB CONNECTION (SERVERLESS OPTIMIZED)
// ════════════════════════════════════════════════════════════════
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error(`❌ DB Error: ${err.message}`);
    // Don't exit process in serverless, just throw to let middleware handle it
    throw err;
  }
};

// DB Connection Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ success: false, message: 'Database Unavailable' });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/feedback',  require('./routes/feedbackRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', uptime: process.uptime() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
});

// ════════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// ════════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = err.status || err.statusCode || 500;
  console.error(`💥 Error [${req.method} ${req.path}]:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal error occurred.' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ════════════════════════════════════════════════════════════════
// SERVER EXPORT (FOR VERCEL)
// ════════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Dev Server: http://localhost:${PORT}`));
}

module.exports = app;
