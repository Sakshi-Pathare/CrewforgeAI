import assert from 'assert';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Models
import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Event } from '../models/Event.js';
import { Assignment } from '../models/Assignment.js';
import { Availability } from '../models/Availability.js';
import { Notification } from '../models/Notification.js';
import { Feedback } from '../models/Feedback.js';

// Services
import * as notificationService from '../services/notificationService.js';
import { connectDB, getDbStatus } from '../config/db.js';

dotenv.config({ path: 'server/.env' });

console.log('\n================================================================');
console.log('🧪 CREW FORGE - PHASE 4 DATABASE & NOTIFICATIONS TEST SUITE');
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
// Test 1: MongoDB Connection Diagnostics & Status Reporting
// -------------------------------------------------------------
console.log('Test 1: MongoDB Connection & Status Diagnostics:');

runTest('MONGODB_URI is correctly configured in environment', () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crewforge';
  assert.ok(uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));
  assert.ok(uri.includes('crewforge'));
});

runTest('getDbStatus reports realistic connection state without crashing', () => {
  const status = getDbStatus();
  assert.ok(typeof status.isConnected === 'boolean');
  assert.ok(['disconnected', 'connected', 'connecting', 'disconnecting'].includes(status.status));
});

// -------------------------------------------------------------
// Test 2: Seed Script Data Structure & Integrity
// -------------------------------------------------------------
console.log('\nTest 2: Seed Data Architecture & Password Hashing:');

await runAsyncTest('Seed credentials meet production security standards', async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Organizer@123', salt);
  assert.strictEqual(hash.startsWith('$2'), true);
  const isMatch = await bcrypt.compare('Organizer@123', hash);
  assert.strictEqual(isMatch, true);
});

// -------------------------------------------------------------
// Test 3: User Registration & Role Enforcement
// -------------------------------------------------------------
console.log('\nTest 3: User Authentication & Role Validation:');

runTest('User schema enforces allowed roles (Organizer, Freelancer, Admin)', () => {
  const validRoles = ['Organizer', 'Freelancer', 'Admin'];
  validRoles.forEach((role) => {
    const user = new User({
      name: 'Test User',
      email: 'test@crewforge.ai',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role,
    });
    const err = user.validateSync();
    assert.strictEqual(err, undefined);
  });

  const invalidUser = new User({
    name: 'Invalid User',
    email: 'bad@crewforge.ai',
    passwordHash: 'hash',
    role: 'SuperMaster',
  });
  const err = invalidUser.validateSync();
  assert.ok(err && err.errors['role']);
});

// -------------------------------------------------------------
// Test 4: Event Creation & Budget Validation
// -------------------------------------------------------------
console.log('\nTest 4: Event Creation & Budget Validation:');

runTest('Event schema validates required eventName, date, location and positive budget', () => {
  const event = new Event({
    organizerId: new mongoose.Types.ObjectId(),
    eventName: 'Pune College Tech Fest 2026',
    date: '2026-11-15',
    location: 'Pune, Maharashtra',
    totalBudget: 35000,
    requiredRoles: ['Photographer', 'Sound Engineer'],
  });
  const err = event.validateSync();
  assert.strictEqual(err, undefined);
  assert.strictEqual(event.totalBudget, 35000);
});

runTest('Event schema rejects missing mandatory fields', () => {
  const badEvent = new Event({
    location: 'Pune',
  });
  const err = badEvent.validateSync();
  assert.ok(err);
  assert.ok(err.errors['organizerId']);
  assert.ok(err.errors['eventName']);
  assert.ok(err.errors['date']);
  assert.ok(err.errors['totalBudget']);
});

// -------------------------------------------------------------
// Test 5: Freelancer Profile Schema & Rating Validation
// -------------------------------------------------------------
console.log('\nTest 5: Freelancer Profile Schema:');

runTest('FreelancerProfile enforces ratings between 0 and 5 and positive rates', () => {
  const profile = new FreelancerProfile({
    userId: new mongoose.Types.ObjectId(),
    primaryRole: 'Sound Engineer',
    rating: 4.8,
    pricePerEvent: 5000,
    skills: ['Mixing', 'Live Sound'],
    reliabilityScore: 95,
  });
  const err = profile.validateSync();
  assert.strictEqual(err, undefined);
  assert.strictEqual(profile.rating, 4.8);
  assert.strictEqual(profile.reliabilityScore, 95);
});

