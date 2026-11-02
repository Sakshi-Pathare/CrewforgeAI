import { evaluateCandidate } from './matchingService.js';

/**
 * Generate Standby Backup Recommendations for an Event's Primary Crew
 * 
 * Rules:
 * 1. For each primary assigned position, identify standby candidates.
 * 2. Backup candidate MUST NOT be the primary freelancer for this or any other role in the event.
 * 3. Backup candidate MUST have matching or compatible skills and be available on date.
 * 4. Categorize readiness status: 'Ready On-Call' | 'Within 15 Mins' | 'Standby Engaged'.
 * 5. Assess contingency risk score: 'Low Risk' | 'Medium Risk'.
 */
export const generateBackupRecommendations = (event, primaryAssignments = [], allFreelancers = [], existingOtherAssignments = []) => {
  const primaryFreelancerIds = new Set(
    primaryAssignments.map(a => (a.freelancerId?._id || a.freelancerId || a.id || '').toString())
  );

  const backupPairs = [];

  for (const primary of primaryAssignments) {
    const role = primary.role || primary.assignedRole;
    const roleEvent = { ...event, requiredRole: role };

    // Find eligible candidates excluding any primary crew members
    const eligibleBackups = allFreelancers
      .filter(f => {
        const idStr = (f.userId?._id || f.userId || f.id || '').toString();
        return !primaryFreelancerIds.has(idStr);
      })
      .map(f => evaluateCandidate(f, roleEvent, existingOtherAssignments))
      .filter(cand => cand.isEligible)
      .sort((a, b) => b.matchScore - a.matchScore);

    const topBackup = eligibleBackups[0];

    if (topBackup) {
      // Determine standby readiness
      const isPune = (topBackup.location || '').toLowerCase().includes('pune');
      const standbyStatus = isPune ? 'Within 15 Mins' : 'Ready On-Call';
      const riskScore = topBackup.matchScore >= 88 ? 'Low Risk' : 'Medium Risk';

      backupPairs.push({
        id: `bp-${primary._id || primary.id || Math.random().toString(36).substring(7)}`,
        assignmentId: primary._id || primary.id,
        role,
        primaryFreelancerId: (primary.freelancerId?._id || primary.freelancerId || primary.id || '').toString(),
        primaryName: primary.freelancerName || primary.name || primary.freelancerId?.name || 'Primary Crew',
        primaryAvatar: primary.avatar || primary.freelancerId?.avatar,
        primaryFee: primary.fee || primary.allocatedFee || primary.pricePerEvent,
        backupFreelancerId: topBackup.freelancerId,
        backupName: `${topBackup.name} (${topBackup.role})`,
        backupAvatar: topBackup.avatar,
        backupFee: topBackup.pricePerEvent,
        standbyStatus,
        riskScore,
        matchScore: topBackup.matchScore,
        explanation: `Backup ready: ${topBackup.name} offers ${topBackup.matchScore}% skill & reliability compatibility as standby for ${role}.`,
        swapped: false,
      });
    } else {
      // No eligible backup available in database
      backupPairs.push({
        id: `bp-uncovered-${role}`,
        assignmentId: primary._id || primary.id,
        role,
        primaryFreelancerId: (primary.freelancerId?._id || primary.freelancerId || primary.id || '').toString(),
        primaryName: primary.freelancerName || primary.name || primary.freelancerId?.name || 'Primary Crew',
        primaryAvatar: primary.avatar || primary.freelancerId?.avatar,
        primaryFee: primary.fee || primary.allocatedFee,
        backupFreelancerId: null,
        backupName: 'No Standby Available',
        backupAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
        backupFee: 0,
        standbyStatus: 'Uncovered',
        riskScore: 'High Risk',
        matchScore: 0,
        explanation: `Warning: No standby backup with required ${role} qualifications available on this date.`,
        swapped: false,
      });
    }
  }

  const fullyBackedUp = backupPairs.filter(p => p.backupFreelancerId !== null).length;
  const coveragePercent = backupPairs.length > 0 ? Math.round((fullyBackedUp / backupPairs.length) * 100) : 0;

  return {
    eventId: event.id || event._id,
    eventName: event.eventName || event.name,
    coveragePercent,
    isFullyCovered: coveragePercent === 100,
    backupPairs,
  };
};

/**
 * Replace a Primary Assignment with a Standby Backup
 */
export const performBackupSwap = (assignment, backupCandidate, reason = 'Emergency / Unforeseen Delay') => {
  return {
    updatedAssignment: {
      ...assignment,
      previousFreelancerId: assignment.freelancerId,
      previousFreelancerName: assignment.freelancerName,
      freelancerId: backupCandidate.freelancerId || backupCandidate.id,
      freelancerName: backupCandidate.name,
      avatar: backupCandidate.avatar,
      fee: backupCandidate.pricePerEvent || assignment.fee,
      status: 'Confirmed',
      backupAssigned: assignment.freelancerName ? `${assignment.freelancerName} (Replaced)` : 'None',
      replacementReason: reason,
      replacedAt: new Date().toISOString(),
    },
    cancellationAlert: {
      replacedFreelancerId: assignment.freelancerId,
      message: `Assignment for role ${assignment.role} has been reassigned to standby backup due to: ${reason}`,
    },
    activationAlert: {
      activatedFreelancerId: backupCandidate.freelancerId || backupCandidate.id,
      message: `Standby backup activated for ${assignment.role} on ${assignment.date || 'the production date'}. Please report to venue dispatch.`,
    },
  };
};

