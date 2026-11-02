import express from 'express';
import { 
  getRecommendations, 
  getEventRecommendations, 
  getBackupRecommendations, 
  approveTeamRecommendations 
} from '../controllers/matchingController.js';
import { protect, optionalProtect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate recommendations (public or protected)
router.post('/recommendations', getRecommendations);

// Specific event recommendations
router.get('/:eventId', optionalProtect, getEventRecommendations);

// Standby backups for an event
router.get('/:eventId/backups', optionalProtect, getBackupRecommendations);

// Organizer approves recommended team
router.post('/:eventId/approve', protect, authorize('Organizer', 'Admin'), approveTeamRecommendations);

export default router;

