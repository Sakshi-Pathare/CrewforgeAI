/**
 * CREW FORGE - AI-ASSISTED RULE-BASED MATCHING ENGINE
 * 
 * Configurable multi-criteria evaluation engine:
 * 1. Skill Match:         30% (role suitability + skill tag overlap)
 * 2. Availability:        25% (date availability + schedule conflict check)
 * 3. Reliability:         20% (historical reliability score + star rating)
 * 4. Budget Suitability:  15% (rate per event vs allocated role budget)
 * 5. Location Match:      10% (city proximity & local logistics)
 */

export const DEFAULT_WEIGHTS = {
  skill: 0.30,
  availability: 0.25,
  reliability: 0.20,
  budget: 0.15,
  location: 0.10,
};

// Standard role aliases and related skill tags for fuzzy matching
const ROLE_DEFINITIONS = {
  'photographer': {
    aliases: ['photo', 'cameraman', 'still photography'],
    skills: ['photography', 'editing', 'lightroom', 'portrait', 'event capture', 'team player'],
    relatedRoles: ['videographer'],
  },
  'sound engineer': {
    aliases: ['audio', 'sound tech', 'audio engineer', 'sound mixing'],
    skills: ['sound mixing', 'audio setup', 'technical', 'line arrays', 'microphones', 'digital consoles'],
    relatedRoles: ['dj & music curator', 'lighting technician'],
  },
  'event anchor': {
    aliases: ['anchor', 'host', 'emcee', 'mc', 'moderator'],
    skills: ['anchoring', 'communication', 'public speaking', 'crowd engagement', 'stage presence', 'bilingual'],
    relatedRoles: ['event manager'],
  },
  'lighting technician': {
    aliases: ['lighting', 'light tech', 'dmx programmer', 'stage lights'],
    skills: ['lighting', 'stage setup', 'technical', 'dmx', 'moving heads', 'spotlights'],
    relatedRoles: ['sound engineer', 'stage designer'],
  },
  'makeup artist': {
    aliases: ['mua', 'makeup', 'grooming', 'hair and makeup'],
    skills: ['makeup', 'grooming', 'styling', 'hd makeup', 'touch-ups'],
    relatedRoles: ['hospitality lead'],
  },
  'event manager': {
    aliases: ['coordinator', 'planner', 'floor manager', 'operations lead'],
    skills: ['planning', 'coordination', 'communication', 'backstage', 'roster management', 'logistics'],
    relatedRoles: ['event anchor', 'security lead'],
  },
  'security lead': {
    aliases: ['security', 'crowd control', 'bouncer lead', 'safety coordinator'],
    skills: ['crowd control', 'safety', 'logistics', 'barricades', 'emergency response'],
    relatedRoles: ['event manager'],
  },
  'stage designer': {
    aliases: ['stage decor', 'trussing', 'production design'],
    skills: ['stage decor', 'cad', 'fabrication', '3d modeling', 'led walls'],
    relatedRoles: ['lighting technician'],
  },
  'videographer': {
    aliases: ['video', 'cinematographer', 'camera operator', 'drone videographer'],
    skills: ['4k video', 'drone', 'color grading', 'editing', 'live stream', 'gimbal'],
    relatedRoles: ['photographer', 'drone operator'],
  },
  'dj & music curator': {
    aliases: ['dj', 'music curator', 'disc jockey'],
    skills: ['djing', 'audio fx', 'crowd hype', 'music mixing', 'sound equipment'],
    relatedRoles: ['sound engineer'],
  },
  'hospitality lead': {
    aliases: ['hospitality', 'guest relations', 'vip care'],
    skills: ['guest relations', 'catering', 'vip care', 'green room', 'reception'],
    relatedRoles: ['event manager'],
  },
  'drone operator': {
    aliases: ['drone pilot', 'aerial', 'fpv pilot'],
    skills: ['aerial shots', 'fpv', 'safety regulations', 'dgca licensed', '4k video'],
    relatedRoles: ['videographer'],
  },
};

/**
 * Normalize text for case-insensitive keyword comparisons
 */
const normalize = (text) => (text || '').toLowerCase().trim();

/**
 * Check if candidate's role matches or is related to the required event role
 */
