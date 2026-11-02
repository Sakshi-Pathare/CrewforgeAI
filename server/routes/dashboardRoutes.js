import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow optional authentication so dashboard metrics can be viewed seamlessly by organizers or demo sessions
router.get('/stats', optionalProtect, getDashboardStats);

export default router;

