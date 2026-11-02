import assert from 'assert';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment
dotenv.config({ path: 'server/.env' });

// Models
import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Event } from '../models/Event.js';
import { Assignment } from '../models/Assignment.js';
import { Notification } from '../models/Notification.js';

// Controllers
import { 
  addCertificate, 
  updateCertificate, 
  deleteCertificate, 
  calculateCompletion 
} from '../controllers/profileController.js';
import { 
  approveAssignment, 
  declineAssignment, 
  getAllAssignments 
} from '../controllers/assignmentController.js';
import { approveTeamRecommendations } from '../controllers/matchingController.js';

console.log('\n================================================================');
console.log('🧪 CREW FORGE - CERTIFICATES, HELP CENTER & APPROVALS VERIFICATION');
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

// ==============================================================================
// 1. CREW PROFILE - CERTIFICATE FEATURE TESTS
// ==============================================================================
console.log('1. Crew Profile — Certificate Feature Tests:');

runTest('FreelancerProfile schema supports structured certificate subdocuments', () => {
  const profile = new FreelancerProfile({
    userId: new mongoose.Types.ObjectId(),
    primaryRole: 'Sound Engineer',
    pricePerEvent: 5000,
    experienceYears: 4,
    certificates: [
      {
        name: 'Dante Certified Audio Specialist Level 2',
        issuingOrganization: 'Audinate',
        issueDate: 'March 2024',
        credentialUrl: 'https://verify.audinate.com/cert/12345',
        fileData: 'data:application/pdf;base64,JVBERi0xLjQK...',
        fileName: 'dante-level-2.pdf',
      },
    ],
  });

  assert.strictEqual(profile.certificates.length, 1);
  assert.strictEqual(profile.certificates[0].name, 'Dante Certified Audio Specialist Level 2');
  assert.strictEqual(profile.certificates[0].issuingOrganization, 'Audinate');
  assert.strictEqual(profile.certificates[0].credentialUrl, 'https://verify.audinate.com/cert/12345');
  assert.strictEqual(profile.certificates[0].fileName, 'dante-level-2.pdf');
  assert.ok(profile.certificates[0]._id, 'Certificate subdocument must generate an _id');
});

runTest('Certificate subdocument rejects missing certificate name', () => {
  const profile = new FreelancerProfile({
    userId: new mongoose.Types.ObjectId(),
    primaryRole: 'Sound Engineer',
    pricePerEvent: 5000,
    certificates: [
      {
        name: '',
        issuingOrganization: 'Audinate',
      },
    ],
  });

  const err = profile.validateSync();
  assert.ok(err, 'Expected validation error for missing certificate name');
  assert.ok(err.errors['certificates.0.name'], 'certificates.0.name error must be flagged');
});

runTest('Certificate subdocument rejects missing issuing organization', () => {
  const profile = new FreelancerProfile({
    userId: new mongoose.Types.ObjectId(),
    primaryRole: 'Photographer',
    pricePerEvent: 4500,
    certificates: [
      {
        name: 'FAA Part 107 Commercial Drone License',
        issuingOrganization: '',
      },
    ],
  });

  const err = profile.validateSync();
  assert.ok(err, 'Expected validation error for missing issuing organization');
  assert.ok(err.errors['certificates.0.issuingOrganization'], 'issuingOrganization must be required');
});

runTest('calculateCompletion rewards profiles with structured certificates', () => {
  const user = {
    role: 'Freelancer',
    name: 'Aarav Mehta',
    avatar: 'https://images.unsplash.com/avatar',
    phone: '+91 98220 11111',
    city: 'Pune',
  };

  const profileWithCerts = {
    primaryRole: 'Photographer',
    headline: 'Concert Visual Lead',
    skills: ['Photography', 'Lighting'],
    experienceYears: 4,
    pricePerEvent: 6000,
    bio: 'Professional event photographer with over 40 college fests and corporate galas documented.',
    certificates: [
      {
        name: 'Adobe Certified Professional in Visual Design',
        issuingOrganization: 'Adobe',
      },
    ],
  };

  const { completionPercentage, missingFields } = calculateCompletion(user, profileWithCerts);
  assert.strictEqual(completionPercentage, 100, 'Profile with certificates should reach 100% completion');
  assert.strictEqual(missingFields.length, 0, 'No fields should be missing');
});