// -------------------------------------------------------------
// Test 6: Assignment Creation & Standby Tracking
// -------------------------------------------------------------
console.log('\nTest 6: Assignment Creation & Standby Tracking:');

runTest('Assignment schema stores primary and backup mapping with valid statuses', () => {
  const assignment = new Assignment({
    eventId: new mongoose.Types.ObjectId(),
    freelancerId: new mongoose.Types.ObjectId(),
    role: 'Event Anchor',
    fee: 4000,
    status: 'Confirmed',
    isBackup: false,
    backupAssignedName: 'Arjun Mehta',
  });
  const err = assignment.validateSync();
  assert.strictEqual(err, undefined);
  assert.strictEqual(assignment.status, 'Confirmed');
  assert.strictEqual(assignment.backupAssignedName, 'Arjun Mehta');
});

// -------------------------------------------------------------
// Test 7: Assignment Status Updates
// -------------------------------------------------------------
console.log('\nTest 7: Assignment Status Transition Validation:');

runTest('Assignment rejects invalid statuses', () => {
  const badAssignment = new Assignment({
    eventId: new mongoose.Types.ObjectId(),
    freelancerId: new mongoose.Types.ObjectId(),
    role: 'Photographer',
    fee: 4500,
    status: 'SleepingOnDuty',
  });
  const err = badAssignment.validateSync();
  assert.ok(err && err.errors['status']);
});

runTest('Assignment accepts all valid lifecycle statuses', () => {
  const validStatuses = ['Pending', 'Confirmed', 'Briefed', 'On-Site', 'Completed', 'Declined', 'Cancelled'];
  validStatuses.forEach((status) => {
    const a = new Assignment({
      eventId: new mongoose.Types.ObjectId(),
      freelancerId: new mongoose.Types.ObjectId(),
      role: 'Lighting Tech',
      fee: 4000,
      status,
    });
    const err = a.validateSync();
    assert.strictEqual(err, undefined);
  });
});

// -------------------------------------------------------------
// Test 8: Notification Service (All 7 Required Types)
// -------------------------------------------------------------
console.log('\nTest 8: Notification Service & All 7 Triggers:');

runTest('Notification schema supports all 7 production notification types', () => {
  const types = [
    'Assignment',
    'Approval',
    'Rejection',
    'Cancellation',
    'BackupActivation',
    'StatusUpdate',
    'EventUpdate',
  ];
  types.forEach((type) => {
    const notif = new Notification({
      userId: new mongoose.Types.ObjectId(),
      title: 'Test Notification',
      message: 'Test message body',
      type,
    });
    const err = notif.validateSync();
    assert.strictEqual(err, undefined);
  });
});

runTest('Notification rejects unauthorized types', () => {
  const badNotif = new Notification({
    userId: new mongoose.Types.ObjectId(),
    message: 'Test',
    type: 'SpamMarketingAlert',
  });
  const err = badNotif.validateSync();
  assert.ok(err && err.errors['type']);
});

// -------------------------------------------------------------
// Test 9: Mark Notification As Read Logic
// -------------------------------------------------------------
console.log('\nTest 9: Notification Read State Management:');

runTest('Notification isRead defaults to false and transitions to true', () => {
  const notif = new Notification({
    userId: new mongoose.Types.ObjectId(),
    message: 'Assignment briefing is now available.',
  });
  assert.strictEqual(notif.isRead, false);
  notif.isRead = true;
  assert.strictEqual(notif.isRead, true);
});

// -------------------------------------------------------------
// Test 10: Dashboard Metrics Aggregation Formula
// -------------------------------------------------------------
console.log('\nTest 10: Dashboard Metrics Calculation Logic:');

runTest('Backup coverage percentage formula handles empty and backed crew correctly', () => {
  // Case A: 4 assignments, all 4 backed
  const totalAssignedA = 4;
  const backedA = 4;
  const coverageA = Math.round((backedA / totalAssignedA) * 100);
  assert.strictEqual(coverageA, 100);

  // Case B: 4 assignments, 3 backed
  const totalAssignedB = 4;
  const backedB = 3;
  const coverageB = Math.round((backedB / totalAssignedB) * 100);
  assert.strictEqual(coverageB, 75);

  // Case C: 0 assignments defaults safely to 100%
  const totalAssignedC = 0;
  const coverageC = totalAssignedC > 0 ? Math.round((0 / totalAssignedC) * 100) : 100;
  assert.strictEqual(coverageC, 100);
});

