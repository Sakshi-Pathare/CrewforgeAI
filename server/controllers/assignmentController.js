import { Assignment } from '../models/Assignment.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import {
  notifyNewAssignment,
  notifyAssignmentApproval,
  notifyAssignmentRejection,
  notifyFreelancerCancellation,
  notifyStatusChange,
} from '../services/notificationService.js';

// @desc    Get all confirmed/assigned crew for a specific event
// @route   GET /api/assignments/event/:eventId
// @access  Private
export const getAssignmentsByEvent = async (req, res) => {
  try {
    const assignments = await Assignment.find({ eventId: req.params.eventId })
      .populate('freelancerId', 'name email phone avatar')
      .populate('eventId', 'eventName date location');

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch assignments',
    });
  }
};

// @desc    Get assignments for logged-in freelancer
// @route   GET /api/assignments/my
// @access  Private (Freelancer)
export const getMyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ freelancerId: req.user._id })
      .populate('eventId', 'eventName date location totalBudget status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch your assignments',
    });
  }
};

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('freelancerId', 'name email phone avatar')
      .populate('eventId', 'eventName date location organizerId');

    if (!assignment) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Assignment not found',
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch assignment',
    });
  }
};

// @desc    Create a new crew assignment
// @route   POST /api/assignments
// @access  Private (Organizer, Admin)
export const createAssignment = async (req, res) => {
  try {
    const { eventId, freelancerId, role, fee, isBackup, backupAssignedName } = req.body;

    if (!eventId || !freelancerId || !role || fee === undefined) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Please provide eventId, freelancerId, role, and fee.',
      });
    }

    const event = await Event.findById(eventId);
    const eventName = event ? event.eventName : 'Upcoming Event';

    const assignment = await Assignment.create({
      eventId,
      freelancerId,
      role,
      fee: Number(fee),
      status: 'Confirmed',
      isBackup: !!isBackup,
      backupAssignedName: backupAssignedName || 'Auto Standby',
    });

    // Send persistent notification to the assigned freelancer
    await notifyNewAssignment({
      freelancerId,
      role,
      eventName,
      eventId,
      assignmentId: assignment._id,
    });

    return res.status(201).json({
      success: true,
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to create assignment',
    });
  }
};

// @desc    Update assignment status (e.g. Confirmed, Briefed, On-Site, Completed, Cancelled)
// @route   PATCH /api/assignments/:id/status
// @access  Private
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Briefed', 'On-Site', 'Completed', 'Declined', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const assignment = await Assignment.findById(req.params.id)
      .populate('eventId', 'eventName organizerId')
      .populate('freelancerId', 'name');

    if (!assignment) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Assignment not found',
      });
    }

    // Role check: Freelancers can only update their own assignment to Declined/Confirmed; Organizers or Admin can change any
    if (req.user.role === 'Freelancer' && assignment.freelancerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own assignment',
      });
    }

    const oldStatus = assignment.status;
    assignment.status = status;
    await assignment.save();

    const eventName = assignment.eventId?.eventName || 'Production';
    const organizerId = assignment.eventId?.organizerId;
    const freelancerName = assignment.freelancerId?.name || 'Crew Member';

    // Dispatches appropriate notifications based on status change
    if (status === 'Confirmed' && oldStatus !== 'Confirmed') {
      await notifyAssignmentApproval({
        freelancerId: assignment.freelancerId._id,
        role: assignment.role,
        eventName,
        eventId: assignment.eventId?._id,
        assignmentId: assignment._id,
      });
    } else if (status === 'Declined' && organizerId) {
      await notifyAssignmentRejection({
        organizerId,
        freelancerName,
        role: assignment.role,
        eventName,
        eventId: assignment.eventId?._id,
      });
    } else if (status === 'Cancelled' && organizerId) {
      await notifyFreelancerCancellation({
        organizerId,
        freelancerName,
        role: assignment.role,
        eventName,
        eventId: assignment.eventId?._id,
        assignmentId: assignment._id,
      });
    } else {
      await notifyStatusChange({
        targetUserId: assignment.freelancerId._id,
        role: assignment.role,
        eventName,
        newStatus: status,
        eventId: assignment.eventId?._id,
        assignmentId: assignment._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Assignment status updated to ${status}`,
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to update assignment status',
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Organizer, Admin)
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Assignment not found',
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to delete assignment',
    });
  }
};
