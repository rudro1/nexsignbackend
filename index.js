'use strict';

require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const helmet   = require('helmet');
const cors     = require('cors');

const app = express();

// ═══════════════════════════════════════════════════════════════
// TRUST PROXY
// ═══════════════════════════════════════════════════════════════
app.set('trust proxy', 1);

// ═══════════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS || ''
).split(',').map(o => o.trim()).filter(Boolean);

// ✅ Default origins সবসময় include
const DEFAULT_ORIGINS = [
  'https://nexsignfrontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
];

const ALL_ORIGINS = [
  ...new Set([...DEFAULT_ORIGINS, ...ALLOWED_ORIGINS]),
];

const corsOptions = {
  origin: (origin, callback) => {
    // No origin = curl / Postman / same-origin
    if (!origin) return callback(null, true);

    if (ALL_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`🚫 CORS blocked: ${origin}`);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 'Authorization',
    'X-Requested-With', 'Accept',
    'X-CSRF-Token', 'X-Api-Version',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge:         86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ═══════════════════════════════════════════════════════════════
// HELMET
// ═══════════════════════════════════════════════════════════════
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy:     false,
    crossOriginEmbedderPolicy: false,
    // ✅ COOP header remove — Firebase popup fix
    crossOriginOpenerPolicy:   false,
  }),
);

// ═══════════════════════════════════════════════════════════════
// MANUAL CORS HEADERS (Vercel edge safety)
// ═══════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALL_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin',      origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // ✅ COOP header — Firebase Google popup fix
  res.setHeader('Cross-Origin-Opener-Policy',   'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');

  next();
});

// ═══════════════════════════════════════════════════════════════
// BODY PARSERS
// ═══════════════════════════════════════════════════════════════
app.use(express.json({       limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO — Vercel serverless dummy
// ═══════════════════════════════════════════════════════════════
app.set('io', null);

app.all('/socket.io*', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Socket.io not available in serverless mode.',
  });
});

// ═══════════════════════════════════════════════════════════════
// MONGODB — Lazy connect
// ═══════════════════════════════════════════════════════════════
let isConnecting = false;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  if (isConnecting) {
    await new Promise(r => setTimeout(r, 500));
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is missing!');
  }

  isConnecting = true;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS:          45_000,
      maxPoolSize:              10,
    });
    console.log('✅ MongoDB connected');
  } finally {
    isConnecting = false;
  }
}

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
    success: true,
    status:  'ok',
    db:      mongoose.connection.readyState === 1
               ? 'connected'
               : 'disconnected',
    env:     process.env.NODE_ENV || 'development',
    ts:      new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/feedback',  require('./routes/feedbackRoutes'));

// ✅ Templates route add
// app.use('/api/templates', require('./routes/templateRoutes'));
// (templateRoutes তৈরি হলে uncomment করো)

// ═══════════════════════════════════════════════════════════════
// 404
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
  console.error(
    `💥 [${req.method} ${req.path}] ${status}:`,
    err.message,
  );

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
  const http       = require('http');
  const { Server } = require('socket.io');
  const server     = http.createServer(app);

  const io = new Server(server, {
    cors:       corsOptions,
    transports: ['polling', 'websocket'],
  });

  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);
    socket.on('join:document', (id) => socket.join(`doc:${id}`));
    socket.on('join:owner',    (id) => socket.join(`owner:${id}`));
    socket.on('disconnect', () =>
      console.log('🔌 Disconnected:', socket.id));
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(`🚀 Dev server: http://localhost:${PORT}`),
  );
}

module.exports = app;