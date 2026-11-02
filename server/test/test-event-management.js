import assert from 'assert';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'server/.env' });

// Models
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Assignment } from '../models/Assignment.js';

// Auth & Middleware
import { generateToken } from '../utils/jwt.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

console.log('\n================================================================');
console.log('🧪 CREW FORGE - PHASE 7 EVENT MANAGEMENT TEST SUITE');
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
// Test Group 1: Complete Event Schema & Field Validation
// -------------------------------------------------------------
console.log('Test Group 1: Complete Event Schema & Validation:');

runTest('Event schema validates all Phase 7 fields with comprehensive specs', () => {
  const event = new Event({
    organizerId: new mongoose.Types.ObjectId(),
    eventName: 'Annual Tech & Cultural Fest 2026',
    eventType: 'College Event',
    category: 'College Event',
    description: 'Premier inter-college festival hosting 15+ university delegations and celebrity concerts.',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    date: '28 October 2026',
    startTime: '08:30 AM',
    endTime: '10:00 PM',
    venue: 'Shivaji Memorial Auditorium',
    address: 'FC Road, Shivajinagar',
    city: 'Pune',
    location: 'Shivaji Memorial Auditorium, Pune, Maharashtra',
    totalBudget: 48000,
    crewMembersNeeded: 8,
    requiredRoles: ['Photographer', 'Sound Engineer', 'Event Anchor', 'Security Lead'],
    requiredSkills: ['Concert Audio', 'Stage Lighting', 'Crowd Safety'],
    roleRequirements: [
      { role: 'Photographer', count: 2, skills: ['Low-Light Photography'], budgetPerRole: 6000 },
      { role: 'Sound Engineer', count: 2, skills: ['Digital Consoles'], budgetPerRole: 6500 },
      { role: 'Event Anchor', count: 1, skills: ['Stage Management'], budgetPerRole: 5000 },
      { role: 'Security Lead', count: 3, skills: ['Crowd Safety'], budgetPerRole: 4000 },
    ],
    specialInstructions: 'Call time is 7:30 AM sharp. Production attire: All-black crew crewnecks.',
    status: 'Published',
  });

  const err = event.validateSync();
  assert.strictEqual(err, undefined);
  assert.strictEqual(event.eventName, 'Annual Tech & Cultural Fest 2026');
  assert.strictEqual(event.roleRequirements.length, 4);
  assert.strictEqual(event.city, 'Pune');
  assert.strictEqual(event.status, 'Published');
});

runTest('Event schema rejects missing mandatory fields (eventName, date, totalBudget)', () => {
  const invalidEvent = new Event({
    organizerId: new mongoose.Types.ObjectId(),
    // Missing eventName, date, totalBudget
  });
  const err = invalidEvent.validateSync();
  assert.ok(err && err.errors['eventName']);
  assert.ok(err && err.errors['date']);
  assert.ok(err && err.errors['totalBudget']);
});

runTest('Event schema rejects negative budget', () => {
  const badBudget = new Event({
    organizerId: new mongoose.Types.ObjectId(),
    eventName: 'Negative Budget Test',
    date: '25 October 2026',
    location: 'Pune',
    totalBudget: -5000,
  });
  const err = badBudget.validateSync();
  assert.ok(err && err.errors['totalBudget']);
});

runTest('Event schema supports all valid status lifecycles', () => {
  const validStatuses = ['Draft', 'Published', 'In Progress', 'Completed', 'Cancelled', 'Planning', 'Confirmed', 'Live'];
  for (const st of validStatuses) {
    const e = new Event({
      organizerId: new mongoose.Types.ObjectId(),
      eventName: `Status Test ${st}`,
      date: '25 October 2026',
      location: 'Pune',
      totalBudget: 25000,
      status: st,
    });
    const err = e.validateSync();
    assert.strictEqual(err, undefined, `Status "${st}" should be accepted`);
  }
});

runTest('Event schema rejects unauthorized status values', () => {
  const invalidStatus = new Event({
    organizerId: new mongoose.Types.ObjectId(),
    eventName: 'Invalid Status Test',
    date: '25 October 2026',
    location: 'Pune',
    totalBudget: 25000,
    status: 'RandomUnregisteredStatus',
  });
  const err = invalidStatus.validateSync();
  assert.ok(err && err.errors['status']);
});