export const evaluateRoleCompatibility = (candidateRole, requiredRole) => {
  const normCandidate = normalize(candidateRole);
  const normRequired = normalize(requiredRole);

  if (normCandidate === normRequired || normCandidate.includes(normRequired) || normRequired.includes(normCandidate)) {
    return { isMatch: true, isExact: true, score: 70 };
  }

  // Check aliases
  for (const [key, def] of Object.entries(ROLE_DEFINITIONS)) {
    const isTarget = key === normRequired || def.aliases.some(a => normRequired.includes(a));
    if (isTarget) {
      if (def.aliases.some(a => normCandidate.includes(a))) {
        return { isMatch: true, isExact: true, score: 70 };
      }
      if (def.relatedRoles.some(r => normCandidate.includes(r))) {
        return { isMatch: true, isExact: false, score: 50 };
      }
    }
  }

  return { isMatch: false, isExact: false, score: 0 };
};

/**
 * 1. Skill Match Scoring (30%)
 */
export const calculateSkillScore = (candidate, requiredRole, eventRequirements = '') => {
  const roleCompat = evaluateRoleCompatibility(candidate.primaryRole || candidate.role, requiredRole);
  if (!roleCompat.isMatch) {
    return { score: 0, matchedSkills: [], isEligible: false };
  }

  let baseScore = roleCompat.score; // 70 for exact, 50 for related
  const candidateSkills = (candidate.skills || []).map(normalize);
  const normReq = normalize(requiredRole);

  // Extract reference skills from role definition and event requirements
  let referenceSkills = [];
  for (const [key, def] of Object.entries(ROLE_DEFINITIONS)) {
    if (key === normReq || def.aliases.some(a => normReq.includes(a))) {
      referenceSkills = [...def.skills];
      break;
    }
  }

  // Also include any words mentioned in event requirements
  if (eventRequirements) {
    const requirementWords = normalize(eventRequirements).split(/\W+/).filter(w => w.length > 3);
    referenceSkills = Array.from(new Set([...referenceSkills, ...requirementWords]));
  }

  // Find overlapping skills
  const matchedSkills = [];
  candidateSkills.forEach(cSkill => {
    if (referenceSkills.some(rSkill => cSkill.includes(rSkill) || rSkill.includes(cSkill))) {
      matchedSkills.push(cSkill);
    }
  });

  // Calculate bonus up to 30 points for skills
  const skillBonus = referenceSkills.length > 0 
    ? Math.min(30, Math.round((matchedSkills.length / Math.min(referenceSkills.length, 4)) * 30))
    : 15;

  const totalSkillScore = Math.min(100, Math.max(0, baseScore + skillBonus));
  const isEligible = totalSkillScore >= 50;

  return {
    score: totalSkillScore,
    matchedSkills,
    isEligible,
  };
};

/**
 * 2. Availability Scoring (25%)
 */
export const calculateAvailabilityScore = (candidate, eventDate, existingAssignments = []) => {
  const normEventDate = normalize(eventDate);

  // Conflict Check: Check if candidate is already assigned to another event on the same date
  const candidateIdStr = (candidate.userId?._id || candidate.userId || candidate.id || '').toString();
  const hasConflict = existingAssignments.some(asg => {
    const asgFreelancerId = (asg.freelancerId?._id || asg.freelancerId || '').toString();
    const asgDate = normalize(asg.date || asg.eventId?.date);
    return asgFreelancerId === candidateIdStr && asgDate === normEventDate && asg.status !== 'Cancelled' && asg.status !== 'Declined';
  });

  if (hasConflict) {
    return {
      score: 0,
      isAvailable: false,
      reason: 'Schedule conflict: Already booked for another event on this date',
    };
  }

  // Check candidate availability records if present
  if (candidate.unavailableDates && candidate.unavailableDates.map(normalize).includes(normEventDate)) {
    return {
      score: 0,
      isAvailable: false,
      reason: 'Marked unavailable by freelancer on this date',
    };
  }

  if (candidate.availableDates && candidate.availableDates.map(normalize).includes(normEventDate)) {
    return {
      score: 100,
      isAvailable: true,
      reason: 'Confirmed available on event calendar',
    };
  }

  // Default available with standard booking lead
  return {
    score: candidate.isAvailableOnDate !== false ? 95 : 0,
    isAvailable: candidate.isAvailableOnDate !== false,
    reason: candidate.isAvailableOnDate !== false ? 'Standard on-call availability' : 'Unavailable on date',
  };
};

/**
 * 3. Reliability Scoring (20%)
 */
export const calculateReliabilityScore = (candidate) => {
  const rawScore = Number(candidate.reliabilityScore) || 90;
  const rating = Number(candidate.rating) || 4.5;
  const eventsCount = Number(candidate.completedEvents) || 20;

  // Blend historical reliability score with rating and completed shows
  const ratingComponent = (rating / 5) * 100;
  const experienceBonus = Math.min(10, Math.floor(eventsCount / 10)); // up to 10 points for track record

  const blended = Math.round((rawScore * 0.6) + (ratingComponent * 0.3) + experienceBonus);
  const score = Math.min(100, Math.max(0, blended));

  return {
    score,
    rating,
    completedEvents: eventsCount,
    isReliable: score >= 60,
  };
};

