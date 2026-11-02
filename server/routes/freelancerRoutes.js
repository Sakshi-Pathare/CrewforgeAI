import express from 'express';
import {
  getAllFreelancers,
  getFreelancerById,
  updateFreelancerProfile,
  getFreelancerAvailability,
  updateAvailability,
} from '../controllers/freelancerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllFreelancers);
router.put('/profile', protect, authorize('Freelancer'), updateFreelancerProfile);
router.put('/availability', protect, authorize('Freelancer'), updateAvailability);
router.get('/:userId', getFreelancerById);
router.get('/:userId/availability', getFreelancerAvailability);

export default router;
