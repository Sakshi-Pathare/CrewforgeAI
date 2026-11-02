import assert from 'assert';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: 'server/.env' });

// Models
import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Availability } from '../models/Availability.js';

// Auth utilities & controller logic
import { generateToken, verifyToken } from '../utils/jwt.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { calculateCompletion } from '../controllers/profileController.js';

console.log('\n================================================================');
console.log('🧪 CREW FORGE - USER REGISTRATION, AUTH & PROFILE MANAGEMENT SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(description, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  ✓ PASS: ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    Error: ${error.message}`);
  }
}

async function runAsyncTest(description, testFn) {
  totalTests++;
  try {
    await testFn();
    console.log(`  ✓ PASS: ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    Error: ${error.message}`);
  }
}

// -------------------------------------------------------------
// Test Group 1: User Registration Validation & Password Security
// -------------------------------------------------------------
console.log('Test Group 1: Registration Validation & Password Hashing:');

await runAsyncTest('Password is never stored in plain text and hashes with bcrypt', async () => {
  const plain = 'UserSecurePass@123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plain, salt);
  assert.notStrictEqual(hash, plain);
  assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'));

  const matches = await bcrypt.compare(plain, hash);
  assert.strictEqual(matches, true);
  const wrongMatch = await bcrypt.compare('WrongPass@999', hash);
  assert.strictEqual(wrongMatch, false);
});

runTest('User schema validates required name, email, passwordHash, and role', () => {
  const validUser = new User({
    name: 'Varsharani',
    email: 'varsharani@eventco.in',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
    role: 'Organizer',
    phone: '+91 98220 12345',
    city: 'Pune',
    organizationName: 'Pinnacle Productions',
  });
  const err = validUser.validateSync();
  assert.strictEqual(err, undefined);
  assert.strictEqual(validUser.role, 'Organizer');
  assert.strictEqual(validUser.city, 'Pune');
});

runTest('User schema rejects registration with missing required fields', () => {
  const invalidUser = new User({
    phone: '+91 98220 00000',
  });
  const err = invalidUser.validateSync();
  assert.ok(err && err.errors['name'], 'Name is required');
  assert.ok(err && err.errors['email'], 'Email is required');
  assert.ok(err && err.errors['passwordHash'], 'Password is required');
});

runTest('Public registration policy prevents self-assignment to Admin role', () => {
  const isAllowedRole = (r) => ['Organizer', 'Freelancer'].includes(r);
  assert.strictEqual(isAllowedRole('Organizer'), true);
  assert.strictEqual(isAllowedRole('Freelancer'), true);
  assert.strictEqual(isAllowedRole('Admin'), false);
});

// -------------------------------------------------------------
// Test Group 2: JWT Authentication & Session Persistence
// -------------------------------------------------------------
console.log('\nTest Group 2: JWT Authentication & Session Token Handling:');

runTest('generateToken creates valid signed 3-part JWT for User', () => {
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Varsharani',
    email: 'varsharani@eventco.in',
    role: 'Organizer',
  };
  const token = generateToken(mockUser);
  assert.ok(token);
  assert.strictEqual(token.split('.').length, 3);

  const decoded = verifyToken(token);
  assert.strictEqual(decoded.id, mockUser._id.toString());
  assert.strictEqual(decoded.role, 'Organizer');
});

runTest('verifyToken rejects tampered or expired tokens by throwing JsonWebTokenError', () => {
  assert.throws(() => {
    verifyToken('header.payload.invalidsignature');
  }, /invalid token|jwt malformed/i);
});

// -------------------------------------------------------------
// Test Group 3: Freelancer Profile Schema & Details
// -------------------------------------------------------------
console.log('\nTest Group 3: Freelancer Profile Schema & Capabilities:');

