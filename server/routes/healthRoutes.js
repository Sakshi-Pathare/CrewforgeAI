import express from 'express';
import { checkHealth, reconnectDatabase } from '../controllers/healthController.js';

const router = express.Router();

// GET /api/health - System health check endpoint
router.get('/', checkHealth);

// POST /api/health/reconnect - Trigger on-demand reconnection to MongoDB Atlas
router.post('/reconnect', reconnectDatabase);

export default router;