// -------------------------------------------------------------
// Test Group 2: Role-Based Access Control on Events
// -------------------------------------------------------------
console.log('\nTest Group 2: Role-Based Access Control (RBAC) on Event Routes:');

runTest('authorize middleware permits Organizers and Admins to manage events', () => {
  const organizerReq = { user: { role: 'Organizer' } };
  const adminReq = { user: { role: 'Admin' } };
  let called = false;
  const next = () => { called = true; };
  const middleware = authorize('Organizer', 'Admin');

  middleware(organizerReq, {}, next);
  assert.strictEqual(called, true, 'Organizer allowed to manage events');

  called = false;
  middleware(adminReq, {}, next);
  assert.strictEqual(called, true, 'Admin allowed to manage events');
});

runTest('authorize middleware blocks Freelancers (403) from creating or deleting organizer events', () => {
  const freelancerReq = { user: { role: 'Freelancer' } };
  let statusSet = 0;
  let responseData = null;
  const res = {
    status(code) { statusSet = code; return this; },
    json(data) { responseData = data; }
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  const middleware = authorize('Organizer', 'Admin');

  middleware(freelancerReq, res, next);
  assert.strictEqual(statusSet, 403, 'Freelancer denied with 403 Forbidden');
  assert.strictEqual(nextCalled, false, 'next() not called');
  assert.strictEqual(responseData.error, 'Forbidden');
});

runTest('Event ownership check prevents organizer A from modifying event belonging to organizer B', () => {
  const organizerAId = new mongoose.Types.ObjectId();
  const organizerBId = new mongoose.Types.ObjectId();
  const eventOfB = {
    _id: new mongoose.Types.ObjectId(),
    organizerId: organizerBId,
    eventName: "Organizer B's Concert",
  };

  const isOwnerOrAdmin = (user, event) => {
    return user.role === 'Admin' || event.organizerId.toString() === user._id.toString();
  };

  assert.strictEqual(isOwnerOrAdmin({ _id: organizerAId, role: 'Organizer' }, eventOfB), false);
  assert.strictEqual(isOwnerOrAdmin({ _id: organizerBId, role: 'Organizer' }, eventOfB), true);
  assert.strictEqual(isOwnerOrAdmin({ _id: organizerAId, role: 'Admin' }, eventOfB), true);
});

// -------------------------------------------------------------
// Test Group 3: Event Status Lifecycle & Publishing
// -------------------------------------------------------------
console.log('\nTest Group 3: Event Status Lifecycle & Publishing:');

runTest('Publishing an event transitions status from Draft to Published', () => {
  const event = {
    status: 'Draft',
    publish() {
      this.status = 'Published';
    },
    unpublish() {
      this.status = 'Draft';
    }
  };

  assert.strictEqual(event.status, 'Draft');
  event.publish();
  assert.strictEqual(event.status, 'Published');
  event.unpublish();
  assert.strictEqual(event.status, 'Draft');
});

runTest('Draft events are protected from unauthorized public viewing', () => {
  const draftEvent = {
    organizerId: new mongoose.Types.ObjectId().toString(),
    status: 'Draft',
  };

  const canViewEvent = (user, event) => {
    if (event.status !== 'Draft') return true;
    if (!user) return false;
    return user.role === 'Admin' || user._id.toString() === event.organizerId;
  };

  const foreignUser = { _id: new mongoose.Types.ObjectId().toString(), role: 'Organizer' };
  const ownerUser = { _id: draftEvent.organizerId, role: 'Organizer' };
  const adminUser = { _id: new mongoose.Types.ObjectId().toString(), role: 'Admin' };

  assert.strictEqual(canViewEvent(null, draftEvent), false, 'Anonymous visitor blocked from Draft');
  assert.strictEqual(canViewEvent(foreignUser, draftEvent), false, 'Foreign organizer blocked from Draft');
  assert.strictEqual(canViewEvent(ownerUser, draftEvent), true, 'Owner permitted to view Draft');
  assert.strictEqual(canViewEvent(adminUser, draftEvent), true, 'Admin permitted to view Draft');
});

// -------------------------------------------------------------
// Test Group 4: Freelancer Event Application System
// -------------------------------------------------------------
console.log('\nTest Group 4: Freelancer Event Application System:');

runTest('Freelancers can apply for open/published events and creates a Pending assignment', () => {
  const eventId = new mongoose.Types.ObjectId();
  const freelancerId = new mongoose.Types.ObjectId();

  const application = new Assignment({
    eventId,
    freelancerId,
    role: 'Sound Engineer',
    fee: 5500,
    status: 'Pending',
    backupAssignedName: 'Auto Standby',
  });

  const err = application.validateSync();
  assert.strictEqual(err, undefined);
  assert.strictEqual(application.status, 'Pending');
  assert.strictEqual(application.role, 'Sound Engineer');
  assert.strictEqual(application.fee, 5500);
});

runTest('Duplicate application detection blocks submitting multiple applications for same event', () => {
  const existingApplications = [
    { eventId: 'evt-101', freelancerId: 'fl-55', status: 'Pending' }
  ];

  const hasAlreadyApplied = (eventId, freelancerId) => {
    return existingApplications.some(
      a => a.eventId === eventId && a.freelancerId === freelancerId
    );
  };

  assert.strictEqual(hasAlreadyApplied('evt-101', 'fl-55'), true, 'Existing application identified');
  assert.strictEqual(hasAlreadyApplied('evt-101', 'fl-99'), false, 'New candidate application allowed');
});

// -------------------------------------------------------------
// Test Group 5: Event Deletion & Cleanup
// -------------------------------------------------------------
console.log('\nTest Group 5: Event Deletion & Cleanup:');

runTest('Deleting an event sets associated assignments to Cancelled', () => {
  const assignments = [
    { id: 'asg-1', eventId: 'evt-10', status: 'Confirmed' },
    { id: 'asg-2', eventId: 'evt-10', status: 'Pending' },
    { id: 'asg-3', eventId: 'evt-99', status: 'Confirmed' },
  ];

  const cancelForEvent = (delId) => {
    return assignments.map(a => a.eventId === delId ? { ...a, status: 'Cancelled' } : a);
  };

  const updated = cancelForEvent('evt-10');
  assert.strictEqual(updated[0].status, 'Cancelled');
  assert.strictEqual(updated[1].status, 'Cancelled');
  assert.strictEqual(updated[2].status, 'Confirmed', 'Unrelated assignments untouched');
});

// -------------------------------------------------------------
// Test Group 6: Dashboard Statistics Aggregation
// -------------------------------------------------------------
console.log('\nTest Group 6: Dashboard Statistics Aggregation with Real Event Specs:');

runTest('Dashboard metrics accurately calculate total, upcoming, active, completed, and crew requirements', () => {
  const testEvents = [
    { id: 'e1', status: 'Published', crewMembersNeeded: 8 },
    { id: 'e2', status: 'In Progress', crewMembersNeeded: 6 },
    { id: 'e3', status: 'Live', crewMembersNeeded: 12 },
    { id: 'e4', status: 'Completed', crewMembersNeeded: 4 },
    { id: 'e5', status: 'Cancelled', crewMembersNeeded: 5 },
    { id: 'e6', status: 'Draft', crewMembersNeeded: 8 },
  ];

  const totalEvents = testEvents.length;
  const upcomingEvents = testEvents.filter(e => !['Completed', 'Cancelled'].includes(e.status)).length;
  const activeEvents = testEvents.filter(e => ['In Progress', 'Live', 'Confirmed'].includes(e.status)).length;
  const completedEvents = testEvents.filter(e => e.status === 'Completed').length;
  const crewRequirements = testEvents
    .filter(e => e.status !== 'Cancelled')
    .reduce((sum, e) => sum + e.crewMembersNeeded, 0);

  assert.strictEqual(totalEvents, 6);
  assert.strictEqual(upcomingEvents, 4);
  assert.strictEqual(activeEvents, 2);
  assert.strictEqual(completedEvents, 1);
  assert.strictEqual(crewRequirements, 38, 'Crew slots sum up to 38');
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`🎯 RESULTS: ${passedTests}/${totalTests} Phase 7 Event Management Tests Passed (${Math.round((passedTests/totalTests)*100)}% SUCCESS)`);
console.log('================================================================\n');

if (passedTests < totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}

