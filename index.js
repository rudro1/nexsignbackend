'use strict';

require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const helmet   = require('helmet');
const cors     = require('cors');

const app = express();

app.set('trust proxy', 1);

// ═══════════════════════════════════════════════════════════════
// ALLOWED ORIGINS
// ═══════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = [
  'https://nexsignfrontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

// ═══════════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════════
const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked: ${origin}`);
      callback(new Error(`CORS blocked: ${origin}`));
    }
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
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy:     false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy:   false,
  }),
);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    res.setHeader(
      'Access-Control-Allow-Origin',
      origin || 'https://nexsignfrontend.vercel.app',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization,X-Requested-With,Accept,X-CSRF-Token',
    );
  }

  res.setHeader('Cross-Origin-Opener-Policy',   'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');

  if (req.method === 'OPTIONS') return res.status(200).end();

  next();
});

// ═══════════════════════════════════════════════════════════════
// BODY PARSERS
// ═══════════════════════════════════════════════════════════════
app.use(express.json({       limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO dummy (Vercel serverless)
// ═══════════════════════════════════════════════════════════════
app.set('io', null);
app.all('/socket.io*', (_req, res) => {
  res.status(200).json({ success: true, message: 'Serverless mode.' });
});

// ═══════════════════════════════════════════════════════════════
// MONGODB — singleton connection
// ═══════════════════════════════════════════════════════════════
let isConnecting = false;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (isConnecting) {
    await new Promise(r => setTimeout(r, 500));
    return;
  }
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing!');

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
    console.error('💥 DB failed:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database unavailable.',
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
               ? 'connected' : 'disconnected',
    env:     process.env.NODE_ENV || 'development',
    ts:      new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/templates', require('./routes/templateRoutes')); // ✅ NEW
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/feedback',  require('./routes/feedbackRoutes'));

// ═══════════════════════════════════════════════════════════════
// 404
// ═══════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Not found: ${req.method} ${req.path}`,
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════════════════════════════
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  console.error(`💥 [${req.method} ${req.path}]:`, err.message);

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
// LOCAL DEV ONLY
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

  io.on('connection', socket => {
    console.log('🔌 Socket:', socket.id);
    socket.on('join:document', id => socket.join(`doc:${id}`));
    socket.on('join:owner',    id => socket.join(`owner:${id}`));
    socket.on('disconnect',    ()  => console.log('🔌 Left:', socket.id));
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(`🚀 http://localhost:${PORT}`));
}

module.exports = app;