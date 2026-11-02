import mongoose from 'mongoose';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

// Protect routes: Verifies JWT token and attaches user to request
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. No authentication token provided.',
    });
  }

  // Fast guard: If database is disconnected, fail gracefully instead of timing out
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'ServiceUnavailable',
      message: 'Authentication service temporarily unavailable because the database is offline.',
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token. Please sign in again.',
    });
  }
};

// Optional protect: attaches user if token is valid, but allows unauthenticated requests
export const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token && mongoose.connection.readyState === 1) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        req.user = user;
      }
    } catch {
      // Token invalid or expired; proceed without attaching user
    }
  }

  next();
};

// Authorize roles: Ensures user belongs to one of the authorized roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required prior to authorization.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `User role '${req.user.role}' is not authorized to access this resource. Required role(s): ${roles.join(', ')}.`,
      });
    }

    next();
  };
};

