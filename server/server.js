import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customizationRoutes from './routes/customizationRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express App
const app = express();

// Trust proxy - required for Vercel & reverse proxies (fixes express-rate-limit)
app.set('trust proxy', 1);

// Connect to MongoDB (graceful fallback to demo mode if unreachable)
const dbReady = connectDB();

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during migration / dev
    }
  },
  credentials: true
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'demo-mode (not connected)',
    appName: 'Aura Decor API',
    timestamp: new Date().toISOString()
  });
});

// Make sure DB connection attempt has finished (important on serverless cold starts)
app.use('/api', async (req, res, next) => {
  try { await dbReady; } catch (e) { /* demo mode */ }
  next();
});

// Routes that need a real database: fail fast with a clear message instead of hanging for 10s
const requireDb = (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  res.status(503).json({
    message: 'Database not connected. Check MONGODB_URI in server/.env and Atlas Network Access (0.0.0.0/0), then restart the server.'
  });
};

// Mount Routes
app.use('/api/auth', requireDb, authRoutes);
app.use('/api/products', productRoutes); // has its own demo-mode fallback
app.use('/api/designs', requireDb, customizationRoutes);
app.use('/api/orders', requireDb, orderRoutes);
app.use('/api/ai', aiRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  // If Atlas was unreachable at boot, keep retrying in the background (no request blocking)
  setInterval(() => {
    if (mongoose.connection.readyState === 0) connectDB();
  }, 30000).unref();

  // Wait for the DB first so the first page load already has real data
  dbReady.finally(() => {
    app.listen(PORT, () => {
      console.log(`[Aura Decor Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  });
}

export default app;