/**
 * 4. Budget Suitability Scoring (15%)
 */
export const calculateBudgetScore = (candidate, totalBudget, crewMembersNeeded, remainingBudget) => {
  const fee = Number(candidate.pricePerEvent) || 4000;
  const slotBudget = crewMembersNeeded > 0 ? (totalBudget / crewMembersNeeded) : fee;

  // Strict disqualification if fee exceeds the entire event budget or remaining budget
  if (fee > totalBudget || (remainingBudget !== undefined && fee > remainingBudget)) {
    return {
      score: 0,
      isWithinBudget: false,
      fee,
      slotBudget: Math.round(slotBudget),
      reason: `Fee (₹${fee.toLocaleString()}) exceeds budget threshold`,
    };
  }

  // Fits well within standard slot budget
  if (fee <= slotBudget) {
    const efficiencyBonus = Math.round(((slotBudget - fee) / slotBudget) * 15);
    return {
      score: Math.min(100, 85 + efficiencyBonus),
      isWithinBudget: true,
      fee,
      slotBudget: Math.round(slotBudget),
      reason: `Cost-effective: ₹${fee.toLocaleString()} fits allocated slot (₹${Math.round(slotBudget).toLocaleString()})`,
    };
  }

  // Slightly above average slot budget but within reasonable event headroom
  if (fee <= slotBudget * 1.35) {
    const penalty = Math.round(((fee - slotBudget) / (slotBudget * 0.35)) * 40);
    const score = Math.max(45, 85 - penalty);
    return {
      score,
      isWithinBudget: true,
      fee,
      slotBudget: Math.round(slotBudget),
      reason: `₹${fee.toLocaleString()} is slightly above average slot, but within total event budget`,
    };
  }

  // Over budget threshold
  return {
    score: 20,
    isWithinBudget: false,
    fee,
    slotBudget: Math.round(slotBudget),
    reason: `Fee of ₹${fee.toLocaleString()} exceeds average role budget of ₹${Math.round(slotBudget).toLocaleString()}`,
  };
};

/**
 * 5. Location Match Scoring (10%)
 */
export const calculateLocationScore = (candidateLocation, eventLocation) => {
  const normCandidate = normalize(candidateLocation);
  const normEvent = normalize(eventLocation);

  // Exact city / region match
  if (normCandidate.includes(normEvent) || normEvent.includes(normCandidate)) {
    return { score: 100, isLocal: true, location: candidateLocation };
  }

  // Western Maharashtra regional proximity (Pune - Mumbai hub)
  const isMumbaiPune = (normCandidate.includes('pune') && normEvent.includes('mumbai')) ||
                       (normCandidate.includes('mumbai') && normEvent.includes('pune'));
  if (isMumbaiPune) {
    return { score: 80, isLocal: false, location: candidateLocation, note: 'Inter-city travel required (~3 hrs)' };
  }

  // Outstation / different state
  return { score: 40, isLocal: false, location: candidateLocation, note: 'Outstation crew: transit and lodging required' };
};

/**
 * Full Multi-Criteria Evaluation for a Single Candidate
 */
