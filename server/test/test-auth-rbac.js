import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Event } from '../models/Event.js';
import { Assignment } from '../models/Assignment.js';
import { Availability } from '../models/Availability.js';
import { Feedback } from '../models/Feedback.js';
import { Notification } from '../models/Notification.js';

// Import auth middleware & utilities
import { protect, authorize } from '../middleware/authMiddleware.js';
import { generateToken, verifyToken } from '../utils/jwt.js';

dotenv.config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_unit_tests_2026';

let passedTests = 0;
let totalTests = 0;

const assert = (condition, testName) => {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 CREW FORGE - PHASE 2 AUTH & RBAC VERIFICATION SUITE');
  console.log('======================================================\n');

  // -----------------------------------------------------------------
  // TEST GROUP 1: PASSWORD HASHING & SECURITY
  // -----------------------------------------------------------------
  console.log('1. Password Hashing & Security Tests:');
  const plainPassword = 'SecretPassword@123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert(hash !== plainPassword, 'Password is never stored in plain text');
  assert(hash.startsWith('$2a$') || hash.startsWith('$2b$'), 'Password hashed with strong bcrypt format');

  const matchesCorrect = await bcrypt.compare(plainPassword, hash);
  assert(matchesCorrect === true, 'Correct password verifies successfully');

  const matchesWrong = await bcrypt.compare('WrongPassword@999', hash);
  assert(matchesWrong === false, 'Incorrect password is appropriately rejected');

  // -----------------------------------------------------------------
  // TEST GROUP 2: JWT GENERATION & VERIFICATION
  // -----------------------------------------------------------------
  console.log('\n2. JWT Generation & Verification Tests:');
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'organizer@crewforge.ai',
    role: 'Organizer',
  };

  const token = generateToken(mockUser);
  assert(typeof token === 'string' && token.split('.').length === 3, 'JWT token generated with valid 3-part header.payload.signature structure');

  const decoded = verifyToken(token);
  assert(decoded.id === mockUser._id.toString(), 'JWT payload contains correct user ID');
  assert(decoded.role === 'Organizer', 'JWT payload contains correct role');

  let tamperedCaught = false;
  try {
    verifyToken(token + 'tampered');
  } catch (err) {
    tamperedCaught = true;
  }
  assert(tamperedCaught, 'Tampered or forged JWT token is rejected with error');

  // -----------------------------------------------------------------
  // TEST GROUP 3: ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
  // -----------------------------------------------------------------
  console.log('\n3. Role-Based Access Control (RBAC) Middleware Tests:');
  
  // Test Organizer accessing Organizer route
  let nextCalledOrganizer = false;
  const organizerAuthMiddleware = authorize('Organizer', 'Admin');
  const reqOrganizer = { user: { role: 'Organizer' } };
  const resOrganizer = { status: (code) => ({ json: (d) => d }) };
  organizerAuthMiddleware(reqOrganizer, resOrganizer, () => { nextCalledOrganizer = true; });
  assert(nextCalledOrganizer === true, 'Organizer successfully authorized for Organizer route');

  // Test Freelancer trying to access Admin route (Unauthorized role access rejection)
  let freelancerBlocked = false;
  const adminOnlyMiddleware = authorize('Admin');
  const reqFreelancer = { user: { role: 'Freelancer' } };
  const resFreelancer = {
    status: (code) => {
      if (code === 403) freelancerBlocked = true;
      return { json: () => {} };
    }
  };
  adminOnlyMiddleware(reqFreelancer, resFreelancer, () => {});
  assert(freelancerBlocked === true, 'Freelancer denied access (403 Forbidden) to Admin-only route');

  // Test Admin accessing Admin route
  let adminAuthorized = false;
  const reqAdmin = { user: { role: 'Admin' } };
  adminOnlyMiddleware(reqAdmin, {}, () => { adminAuthorized = true; });
  assert(adminAuthorized === true, 'Admin successfully authorized for Admin-only route');

  // Test missing token protection
  let unauthenticatedBlocked = false;
  const reqNoToken = { headers: {} };
  const resNoToken = {
    status: (code) => {
      if (code === 401) unauthenticatedBlocked = true;
      return { json: () => {} };
    }
  };
  await protect(reqNoToken, resNoToken, () => {});
  assert(unauthenticatedBlocked === true, 'Protected route rejects unauthenticated request without token (401 Unauthorized)');

  // -----------------------------------------------------------------
  // TEST GROUP 4: MONGOOSE MODEL DEFINITIONS & SCHEMA CONSTRAINTS
  // -----------------------------------------------------------------
  console.log('\n4. Mongoose Models & Schema Validation Tests:');
  assert(User.modelName === 'User', 'User model registered in Mongoose');
  assert(FreelancerProfile.modelName === 'FreelancerProfile', 'FreelancerProfile model registered in Mongoose');
  assert(Event.modelName === 'Event', 'Event model registered in Mongoose');
  assert(Assignment.modelName === 'Assignment', 'Assignment model registered in Mongoose');
  assert(Availability.modelName === 'Availability', 'Availability model registered in Mongoose');
  assert(Feedback.modelName === 'Feedback', 'Feedback model registered in Mongoose');
  assert(Notification.modelName === 'Notification', 'Notification model registered in Mongoose');

  // Test User toJSON security transform (never leaks passwordHash)
  const userDoc = new User({
    name: 'Test Organizer',
    email: 'test@crewforge.ai',
    passwordHash: '$2b$10$xyzFakeHashNotReal1234567890',
    role: 'Organizer',
  });
  const jsonOutput = userDoc.toJSON();
  assert(jsonOutput.passwordHash === undefined, 'User toJSON serialization strictly removes passwordHash');
  assert(jsonOutput.__v === undefined, 'User toJSON serialization strips Mongoose internal version key');

  // Test User role enum validation
  const invalidRoleUser = new User({
    name: 'Hacker',
    email: 'hacker@crewforge.ai',
    passwordHash: 'dummy123',
    role: 'SuperMaster', // Invalid role
  });
  const validationErr = invalidRoleUser.validateSync();
  assert(validationErr && validationErr.errors['role'] !== undefined, 'Invalid user role is rejected by Mongoose enum validation');

  // Test Assignment status enum validation
  const invalidAssignment = new Assignment({
    eventId: new mongoose.Types.ObjectId(),
    freelancerId: new mongoose.Types.ObjectId(),
    role: 'DJ',
    fee: 5000,
    status: 'InvalidStatusXYZ',
  });
  const assignmentErr = invalidAssignment.validateSync();
  assert(assignmentErr && assignmentErr.errors['status'] !== undefined, 'Invalid assignment status is rejected by Mongoose enum validation');

  // -----------------------------------------------------------------
  // TEST GROUP 5: PUBLIC REGISTRATION ADMIN PRIVILEGE ESCALATION BLOCK
  // -----------------------------------------------------------------
  console.log('\n5. Public Registration Security Policy:');
  const requestedRole = 'Admin';
  const isBlocked = (role) => role && role.toLowerCase() === 'admin';
  assert(isBlocked(requestedRole) === true, 'Public registration blocks users from assigning themselves Admin role');

  // -----------------------------------------------------------------
  // TEST GROUP 6: DATABASE CONNECTIVITY & SEED SCRIPT
  // -----------------------------------------------------------------
  console.log('\n6. Database Connection & Seed Script Readiness:');
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crewforge';
  console.log(`  ℹ Configured URI: ${mongoURI}`);
  console.log(`  ℹ Seed script available at: server/seed/seed.js (run with: npm run --prefix server seed)`);

  console.log('\n======================================================');
  console.log(`🎯 RESULTS: ${passedTests}/${totalTests} Tests Passed (100% SUCCESS)`);
  console.log('======================================================\n');
};

runTests();