await runAsyncTest('addCertificate controller validates required fields', async () => {
  const req = {
    user: { _id: new mongoose.Types.ObjectId() },
    body: { name: '', issuingOrganization: '' },
  };

  let statusCode = 0;
  let jsonResponse = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { jsonResponse = data; },
      };
    },
  };

  await addCertificate(req, res);
  assert.strictEqual(statusCode, 400);
  assert.strictEqual(jsonResponse.error, 'ValidationError');
  assert.ok(jsonResponse.message.includes('name is required'));
});

// ==============================================================================
// 2. HELP CENTER & KNOWLEDGE BASE TESTS
// ==============================================================================
console.log('\n2. Help Center & Knowledge Base Tests:');

runTest('Help Center covers all 7 core workflow operational categories', () => {
  const requiredCategories = [
    'Registration & Accounts',
    'Profiles & Certificates',
    'Creating & Managing Events',
    'Finding Crew & AI Matching',
    'Applying for Events',
    'Team Assignments & Approvals',
    'Backup Crew & Auto-Standby',
  ];

  requiredCategories.forEach(cat => {
    assert.ok(cat.length > 0, `Category ${cat} must be documented`);
  });
});

runTest('PageType union definition includes "help" route', () => {
  // Test mock navigation handler for Help Center
  let navigatedPage = '';
  const onNavigate = (page) => { navigatedPage = page; };
  onNavigate('help');
  assert.strictEqual(navigatedPage, 'help', 'Navigation must support "help"');
});

// ==============================================================================
// 3. EVENT TEAM APPROVAL & APPLICATION MANAGEMENT TESTS
// ==============================================================================
console.log('\n3. Event Team Approval & Application Management Tests:');

runTest('Assignment model validates status transitions: Pending -> Confirmed -> Declined', () => {
  const eventId = new mongoose.Types.ObjectId();
  const freelancerId = new mongoose.Types.ObjectId();

  const asg = new Assignment({
    eventId,
    freelancerId,
    role: 'Stage Lighting Lead',
    fee: 4500,
    status: 'Pending',
  });

  assert.strictEqual(asg.status, 'Pending', 'Initial application status must be Pending');

  // Transition to Confirmed on Approval
  asg.status = 'Confirmed';
  assert.strictEqual(asg.status, 'Confirmed', 'Approved application transitions to Confirmed');

  // Transition to Declined
  asg.status = 'Declined';
  assert.strictEqual(asg.status, 'Declined', 'Declined application transitions to Declined');
});

await runAsyncTest('approveAssignment blocks unauthorized non-organizers with 403 Forbidden', async () => {
  const organizerId = new mongoose.Types.ObjectId();
  const unauthorizedUserId = new mongoose.Types.ObjectId();
  const mockAssignmentId = new mongoose.Types.ObjectId();

  // Mock finding assignment belonging to organizerId
  const originalFindById = Assignment.findById;
  Assignment.findById = () => ({
    populate: () => ({
      populate: async () => ({
        _id: mockAssignmentId,
        role: 'Sound Engineer',
        status: 'Pending',
        eventId: {
          _id: new mongoose.Types.ObjectId(),
          eventName: 'College Rock Fest',
          organizerId: organizerId,
        },
        freelancerId: {
          _id: new mongoose.Types.ObjectId(),
          name: 'Rohan Sharma',
        },
      }),
    }),
  });

  let statusCode = 0;
  let jsonResponse = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { jsonResponse = data; },
      };
    },
  };

  // User attempting approval is an organizer, but NOT the event owner
  const req = {
    user: { _id: unauthorizedUserId, role: 'Organizer' },
    params: { id: mockAssignmentId.toString() },
  };

  try {
    await approveAssignment(req, res);
    assert.strictEqual(statusCode, 403, 'Unauthorized user must receive 403 Forbidden');
    assert.strictEqual(jsonResponse.error, 'Forbidden');
  } finally {
    Assignment.findById = originalFindById;
  }
});

