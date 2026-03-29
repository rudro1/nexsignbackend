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
// CORS & ORIGINS
// ═══════════════════════════════════════════════════════════════
const corsOptions = {
  origin: 'https://nexsignfrontend.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO (Vercel Optimized)
// ═══════════════════════════════════════════════════════════════
const io = new Server(server, {
  cors: {
    origin: 'https://nexsignfrontend.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['polling', 'websocket'], // Allow both for better compatibility
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join:document', (docId) => socket.join(`doc:${docId}`));
  socket.on('join:owner', (ownerId) => socket.join(`owner:${ownerId}`));
});

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARES
// ═══════════════════════════════════════════════════════════════
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: false,
}));

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// ═══════════════════════════════════════════════════════════════
// MONGODB
// ═══════════════════════════════════════════════════════════════
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) {
    console.error('💥 MONGO_URI is missing!');
    throw new Error('Database configuration missing');
  }
  await mongoose.connect(process.env.MONGO_URI);
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// ═══════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`💥 [${req.method} ${req.path}] ${status}:`, err.message);
  res.status(status).json({ success: false, message: err.message });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`🚀 Dev server: http://localhost:${PORT}`));
}

module.exports = app;