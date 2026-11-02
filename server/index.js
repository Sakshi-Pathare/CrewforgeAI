import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 1. Reliably load server/.env regardless of current working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverEnvPath = path.resolve(__dirname, '.env');
const rootEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

import { connectDB } from './config/db.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import freelancerRoutes from './routes/freelancerRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Build resilient allowed origins list for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const cleaned = url.trim().replace(/\/+$/, '');
    if (cleaned && !allowedOrigins.includes(cleaned)) {
      allowedOrigins.push(cleaned);
    }
  });
}

// Production-ready CORS configuration supporting Vercel and custom domains
const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow non-browser requests (curl, server-to-server, Render health checks)
    if (!origin) return callback(null, true);

    // 2. In development or test, allow all origins
    if (process.env.NODE_ENV !== 'production') return callback(null, true);

    // 3. Exact match against configured allowed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // 4. Automatically permit Vercel deployment and preview subdomains (*.vercel.app)
    if (/^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // 5. Allow localhost on any port for testing
    if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    console.warn(`⚠️  [CORS] Request blocked from unauthorized origin: ${origin}`);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/profile', profileRoutes);

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Crew Forge AI API Server',
    description: 'AI-Powered Crew Assembly Platform for Event Staffing',
    documentation: '/api/health',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Protected)',
        logout: 'POST /api/auth/logout'
      },
      dashboard: 'GET /api/dashboard/stats (Protected)',
      notifications: {
        list: 'GET /api/notifications (Protected)',
        unreadCount: 'GET /api/notifications/unread-count (Protected)',
        markRead: 'PATCH /api/notifications/:id/read (Protected)',
        markAllRead: 'PATCH /api/notifications/read-all (Protected)'
      },
      matching: {
        recommendations: 'POST /api/matching/recommendations',
        eventRecommendations: 'GET /api/matching/:eventId (Protected)',
        backups: 'GET /api/matching/:eventId/backups (Protected)',
        approve: 'POST /api/matching/:eventId/approve (Organizer/Admin)'
      },
      assignments: {
        my: 'GET /api/assignments/my (Freelancer)',
        byEvent: 'GET /api/assignments/event/:eventId (Protected)',
        create: 'POST /api/assignments (Organizer/Admin)',
        updateStatus: 'PATCH /api/assignments/:id/status (Protected)',
        replaceBackup: 'POST /api/assignments/:id/replace (Organizer/Admin)'
      },
      users: 'GET /api/users (Admin only)',
      freelancers: {
        list: 'GET /api/freelancers',
        detail: 'GET /api/freelancers/:userId',
        updateProfile: 'PUT /api/freelancers/profile (Freelancer)',
        updateAvailability: 'PUT /api/freelancers/availability (Freelancer)'
      },
      events: 'GET /api/events, POST /api/events, PUT /api/events/:id, DELETE /api/events/:id (Protected)',
      feedback: 'POST /api/feedback, GET /api/feedback/event/:eventId, GET /api/feedback/freelancer/:freelancerId',
    },
    status: 'Running'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CorsForbidden',
      message: err.message,
    });
  }
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred.',
  });
});

// Start Server and Connect Database
const startServer = () => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Crew Forge Backend Server running on http://${HOST}:${PORT}`);
    console.log(`📡 Health Check: http://${HOST}:${PORT}/api/health`);
    console.log(`🤖 Matching Engine: http://${HOST}:${PORT}/api/matching/recommendations`);
    console.log(`🔐 Auth Endpoints: http://${HOST}:${PORT}/api/auth`);
    console.log(`🌐 Allowed Client Origins: ${allowedOrigins.join(', ')}`);
    console.log(`======================================================\n`);
  });

  connectDB().catch((err) => {
    console.warn('[Database Connection Failed]', err.message);
  });

  return server;
};

// Start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
