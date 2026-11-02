import express from 'express';
import {
  createFeedback,
  getFeedbackByEvent,
  getFeedbackByFreelancer,
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('Organizer', 'Admin'), createFeedback);
router.get('/event/:eventId', protect, getFeedbackByEvent);
router.get('/freelancer/:freelancerId', getFeedbackByFreelancer);

export default router;

