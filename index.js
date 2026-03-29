'use strict';

require('dotenv').config();

const express    = require('express');
const mongoose   = require('mongoose');
const helmet     = require('helmet');
const cors       = require('cors');
const http       = require('http');
const { Server } = require('socket.io');

const app    = express();
const server = http.createServer(app);

// ═══════════════════════════════════════════════════════════════
// ALLOWED ORIGINS
// ═══════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = [
  'https://nexsignfrontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
];

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════════
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    console.warn(`🚫 CORS blocked: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials:          true,
  methods:              ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 'Authorization', 'X-Requested-With',
    'Accept', 'X-CSRF-Token', 'Accept-Version',
    'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version',
  ],
  exposedHeaders:       ['Content-Disposition', 'Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue:    false,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO
// ═══════════════════════════════════════════════════════════════
const io = new Server(server, {
  cors: {
    origin:      (origin, cb) =>
      isOriginAllowed(origin) ? cb(null, true) : cb(new Error('CORS')),
    methods:     ['GET', 'POST'],
    credentials: true,
  },
  transports:           ['websocket', 'polling'],
  pingTimeout:          20000,
  pingInterval:         25000,
  upgradeTimeout:       10000,
  allowEIO3:            true,
});

// Attach io to app so routes can emit
app.set('io', io);

// Socket.io connection handler
io.on('connection', (socket) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔌 Socket connected: ${socket.id}`);
  }

  // Join document room (for real-time updates)
  socket.on('join:document', (documentId) => {
    if (documentId) {
      socket.join(`doc:${documentId}`);
    }
  });

  // Join owner room (dashboard updates)
  socket.on('join:owner', (ownerId) => {
    if (ownerId) {
      socket.join(`owner:${ownerId}`);
    }
  });

  socket.on('disconnect', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// TRUST PROXY (Vercel)
// ═══════════════════════════════════════════════════════════════
app.set('trust proxy', 1);

// ═══════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════
app.use(helmet({
  crossOriginResourcePolicy:  { policy: 'cross-origin' },
  contentSecurityPolicy:      false,
  crossOriginEmbedderPolicy:  false,
  frameguard:                 false,
}));

// Frame + CORS headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// ═══════════════════════════════════════════════════════════════
// BODY PARSER
// ═══════════════════════════════════════════════════════════════
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// ═══════════════════════════════════════════════════════════════
// REQUEST LOGGER (Dev only)
// ═══════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`→ ${req.method} ${req.path}`);
    next();
  });
}

// ═══════════════════════════════════════════════════════════════
// TIMEOUT MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  const isHeavy =
    req.path.includes('upload') ||
    req.path.includes('sign/submit') ||
    req.path.includes('template');

  // Vercel max is 30s → keep under
  const timeout = isHeavy ? 27_000 : 14_000;

  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        code:    'TIMEOUT',
        message: 'Request timed out. Please try again.',
      });
    }
  }, timeout);

  res.on('finish', () => clearTimeout(timer));
  res.on('close',  () => clearTimeout(timer));
  next();
});

// ═══════════════════════════════════════════════════════════════
// MONGODB — Serverless optimized singleton
// ═══════════════════════════════════════════════════════════════
let _dbConnected = false;

async function connectDB() {
  // Already connected → reuse
  if (_dbConnected && mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize:              10,
      minPoolSize:              2,
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS:          45_000,
      heartbeatFrequencyMS:     10_000,
    });

    _dbConnected = true;

    mongoose.connection.on('disconnected', () => {
      _dbConnected = false;
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      _dbConnected = true;
      console.log('✅ MongoDB reconnected');
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ MongoDB connected');
    }
  } catch (err) {
    _dbConnected = false;
    console.error('❌ MongoDB error:', err.message);
    throw err;
  }
}

// DB middleware — every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    return res.status(503).json({
      success: false,
      code:    'DB_UNAVAILABLE',
      message: 'Database temporarily unavailable. Please try again.',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/feedback',  require('./routes/feedbackRoutes'));

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success:  true,
    status:   'active',
    db:       mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime:   Math.floor(process.uptime()),
    memory:   `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    env:      process.env.NODE_ENV || 'development',
    version:  process.env.npm_package_version || '1.0.0',
    timestamp:new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════════════════════════
// 404 HANDLER
// ═══════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code:    'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found.`,
  });
});

// ═══════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════════════
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (res.headersSent) return;

  const status = err.status || err.statusCode || 500;

  console.error(
    `💥 [${req.method} ${req.path}] ${status}:`,
    err.message,
  );

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      code:    'FILE_TOO_LARGE',
      message: 'File size exceeds 15MB limit.',
    });
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      code:    'INVALID_FILE_TYPE',
      message: 'Only PDF files are accepted.',
    });
  }

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      code:    'CORS_ERROR',
      message: 'Origin not allowed.',
    });
  }

  // MongoDB validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      code:    'VALIDATION_ERROR',
      message: messages[0] || 'Validation failed.',
      errors:  messages,
    });
  }

  // MongoDB duplicate
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      code:    'DUPLICATE_ERROR',
      message: 'A record with this data already exists.',
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      code:    'INVALID_TOKEN',
      message: 'Invalid token.',
    });
  }

  // Generic
  return res.status(status).json({
    success: false,
    code:    'SERVER_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An internal error occurred.'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Dev server: http://localhost:${PORT}`);
    console.log(`🔌 Socket.io: ws://localhost:${PORT}`);
  });
}

// Vercel → export app (not server)
module.exports = app;