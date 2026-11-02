import { Feedback } from '../models/Feedback.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';

// @desc    Create feedback for a crew member on an event
// @route   POST /api/feedback
// @access  Private (Organizer, Admin)
export const createFeedback = async (req, res) => {
  try {
    const { eventId, freelancerId, rating, comments } = req.body;

    if (!eventId || !freelancerId || !rating) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Please provide eventId, freelancerId, and star rating (1-5).',
      });
    }

    const feedback = await Feedback.create({
      eventId,
      freelancerId,
      organizerId: req.user._id,
      rating: Number(rating),
      comments: comments || '',
    });

    // Optionally update the freelancer's rolling average rating
    const allReviews = await Feedback.find({ freelancerId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await FreelancerProfile.findOneAndUpdate(
      { userId: freelancerId },
      { rating: Math.round(avgRating * 10) / 10, reviewsCount: allReviews.length }
    );

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to submit feedback',
    });
  }
};

// @desc    Get all feedback for a specific event
// @route   GET /api/feedback/event/:eventId
// @access  Private
export const getFeedbackByEvent = async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ eventId: req.params.eventId })
      .populate('freelancerId', 'name avatar')
      .populate('organizerId', 'name');

    return res.status(200).json({
      success: true,
      count: feedbackList.length,
      feedback: feedbackList,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch event feedback',
    });
  }
};

// @desc    Get all feedback received by a specific freelancer
// @route   GET /api/feedback/freelancer/:freelancerId
// @access  Public
export const getFeedbackByFreelancer = async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ freelancerId: req.params.freelancerId })
      .populate('organizerId', 'name avatar')
      .populate('eventId', 'eventName date')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: feedbackList.length,
      feedback: feedbackList,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch freelancer reviews',
    });
  }
};

