import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Availability } from '../models/Availability.js';

// @desc    Get all freelancers with their professional profile details
// @route   GET /api/freelancers
// @access  Public
export const getAllFreelancers = async (req, res) => {
  try {
    const { role, maxPrice, minRating, location, search } = req.query;

    const query = {};
    if (role && role !== 'All') {
      query.primaryRole = new RegExp(role, 'i');
    }
    if (maxPrice) {
      query.pricePerEvent = { $lte: Number(maxPrice) };
    }
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    const profiles = await FreelancerProfile.find(query)
      .populate('userId', 'name email phone avatar role')
      .sort({ rating: -1, completedEvents: -1 });

    let formatted = profiles
      .filter((p) => p.userId) // Ensure linked user exists
      .map((p) => ({
        id: p.userId._id,
        name: p.userId.name,
        role: p.primaryRole,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        pricePerEvent: p.pricePerEvent,
        skills: p.skills,
        status: p.status,
        isAvailableOnDate: true,
        avatar: p.userId.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
        location: p.location,
        bio: p.bio,
        experienceYears: p.experienceYears,
        completedEvents: p.completedEvents,
        reliabilityScore: p.reliabilityScore,
      }));

    if (search) {
      const term = search.toLowerCase();
      formatted = formatted.filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          f.role.toLowerCase().includes(term) ||
          f.skills.some((s) => s.toLowerCase().includes(term))
      );
    }

    return res.status(200).json({
      success: true,
      count: formatted.length,
      freelancers: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch freelancers',
    });
  }
};

// @desc    Get freelancer profile by User ID
// @route   GET /api/freelancers/:userId
// @access  Public
export const getFreelancerById = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ userId: req.params.userId })
      .populate('userId', 'name email phone avatar role');

    if (!profile || !profile.userId) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Freelancer profile not found',
      });
    }

    const availability = await Availability.findOne({ freelancerId: req.params.userId });

    const formatted = {
      id: profile.userId._id,
      name: profile.userId.name,
      role: profile.primaryRole,
      rating: profile.rating,
      reviewsCount: profile.reviewsCount,
      pricePerEvent: profile.pricePerEvent,
      skills: profile.skills,
      status: profile.status,
      isAvailableOnDate: true,
      avatar: profile.userId.avatar,
      location: profile.location,
      bio: profile.bio,
      experienceYears: profile.experienceYears,
      completedEvents: profile.completedEvents,
      reliabilityScore: profile.reliabilityScore,
      availability: availability
        ? {
            availableDates: availability.availableDates,
            unavailableDates: availability.unavailableDates,
            note: availability.note,
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      freelancer: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch freelancer',
    });
  }
};

// @desc    Update logged-in freelancer's profile
// @route   PUT /api/freelancers/profile
// @access  Private (Freelancer)
export const updateFreelancerProfile = async (req, res) => {
  try {
    const { primaryRole, pricePerEvent, skills, bio, location, status } = req.body;

    const profile = await FreelancerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Profile not found for this account',
      });
    }

    if (primaryRole) profile.primaryRole = primaryRole;
    if (pricePerEvent !== undefined) profile.pricePerEvent = Number(pricePerEvent);
    if (Array.isArray(skills)) profile.skills = skills;
    if (bio !== undefined) profile.bio = bio;
    if (location) profile.location = location;
    if (status) profile.status = status;

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Freelancer profile updated successfully',
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to update profile',
    });
  }
};

// @desc    Get availability for freelancer
// @route   GET /api/freelancers/:userId/availability
// @access  Public
export const getFreelancerAvailability = async (req, res) => {
  try {
    let availability = await Availability.findOne({ freelancerId: req.params.userId });
    if (!availability) {
      availability = {
        freelancerId: req.params.userId,
        availableDates: [],
        unavailableDates: [],
        note: 'Default calendar',
      };
    }

    return res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch availability',
    });
  }
};

// @desc    Update availability for logged-in freelancer
// @route   PUT /api/freelancers/availability
// @access  Private (Freelancer)
export const updateAvailability = async (req, res) => {
  try {
    const { availableDates, unavailableDates, note } = req.body;

    let availability = await Availability.findOne({ freelancerId: req.user._id });

    if (!availability) {
      availability = new Availability({
        freelancerId: req.user._id,
        availableDates: availableDates || [],
        unavailableDates: unavailableDates || [],
        note: note || '',
      });
    } else {
      if (Array.isArray(availableDates)) availability.availableDates = availableDates;
      if (Array.isArray(unavailableDates)) availability.unavailableDates = unavailableDates;
      if (note !== undefined) availability.note = note;
    }

    await availability.save();

    return res.status(200).json({
      success: true,
      message: 'Availability calendar updated successfully',
      availability,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to update availability',
    });
  }
};
