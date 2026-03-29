// server/index.js
'use strict';

require('dotenv').config();

const express   = require('express');
const mongoose  = require('mongoose');
const helmet    = require('helmet');
const cors      = require('cors');

const app = express();

// ═══════════════════════════════════════════════════════════════
// TRUST PROXY (Vercel এর জন্য দরকার)
// ═══════════════════════════════════════════════════════════════
app.set('trust proxy', 1);

// ═══════════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = [
  'https://nexsignfrontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    // No origin = same-origin / curl / Postman
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-CSRF-Token',
    'X-Api-Version',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge:         86400, // 24h preflight cache
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO — Vercel serverless এ কাজ করে না
// Dummy endpoint রাখা হয়েছে যাতে frontend error না পায়
// ═══════════════════════════════════════════════════════════════

// io = null (Vercel এ real socket নেই)
app.set('io', null);

// Dummy socket.io endpoint — frontend polling করলে 200 দেবে
app.all('/socket.io*', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Socket.io is not available in serverless mode.',
  });
});

// ═══════════════════════════════════════════════════════════════
// HELMET (Security headers)
// ═══════════════════════════════════════════════════════════════
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy:     false,
    crossOriginEmbedderPolicy: false,
    frameguard:                false,
  }),
);

// ═══════════════════════════════════════════════════════════════
// MANUAL CORS HEADERS (double-safety for Vercel edge)
// ═══════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin',      origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  next();
});

// ═══════════════════════════════════════════════════════════════
// BODY PARSERS
// ═══════════════════════════════════════════════════════════════
app.use(express.json({          limit: '15mb' }));
app.use(express.urlencoded({    limit: '15mb', extended: true }));

// ═══════════════════════════════════════════════════════════════
// MONGODB — Lazy connect (Vercel serverless এর জন্য best)
// ═══════════════════════════════════════════════════════════════
let isConnecting = false;

async function connectDB() {
  // Already connected
  if (mongoose.connection.readyState === 1) return;

  // Connection in progress — wait
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is missing!');
  }

  isConnecting = true;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10s timeout
      socketTimeoutMS:          45000,
      maxPoolSize:              10,
    });
    console.log('✅ MongoDB connected');
  } finally {
    isConnecting = false;
  }
}

// DB middleware — হর request এ connect নিশ্চিত করে
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('💥 DB connection failed:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again.',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
app.get('/api/health', (_req, res) => {
  res.json({
    success:  true,
    status:   'ok',
    db:       mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env:      process.env.NODE_ENV || 'development',
    ts:       new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/feedback',  require('./routes/feedbackRoutes'));

// ═══════════════════════════════════════════════════════════════
// 404 HANDLER
// ═══════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// ═══════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════════════
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  console.error(`💥 [${req.method} ${req.path}] ${status}:`, err.message);

  // CORS error
  if (err.message?.startsWith('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ═══════════════════════════════════════════════════════════════
// LOCAL DEV SERVER
// ═══════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
  const http   = require('http');
  const { Server } = require('socket.io');

  const server = http.createServer(app);

  // Local dev এ real Socket.io চালাও
  const io = new Server(server, {
    cors: corsOptions,
    transports: ['polling', 'websocket'],
  });

  app.set('io', io); // override null

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);
    socket.on('join:document', (docId)  => socket.join(`doc:${docId}`));
    socket.on('join:owner',    (ownerId) => socket.join(`owner:${ownerId}`));
    socket.on('disconnect',    ()        => console.log('🔌 Disconnected:', socket.id));
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(`🚀 Dev server: http://localhost:${PORT}`)
  );
}

module.exports = app;