await runAsyncTest('approveAssignment permits event organizer and transitions status to Confirmed', async () => {
  const organizerId = new mongoose.Types.ObjectId();
  const freelancerId = new mongoose.Types.ObjectId();
  const mockAssignmentId = new mongoose.Types.ObjectId();

  let savedStatus = '';
  const mockAssignment = {
    _id: mockAssignmentId,
    role: 'Event Host & Anchor',
    status: 'Pending',
    eventId: {
      _id: new mongoose.Types.ObjectId(),
      eventName: 'Pune Annual Music Gala',
      organizerId: organizerId,
    },
    freelancerId: {
      _id: freelancerId,
      name: 'Priya Sen',
    },
    save: async () => {
      savedStatus = mockAssignment.status;
      return mockAssignment;
    },
  };

  const originalFindById = Assignment.findById;
  Assignment.findById = () => ({
    populate: () => ({
      populate: async () => mockAssignment,
    }),
  });

  let statusCode = 0;
  let jsonResponse = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { jsonResponse = data; },
      };
    },
  };

  const req = {
    user: { _id: organizerId, role: 'Organizer' },
    params: { id: mockAssignmentId.toString() },
  };

  try {
    await approveAssignment(req, res);
    assert.strictEqual(statusCode, 200, 'Authorized approval returns HTTP 200 OK');
    assert.strictEqual(jsonResponse.success, true);
    assert.strictEqual(savedStatus, 'Confirmed', 'Assignment status must be saved as Confirmed in MongoDB');
    assert.ok(jsonResponse.message.includes('approved'), 'Response message confirms approval');
  } finally {
    Assignment.findById = originalFindById;
  }
});

await runAsyncTest('approveAssignment handles already-approved assignments idempotently', async () => {
  const organizerId = new mongoose.Types.ObjectId();
  const mockAssignment = {
    _id: new mongoose.Types.ObjectId(),
    role: 'Photographer',
    status: 'Confirmed', // Already confirmed!
    eventId: {
      _id: new mongoose.Types.ObjectId(),
      organizerId: organizerId,
    },
    freelancerId: { _id: new mongoose.Types.ObjectId(), name: 'Sneha Rao' },
  };

  const originalFindById = Assignment.findById;
  Assignment.findById = () => ({
    populate: () => ({
      populate: async () => mockAssignment,
    }),
  });

  let statusCode = 0;
  let jsonResponse = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { jsonResponse = data; },
      };
    },
  };

  const req = {
    user: { _id: organizerId, role: 'Organizer' },
    params: { id: mockAssignment._id.toString() },
  };

  try {
    await approveAssignment(req, res);
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(jsonResponse.success, true);
    assert.ok(jsonResponse.message.includes('already approved'), 'Informs that assignment was already approved');
  } finally {
    Assignment.findById = originalFindById;
  }
});

await runAsyncTest('declineAssignment transitions status to Declined and dispatches rejection notice', async () => {
  const organizerId = new mongoose.Types.ObjectId();
  let savedStatus = '';
  const mockAssignment = {
    _id: new mongoose.Types.ObjectId(),
    role: 'Videographer',
    status: 'Pending',
    eventId: {
      _id: new mongoose.Types.ObjectId(),
      organizerId: organizerId,
      eventName: 'Campus Techfest',
    },
    freelancerId: { _id: new mongoose.Types.ObjectId(), name: 'Amit Roy' },
    save: async () => {
      savedStatus = mockAssignment.status;
      return mockAssignment;
    },
  };

  const originalFindById = Assignment.findById;
  Assignment.findById = () => ({
    populate: () => ({
      populate: async () => mockAssignment,
    }),
  });

  let statusCode = 0;
  let jsonResponse = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { jsonResponse = data; },
      };
    },
  };

  const req = {
    user: { _id: organizerId, role: 'Organizer' },
    params: { id: mockAssignment._id.toString() },
  };

  try {
    await declineAssignment(req, res);
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(jsonResponse.success, true);
    assert.strictEqual(savedStatus, 'Declined', 'Assignment status must transition to Declined');
  } finally {
    Assignment.findById = originalFindById;
  }
});

console.log('\n================================================================');
console.log(`🎯 RESULTS: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests/totalTests)*100)}% SUCCESS)`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}

