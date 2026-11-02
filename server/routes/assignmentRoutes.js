import express from 'express';
import {
  getAllAssignments,
  getAssignmentsByEvent,
  getMyAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignmentStatus,
  approveAssignment,
  declineAssignment,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import { replaceWithBackup } from '../controllers/matchingController.js';
import { protect, optionalProtect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('Organizer', 'Admin'), getAllAssignments);
router.get('/my', protect, getMyAssignments);
router.get('/event/:eventId', optionalProtect, getAssignmentsByEvent);
router.get('/:id', optionalProtect, getAssignmentById);
router.post('/', protect, authorize('Organizer', 'Admin'), createAssignment);
router.patch('/:id/status', protect, updateAssignmentStatus);
router.patch('/:id/approve', protect, authorize('Organizer', 'Admin'), approveAssignment);
router.patch('/:id/decline', protect, authorize('Organizer', 'Admin'), declineAssignment);
router.delete('/:id', protect, authorize('Organizer', 'Admin'), deleteAssignment);
router.post('/:assignmentId/replace', protect, authorize('Organizer', 'Admin'), replaceWithBackup);

export default router;
