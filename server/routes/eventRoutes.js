import express from 'express';
import {
  getEvents,
  getMyEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  changeEventStatus,
  publishEvent,
  unpublishEvent,
  applyForEvent,
} from '../controllers/eventController.js';
import { protect, optionalProtect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. My Events (for logged in Organizer/Admin)
router.get('/my-events', protect, authorize('Organizer', 'Admin'), getMyEvents);

// 2. Events Collection
router.route('/')
  .get(optionalProtect, getEvents)
  .post(protect, authorize('Organizer', 'Admin'), createEvent);

// 3. Single Event Operations
router.route('/:id')
  .get(optionalProtect, getEventById)
  .put(protect, authorize('Organizer', 'Admin'), updateEvent)
  .delete(protect, authorize('Organizer', 'Admin'), deleteEvent);

// 4. Status and Publishing Actions
router.patch('/:id/status', protect, authorize('Organizer', 'Admin'), changeEventStatus);
router.post('/:id/publish', protect, authorize('Organizer', 'Admin'), publishEvent);
router.post('/:id/unpublish', protect, authorize('Organizer', 'Admin'), unpublishEvent);

// 5. Freelancer Application
router.post('/:id/apply', protect, authorize('Freelancer'), applyForEvent);

export default router;