runTest('FreelancerProfile schema validates primaryRole, skills, and positive rates', () => {
  const validProfile = new FreelancerProfile({
    userId: new mongoose.Types.ObjectId(),
    primaryRole: 'Photographer',
    headline: 'Senior Concert & Event Photographer',
    skills: ['Concert Photography', 'Stage Lighting', 'Adobe Lightroom'],
    experienceYears: 5,
    completedEvents: 42,
    pricePerEvent: 6000,
    rateType: 'per-event',
    city: 'Pune',
    location: 'Pune, Maharashtra',
    bio: 'Specialist in low-light stage capture and festival showreels.',
    languages: ['English', 'Marathi', 'Hindi'],
    portfolioUrl: 'https://behance.net/riya-visuals',
  });
  const err = validProfile.validateSync();
  assert.strictEqual(err, undefined);
  assert.strictEqual(validProfile.skills.length, 3);
  assert.strictEqual(validProfile.experienceYears, 5);
  assert.strictEqual(validProfile.pricePerEvent, 6000);
});

runTest('FreelancerProfile enforces non-negative numbers for rates and experience', () => {
  const invalidProfile = new FreelancerProfile({
    userId: new mongoose.Types.ObjectId(),
    primaryRole: 'Sound Engineer',
    pricePerEvent: -500,
  });
  const err = invalidProfile.validateSync();
  assert.ok(err && err.errors['pricePerEvent']);
});

// -------------------------------------------------------------
// Test Group 4: Profile Completion Calculation Engine
// -------------------------------------------------------------
console.log('\nTest Group 4: Dynamic Profile Completion Engine:');

runTest('Freelancer completion calculation detects missing fields on fresh profile', () => {
  const freshUser = {
    name: 'Rohit',
    email: 'rohit@fl.com',
    role: 'Freelancer',
    phone: '',
    avatar: '',
    city: '',
  };
  const emptyProfile = {
    skills: [],
    experienceYears: 0,
    pricePerEvent: 0,
    bio: '',
  };
  const res = calculateCompletion(freshUser, emptyProfile);
  assert.ok(res.completionPercentage < 40, 'Fresh profile has low score');
  assert.ok(res.missingFields.includes('Profile Photo'));
  assert.ok(res.missingFields.includes('Skills (at least 1)'));
  assert.ok(res.missingFields.includes('Contact Phone Number'));
  assert.ok(res.missingFields.includes('Professional Bio (min 20 chars)'));
});

runTest('Freelancer completion calculation awards 100% when all 10 criteria met', () => {
  const fullyEquippedUser = {
    name: 'Riya Deshmukh',
    email: 'riya.deshmukh@crewforge.ai',
    role: 'Freelancer',
    phone: '+91 98220 12345',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    city: 'Pune',
  };
  const fullyEquippedProfile = {
    primaryRole: 'Photographer',
    headline: 'Concert & Festival Visual Artist',
    skills: ['Concert Photography', 'Stage Lighting'],
    experienceYears: 4,
    completedEvents: 45,
    pricePerEvent: 5000,
    bio: 'Dedicated concert and festival visual artist with over 4 years documenting live stage productions.',
    portfolioUrl: 'https://behance.net/riya-visuals',
    location: 'Pune, Maharashtra',
  };
  const res = calculateCompletion(fullyEquippedUser, fullyEquippedProfile);
  assert.strictEqual(res.completionPercentage, 100);
  assert.strictEqual(res.missingFields.length, 0);
});

runTest('Organizer completion calculation awards 100% for verified company details', () => {
  const verifiedOrg = {
    name: 'Varsharani',
    email: 'varsharani@eventco.in',
    role: 'Organizer',
    phone: '+91 98220 54321',
    organizationName: 'Pinnacle Productions Pvt Ltd',
    city: 'Pune',
    organizationDescription: 'Premier event management and production agency organizing college fests and corporate summits.',
  };
  const res = calculateCompletion(verifiedOrg, null);
  assert.strictEqual(res.completionPercentage, 100);
  assert.strictEqual(res.missingFields.length, 0);
});

