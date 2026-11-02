import express from 'express';
import { getAllUsers, getUserById } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only Admins can list all users
router.get('/', protect, authorize('Admin'), getAllUsers);

// Protected user detail lookup
router.get('/:id', protect, getUserById);

export default router;

