import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  updateProfilePhoto,
  getProfileById,
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.post('/photo', protect, updateProfilePhoto);
router.get('/:id', getProfileById);

export default router;