export const evaluateCandidate = (candidate, event, existingAssignments = [], weights = DEFAULT_WEIGHTS, remainingBudget) => {
  const skill = calculateSkillScore(candidate, event.requiredRole, event.additionalRequirements);
  const availability = calculateAvailabilityScore(candidate, event.date, existingAssignments);
  const reliability = calculateReliabilityScore(candidate);
  const budget = calculateBudgetScore(candidate, event.totalBudget, event.crewMembersNeeded, remainingBudget);
  const location = calculateLocationScore(candidate.location, event.location);

  // Eligibility check: Candidate must have required skill, be available on date, and not exceed budget
  const isEligible = skill.isEligible && availability.isAvailable && budget.isWithinBudget;

  // Composite Weighted Score calculation (0 to 100)
  const weightedScore = Math.round(
    (skill.score * weights.skill) +
    (availability.score * weights.availability) +
    (reliability.score * weights.reliability) +
    (budget.score * weights.budget) +
    (location.score * weights.location)
  );

  // Build human-readable explanation
  let explanation = '';
  if (!isEligible) {
    const issues = [];
    if (!skill.isEligible) issues.push('insufficient role match');
    if (!availability.isAvailable) issues.push(availability.reason);
    if (!budget.isWithinBudget) issues.push(budget.reason);
    explanation = `Not recommended: ${issues.join('; ')}.`;
  } else {
    explanation = `Strong match for ${event.requiredRole}. Verified ${reliability.rating}★ rating (${reliability.completedEvents}+ shows), ${reliability.score}% past reliability. Fits role budget at ₹${budget.fee.toLocaleString()} and located in ${candidate.location || 'Pune'}.`;
  }

  return {
    freelancerId: (candidate.userId?._id || candidate.userId || candidate.id || '').toString(),
    name: candidate.name || candidate.userId?.name || 'Talented Crew',
    avatar: candidate.avatar || candidate.userId?.avatar,
    role: candidate.primaryRole || candidate.role,
    rating: candidate.rating,
    reviewsCount: candidate.reviewsCount || 0,
    pricePerEvent: candidate.pricePerEvent,
    skills: candidate.skills || [],
    location: candidate.location || 'Pune, Maharashtra',
    experienceYears: candidate.experienceYears || 3,
    completedEvents: candidate.completedEvents || 20,
    matchScore: isEligible ? Math.min(99, Math.max(65, weightedScore)) : Math.min(50, weightedScore),
    isEligible,
    breakdown: {
      skillScore: skill.score,
      availabilityScore: availability.score,
      reliabilityScore: reliability.score,
      budgetScore: budget.score,
      locationScore: location.score,
    },
    matchedSkills: skill.matchedSkills,
    explanation,
  };
};

/**
 * Assemble Team Across All Required Event Roles
 * - Prevents duplicate assignments
 * - Enforces budget limit
 * - Reports unfilled roles
 */
export const assembleTeam = (event, allFreelancers, existingAssignments = [], weights = DEFAULT_WEIGHTS) => {
  const requiredRoles = event.requiredRoles || ['Photographer', 'Sound Engineer', 'Event Anchor', 'Security Lead'];
  let currentRemainingBudget = event.totalBudget;

  const roleRecommendations = {};
  const selectedTeam = [];
  const assignedFreelancerIds = new Set();
  const unfilledRoles = [];

  // 1. Evaluate all candidates for every required role
  for (const role of requiredRoles) {
    const roleEvent = { ...event, requiredRole: role };
    const candidates = allFreelancers
      .map(freelancer => evaluateCandidate(freelancer, roleEvent, existingAssignments, weights, currentRemainingBudget))
      .filter(evalResult => evalResult.isEligible)
      .sort((a, b) => b.matchScore - a.matchScore);

    roleRecommendations[role] = candidates;
  }

  // 2. Greedy selection ensuring zero duplicate assignments and within budget
  for (const role of requiredRoles) {
    const candidates = roleRecommendations[role] || [];
    let chosen = null;

    for (const candidate of candidates) {
      if (!assignedFreelancerIds.has(candidate.freelancerId)) {
        if (candidate.pricePerEvent <= currentRemainingBudget) {
          chosen = candidate;
          break;
        }
      }
    }

    if (chosen) {
      assignedFreelancerIds.add(chosen.freelancerId);
      currentRemainingBudget -= chosen.pricePerEvent;
      selectedTeam.push({
        ...chosen,
        assignedRole: role,
        allocatedFee: chosen.pricePerEvent,
      });
    } else {
      unfilledRoles.push({
        role,
        reason: candidates.length === 0 
          ? 'No verified professionals available with required skills for this date' 
          : 'Eligible candidates exceeded remaining event budget allocation',
      });
    }
  }

  // 3. Compute Team Metrics
  const totalCommittedBudget = selectedTeam.reduce((acc, member) => acc + member.allocatedFee, 0);
  const averageMatchScore = selectedTeam.length > 0 
    ? Math.round(selectedTeam.reduce((acc, member) => acc + member.matchScore, 0) / selectedTeam.length)
    : 0;

  return {
    eventId: event.id || event._id,
    eventName: event.eventName || event.name,
    totalBudget: event.totalBudget,
    crewMembersNeeded: event.crewMembersNeeded || requiredRoles.length,
    rolesRequired: requiredRoles,
    rolesFilledCount: selectedTeam.length,
    isCompleteTeam: unfilledRoles.length === 0,
    averageMatchScore,
    totalCommittedBudget,
    budgetRemaining: event.totalBudget - totalCommittedBudget,
    selectedTeam,
    unfilledRoles,
    allRoleCandidates: roleRecommendations,
  };
};

