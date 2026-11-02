import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  updateProfilePhoto,
  getProfileById,
  addCertificate,
  updateCertificate,
  deleteCertificate,
} from '../controllers/profileController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.post('/photo', protect, updateProfilePhoto);

// Certificate routes (Freelancer only)
router.post('/certificates', protect, authorize('Freelancer'), addCertificate);
router.put('/certificates/:certId', protect, authorize('Freelancer'), updateCertificate);
router.delete('/certificates/:certId', protect, authorize('Freelancer'), deleteCertificate);

router.get('/:id', getProfileById);

export default router;