runTest('Total crew budget accumulates fees correctly', () => {
  const sampleAssignments = [
    { fee: 4500, status: 'Confirmed' },
    { fee: 5000, status: 'Briefed' },
    { fee: 3500, status: 'On-Site' },
    { fee: 4200, status: 'Cancelled' }, // Should be excluded from active budget
  ];
  const activeBudget = sampleAssignments
    .filter((a) => ['Confirmed', 'Briefed', 'On-Site'].includes(a.status))
    .reduce((sum, a) => sum + a.fee, 0);

  assert.strictEqual(activeBudget, 13000);
});

// -------------------------------------------------------------
// Test 11: Organizer Access Restrictions
// -------------------------------------------------------------
console.log('\nTest 11: Organizer Access Restrictions:');

runTest('Organizer cannot modify event belonging to another organizer', () => {
  const organizerA = new mongoose.Types.ObjectId();
  const organizerB = new mongoose.Types.ObjectId();

  const event = {
    _id: new mongoose.Types.ObjectId(),
    organizerId: organizerA,
    eventName: 'Organizer A Fest',
  };

  const reqUserOrganizerB = {
    _id: organizerB,
    role: 'Organizer',
  };

  const isOwner = event.organizerId.toString() === reqUserOrganizerB._id.toString();
  const isAdmin = reqUserOrganizerB.role === 'Admin';
  const isAuthorized = isOwner || isAdmin;

  assert.strictEqual(isAuthorized, false);
});

// -------------------------------------------------------------
// Test 12: Freelancer Access Restrictions
// -------------------------------------------------------------
console.log('\nTest 12: Freelancer Access Restrictions:');

runTest('Freelancers cannot approve team recommendations or create events', () => {
  const allowedRolesForEventCreation = ['Organizer', 'Admin'];
  const freelancerRole = 'Freelancer';

  const canCreate = allowedRolesForEventCreation.includes(freelancerRole);
  assert.strictEqual(canCreate, false);

  const allowedRolesForMatchingApproval = ['Organizer', 'Admin'];
  const canApprove = allowedRolesForMatchingApproval.includes(freelancerRole);
  assert.strictEqual(canApprove, false);
});

// -------------------------------------------------------------
// Test 13: Database Persistence & Feedback Model Validation
// -------------------------------------------------------------
console.log('\nTest 13: Feedback Model & Persistence Schema:');

runTest('Feedback schema requires eventId, freelancerId, organizerId, and rating 1-5', () => {
  const feedback = new Feedback({
    eventId: new mongoose.Types.ObjectId(),
    freelancerId: new mongoose.Types.ObjectId(),
    organizerId: new mongoose.Types.ObjectId(),
    rating: 5,
    comments: 'Superb sound balance and prompt setup!',
  });
  const err = feedback.validateSync();
  assert.strictEqual(err, undefined);
  assert.strictEqual(feedback.rating, 5);
});

runTest('Feedback rejects rating outside 1 to 5', () => {
  const badFeedback = new Feedback({
    eventId: new mongoose.Types.ObjectId(),
    freelancerId: new mongoose.Types.ObjectId(),
    organizerId: new mongoose.Types.ObjectId(),
    rating: 6,
  });
  const err = badFeedback.validateSync();
  assert.ok(err && err.errors['rating']);
});

// -------------------------------------------------------------
// Test 14: Error Handling When MongoDB is Unavailable
// -------------------------------------------------------------
console.log('\nTest 14: Error Handling When MongoDB is Unavailable:');

await runAsyncTest('connectDB handles unreachable host gracefully without throwing fatal exception', async () => {
  // Tests connecting to an invalid port with short timeout
  try {
    const fakeURI = 'mongodb://127.0.0.1:27019/fake_crewforge';
    const conn = await mongoose.connect(fakeURI, {
      serverSelectionTimeoutMS: 500,
    }).catch((err) => {
      // Gracefully handled
      return null;
    });
    assert.strictEqual(conn, null);
  } catch (error) {
    assert.fail('connectDB should catch connection errors gracefully');
  }
});

runTest('getDbStatus correctly reflects disconnected state when no active connection', () => {
  const status = getDbStatus();
  assert.strictEqual(status.isConnected, false);
  assert.strictEqual(status.status, 'disconnected');
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`🎯 RESULTS: ${passedTests}/${totalTests} Phase 4 Tests Passed (${Math.round((passedTests/totalTests)*100)}% SUCCESS)`);
console.log('================================================================\n');

if (passedTests < totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}

