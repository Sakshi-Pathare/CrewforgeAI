import express from 'express';
import {
  getAssignmentsByEvent,
  getMyAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignmentStatus,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import { replaceWithBackup } from '../controllers/matchingController.js';
import { protect, optionalProtect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyAssignments);
router.get('/event/:eventId', optionalProtect, getAssignmentsByEvent);
router.get('/:id', optionalProtect, getAssignmentById);
router.post('/', protect, authorize('Organizer', 'Admin'), createAssignment);
router.patch('/:id/status', protect, updateAssignmentStatus);
router.delete('/:id', protect, authorize('Organizer', 'Admin'), deleteAssignment);
router.post('/:assignmentId/replace', protect, authorize('Organizer', 'Admin'), replaceWithBackup);

export default router;