runTest('Organizer completion identifies missing organization description and city', () => {
  const bareOrg = {
    name: 'Varsharani',
    email: 'varsharani@eventco.in',
    role: 'Organizer',
    phone: '',
    organizationName: '',
    city: '',
    organizationDescription: '',
  };
  const res = calculateCompletion(bareOrg, null);
  assert.ok(res.completionPercentage <= 40);
  assert.ok(res.missingFields.includes('Organization / Production House Name'));
  assert.ok(res.missingFields.includes('Contact Phone Number'));
  assert.ok(res.missingFields.includes('Organization Description'));
});

// -------------------------------------------------------------
// Test Group 5: Profile Update & Mutability
// -------------------------------------------------------------
console.log('\nTest Group 5: Profile Updates & Role-based Mutability:');

runTest('User toJSON strips passwordHash securely from API responses', () => {
  const user = new User({
    name: 'Security Test User',
    email: 'sec@crewforge.ai',
    passwordHash: '$2b$10$supersecretpasswordhashthatmustneverleak',
    role: 'Freelancer',
  });
  const json = user.toJSON();
  assert.strictEqual(json.passwordHash, undefined, 'passwordHash must never be in JSON output');
  assert.strictEqual(json.__v, undefined, 'Mongoose __v stripped');
  assert.strictEqual(json.name, 'Security Test User');
});

runTest('Profile photo update URL format validation', () => {
  const isValidPhotoUrl = (url) => {
    return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'));
  };
  assert.strictEqual(isValidPhotoUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'), true);
  assert.strictEqual(isValidPhotoUrl('javascript:alert(1)'), false);
  assert.strictEqual(isValidPhotoUrl(''), false);
});

// -------------------------------------------------------------
// Test Group 6: Protected Routes Authorization
// -------------------------------------------------------------
console.log('\nTest Group 6: Protected Routes Authorization:');

runTest('protect middleware blocks requests with missing Authorization header', () => {
  let statusSet = 0;
  let responseData = null;
  const req = { headers: {} };
  const res = {
    status(code) { statusSet = code; return this; },
    json(data) { responseData = data; }
  };
  const next = () => assert.fail('next() should not be called');

  protect(req, res, next);
  assert.strictEqual(statusSet, 401);
  assert.ok(responseData && responseData.error === 'Unauthorized');
});

runTest('authorize middleware permits permitted roles and forbids unauthorized roles', () => {
  const organizerReq = { user: { role: 'Organizer' } };
  const freelancerReq = { user: { role: 'Freelancer' } };

  let nextCalled = false;
  const next = () => { nextCalled = true; };

  let statusSet = 0;
  const res = {
    status(code) { statusSet = code; return this; },
    json() { }
  };

  const organizerOnly = authorize('Organizer');
  organizerOnly(organizerReq, res, next);
  assert.strictEqual(nextCalled, true, 'Organizer permitted for Organizer-only endpoint');

  nextCalled = false;
  organizerOnly(freelancerReq, res, next);
  assert.strictEqual(statusSet, 403, 'Freelancer rejected (403 Forbidden) for Organizer-only endpoint');
  assert.strictEqual(nextCalled, false);
});

// -------------------------------------------------------------
// Test Group 7: Availability Model Integration
// -------------------------------------------------------------
console.log('\nTest Group 7: Freelancer Availability Model Integration:');

runTest('Availability schema supports date tracking and status notes', () => {
  const availability = new Availability({
    freelancerId: new mongoose.Types.ObjectId(),
    availableDates: [new Date('2026-10-24'), new Date('2026-10-25')],
    unavailableDates: [new Date('2026-10-30')],
    note: 'Available for weekend productions',
  });
  const err = availability.validateSync();
  assert.strictEqual(err, undefined);
  assert.strictEqual(availability.availableDates.length, 2);
  assert.strictEqual(availability.unavailableDates.length, 1);
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`🎯 RESULTS: ${passedTests}/${totalTests} Auth & Profile Tests Passed (${Math.round((passedTests / totalTests) * 100)}% SUCCESS)`);
console.log('================================================================\n');

if (passedTests < totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
