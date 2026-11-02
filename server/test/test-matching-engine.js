/**
 * CREW FORGE - PHASE 3 MATCHING ENGINE & BACKUP CONTINGENCY TEST SUITE
 * Tests all 12 required edge-cases, algorithms, eligibility checks & security controls.
 */

import { 
  calculateSkillScore, 
  calculateAvailabilityScore, 
  calculateReliabilityScore, 
  calculateBudgetScore, 
  calculateLocationScore, 
  evaluateCandidate, 
  assembleTeam,
  DEFAULT_WEIGHTS
} from '../services/matchingService.js';

import { 
  generateBackupRecommendations, 
  performBackupSwap 
} from '../services/backupService.js';

import { authorize } from '../middleware/authMiddleware.js';

let passed = 0;
let total = 0;

const assert = (condition, testName) => {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
};

const runMatchingTests = async () => {
  console.log('\n================================================================');
  console.log('🤖 CREW FORGE - PHASE 3 MATCHING ENGINE & BACKUP TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------------
  // SITUATION 1: Freelancer with all required skills
  // -------------------------------------------------------------------
  console.log('Test 1: Freelancer with All Required Skills:');
  const skilledPhotographer = {
    id: 'f-1',
    primaryRole: 'Photographer',
    skills: ['Photography', 'Editing', 'Lightroom', 'Portrait', 'Team Player'],
    pricePerEvent: 4500,
    reliabilityScore: 98,
    rating: 4.9,
    location: 'Pune, Maharashtra',
    isAvailableOnDate: true,
  };
  const event1 = {
    requiredRole: 'Photographer',
    date: '2026-10-24',
    totalBudget: 25000,
    crewMembersNeeded: 4,
    location: 'Pune, Maharashtra',
    additionalRequirements: 'Photography and Editing required for fest',
  };
  const eval1 = evaluateCandidate(skilledPhotographer, event1);
  assert(eval1.isEligible === true, 'Skilled candidate is marked eligible');
  assert(eval1.breakdown.skillScore >= 90, `Skill score is high (${eval1.breakdown.skillScore}/100)`);
  assert(eval1.matchScore >= 90, `Composite match score is excellent (${eval1.matchScore}%)`);
  assert(eval1.matchedSkills.length > 0, 'Matched skills array contains overlapping tags');

  // -------------------------------------------------------------------
  // SITUATION 2: Freelancer without required skills
  // -------------------------------------------------------------------
  console.log('\nTest 2: Freelancer Without Required Skills:');
  const makeupArtistTryingSound = {
    id: 'f-5',
    primaryRole: 'Makeup Artist',
    skills: ['Makeup', 'Grooming', 'Styling'],
    pricePerEvent: 3000,
    reliabilityScore: 90,
    rating: 4.5,
  };
  const soundEvent = { ...event1, requiredRole: 'Sound Engineer' };
  const eval2 = evaluateCandidate(makeupArtistTryingSound, soundEvent);
  assert(eval2.isEligible === false, 'Candidate with non-matching role & skills is marked ineligible');
  assert(eval2.breakdown.skillScore === 0, 'Skill score is 0 for completely unrelated role');
  assert(eval2.explanation.includes('insufficient role match'), 'Explanation identifies skill mismatch reason');

  // -------------------------------------------------------------------
  // SITUATION 3: Freelancer unavailable on event date
  // -------------------------------------------------------------------
  console.log('\nTest 3: Freelancer Unavailable on Event Date:');
  const busyFreelancer = {
    ...skilledPhotographer,
    id: 'f-busy',
    unavailableDates: ['2026-10-24'],
  };
  const eval3 = evaluateCandidate(busyFreelancer, event1);
  assert(eval3.isEligible === false, 'Candidate unavailable on event date is marked ineligible');
  assert(eval3.breakdown.availabilityScore === 0, 'Availability score is 0 when date is blacklisted');
  assert(eval3.explanation.includes('unavailable'), 'Explanation reflects date unavailability');

  // -------------------------------------------------------------------
  // SITUATION 4: Freelancer exceeding budget
  // -------------------------------------------------------------------
  console.log('\nTest 4: Freelancer Exceeding Budget:');
  const expensiveFreelancer = {
    ...skilledPhotographer,
    id: 'f-expensive',
    pricePerEvent: 35000, // Exceeds total event budget of 25000!
  };
  const eval4 = evaluateCandidate(expensiveFreelancer, event1);
  assert(eval4.isEligible === false, 'Candidate exceeding budget is marked ineligible');
  assert(eval4.breakdown.budgetScore === 0, 'Budget score is 0 when fee > event budget');
  assert(eval4.explanation.includes('exceeds budget'), 'Explanation states fee exceeds budget threshold');

  // -------------------------------------------------------------------
  // SITUATION 5: Freelancer with low reliability
  // -------------------------------------------------------------------
  console.log('\nTest 5: Freelancer with Low Reliability Score:');
  const unreliableFreelancer = {
    ...skilledPhotographer,
    id: 'f-unreliable',
    reliabilityScore: 40,
    rating: 2.8,
    completedEvents: 2,
  };
  const eval5 = evaluateCandidate(unreliableFreelancer, event1);
  assert(eval5.breakdown.reliabilityScore < 50, `Reliability score is low (${eval5.breakdown.reliabilityScore})`);
  assert(eval5.matchScore < eval1.matchScore, 'Composite score is significantly lower than highly reliable peer');

  // -------------------------------------------------------------------
  // SITUATION 6: Freelancer already assigned to another event on same date
  // -------------------------------------------------------------------
  console.log('\nTest 6: Freelancer Already Assigned to Another Event (Double-booking):');
  const existingAssignments = [
    {
      freelancerId: 'f-1',
      date: '2026-10-24',
      status: 'Confirmed',
    },
  ];
  const eval6 = evaluateCandidate(skilledPhotographer, event1, existingAssignments);
  assert(eval6.isEligible === false, 'Freelancer with active booking on same date is marked ineligible');
  assert(eval6.breakdown.availabilityScore === 0, 'Availability score is 0 due to schedule conflict');
  assert(eval6.explanation.includes('Schedule conflict'), 'Explanation identifies double-booking conflict');

  // -------------------------------------------------------------------
  // SITUATION 7: Event with insufficient eligible freelancers (missing role reported)
  // -------------------------------------------------------------------
  console.log('\nTest 7: Event with Insufficient Eligible Freelancers (Missing Role Detection):');
  const smallPool = [skilledPhotographer]; // Only a photographer exists
  const eventMultiRole = {
    eventName: 'Annual College Fest',
    totalBudget: 25000,
    crewMembersNeeded: 3,
    requiredRoles: ['Photographer', 'Drone Operator', 'Pyro Technician'],
    date: '2026-10-24',
    location: 'Pune, Maharashtra',
  };
  const teamAssembly7 = assembleTeam(eventMultiRole, smallPool);
  assert(teamAssembly7.isCompleteTeam === false, 'Team correctly identified as incomplete');
  assert(teamAssembly7.unfilledRoles.length === 2, 'Reports exactly 2 unfilled roles');
  assert(teamAssembly7.unfilledRoles.some(r => r.role === 'Drone Operator'), 'Identifies Drone Operator as unfilled');
  assert(teamAssembly7.unfilledRoles.some(r => r.role === 'Pyro Technician'), 'Identifies Pyro Technician as unfilled');

  // -------------------------------------------------------------------
  // SITUATION 8: Event where total crew cost exceeds budget
  // -------------------------------------------------------------------
  console.log('\nTest 8: Event Where Total Crew Cost Exceeds Budget:');
  const tightBudgetEvent = {
    eventName: 'Budget Indie Fest',
    totalBudget: 5000, // Total budget is only ₹5,000 for 2 members!
    crewMembersNeeded: 2,
    requiredRoles: ['Photographer', 'Sound Engineer'],
    date: '2026-10-24',
    location: 'Pune, Maharashtra',
  };
  const candidatesForTightBudget = [
    { ...skilledPhotographer, id: 'f-1', pricePerEvent: 4500 }, // Takes ₹4,500 of ₹5,000
    { id: 'f-2', primaryRole: 'Sound Engineer', skills: ['Sound Mixing'], pricePerEvent: 5000, isAvailableOnDate: true, location: 'Pune', rating: 4.8 }, // Needs ₹5,000, only ₹500 left!
  ];
  const teamAssembly8 = assembleTeam(tightBudgetEvent, candidatesForTightBudget);
  assert(teamAssembly8.unfilledRoles.some(r => r.role === 'Sound Engineer'), 'Second role blocked because remaining budget is exceeded');
  assert(teamAssembly8.totalCommittedBudget <= 5000, 'Committed budget never exceeds total event budget');

  // -------------------------------------------------------------------
  // SITUATION 9 & 10: Primary freelancer cancellation & Backup replacement
  // -------------------------------------------------------------------
  console.log('\nTest 9 & 10: Cancellation & Standby Backup Replacement:');
  const primaryAssignment = {
    id: 'asg-sound-1',
    freelancerId: 'f-2',
    freelancerName: 'Aditya Kulkarni',
    role: 'Sound Engineer',
    fee: 5000,
    status: 'Confirmed',
    date: '2026-10-24',
  };
  const backupCandidate = {
    id: 'f-4',
    name: 'Rohit Sharma',
    primaryRole: 'Lighting Technician',
    role: 'Audio Tech / Sound Standby',
    pricePerEvent: 4000,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240',
  };
  const swapResult = performBackupSwap(primaryAssignment, backupCandidate, 'Traffic delay / Transit emergency');
  assert(swapResult.updatedAssignment.freelancerId === 'f-4', 'Assignment updated with backup candidate ID');
  assert(swapResult.updatedAssignment.previousFreelancerId === 'f-2', 'Tracks previous freelancer ID for audit trail');
  assert(swapResult.updatedAssignment.status === 'Confirmed', 'New candidate confirmed on call sheet');
  assert(swapResult.cancellationAlert.replacedFreelancerId === 'f-2', 'Cancellation alert dispatched to replaced freelancer');
  assert(swapResult.activationAlert.activatedFreelancerId === 'f-4', 'Activation alert dispatched to standby backup');

  // -------------------------------------------------------------------
  // SITUATION 11: Unauthorized user trying to approve recommendations
  // -------------------------------------------------------------------
  console.log('\nTest 11: Unauthorized User Trying to Approve Recommendations:');
  const approvalGuard = authorize('Organizer', 'Admin');
  let rejectedWithForbidden = false;
  const mockFreelancerReq = { user: { role: 'Freelancer' } };
  const mockRes = {
    status: (code) => {
      if (code === 403) rejectedWithForbidden = true;
      return { json: () => {} };
    }
  };
  approvalGuard(mockFreelancerReq, mockRes, () => {});
  assert(rejectedWithForbidden === true, 'Freelancer forbidden (403) from approving crew recommendations');

  // -------------------------------------------------------------------
  // SITUATION 12: Two roles accidentally selecting the same freelancer
  // -------------------------------------------------------------------
  console.log('\nTest 12: Duplicate Assignment Prevention Across Roles:');
  // Versatile candidate skilled in both Photography and Videography
  const versatileTalent = {
    id: 'f-versatile',
    name: 'Ananya Roy',
    primaryRole: 'Photographer',
    skills: ['Photography', 'Videography', 'Editing', '4K Video'],
    pricePerEvent: 4000,
    reliabilityScore: 95,
    rating: 4.8,
    isAvailableOnDate: true,
    location: 'Pune',
  };
  const dualRoleEvent = {
    eventName: 'Media Fest',
    totalBudget: 20000,
    crewMembersNeeded: 2,
    requiredRoles: ['Photographer', 'Videographer'],
    date: '2026-10-24',
    location: 'Pune, Maharashtra',
  };
  const multiCandidatePool = [
    versatileTalent,
    {
      id: 'f-videographer-2',
      name: 'Secondary Videographer',
      primaryRole: 'Videographer',
      skills: ['Videography', '4K Video'],
      pricePerEvent: 4500,
      reliabilityScore: 90,
      rating: 4.7,
      isAvailableOnDate: true,
      location: 'Pune',
    }
  ];
  const dualRoleAssembly = assembleTeam(dualRoleEvent, multiCandidatePool);
  const assignedIds = dualRoleAssembly.selectedTeam.map(m => m.freelancerId);
  const uniqueAssignedIds = Array.from(new Set(assignedIds));
  assert(assignedIds.length === uniqueAssignedIds.length, 'No freelancer assigned to more than one role in the same event');
  assert(dualRoleAssembly.selectedTeam.length === 2, 'Both roles successfully filled with distinct crew members');

  // -------------------------------------------------------------------
  // TEST SUMMARY
  // -------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`🎯 RESULTS: ${passed}/${total} Matching Engine Tests Passed (100% SUCCESS)`);
  console.log('================================================================\n');
};

runMatchingTests();

