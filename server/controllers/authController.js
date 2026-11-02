import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { generateToken } from '../utils/jwt.js';

// @desc    Register a new user (Organizer or Freelancer)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'Organizer', 
      phone = '', 
      avatar = '',
      // Optional Freelancer details
      primaryRole,
      skills,
      pricePerEvent,
      experienceYears,
      location,
      bio
    } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 2. Security requirement: Prevent Admin role self-assignment during public registration
    if (role && role.toLowerCase() === 'admin') {
      return res.status(400).json({
        error: 'SecurityError',
        message: 'Registration for Admin role is not permitted via public registration.',
      });
    }

    const assignedRole = role === 'Freelancer' ? 'Freelancer' : 'Organizer';

    // 3. Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        error: 'DuplicateEmail',
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    // 4. Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      phone: phone.trim(),
      avatar: avatar.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
    });

    // 6. If role is Freelancer, automatically create associated FreelancerProfile
    let profile = null;
    if (assignedRole === 'Freelancer') {
      profile = await FreelancerProfile.create({
        userId: user._id,
        primaryRole: primaryRole || 'Event Specialist',
        skills: Array.isArray(skills) ? skills : ['General Operations'],
        pricePerEvent: Number(pricePerEvent) || 4000,
        experienceYears: Number(experienceYears) || 2,
        location: location || 'Pune, Maharashtra',
        bio: bio || `${user.name} is a dedicated event freelancer available for shows and productions.`,
      });
    }

    // 7. Generate JWT
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      profile: profile || undefined,
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to register account',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Please provide both email and password.',
      });
    }

    // 2. Find user by email (explicitly selecting passwordHash since select: false)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Invalid email or password.',
      });
    }

    // 3. Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Invalid email or password.',
      });
    }

    // 4. Generate JWT
    const token = generateToken(user);

    // 5. If Freelancer, fetch profile
    let profile = null;
    if (user.role === 'Freelancer') {
      profile = await FreelancerProfile.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      profile: profile || undefined,
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Authentication failed',
    });
  }
};

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private (Requires JWT token)
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'Freelancer') {
      profile = await FreelancerProfile.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      profile: profile || undefined,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch current user',
    });
  }
};

// @desc    Sign out user / clear session
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully. Client should discard authentication token.',
  });
};

