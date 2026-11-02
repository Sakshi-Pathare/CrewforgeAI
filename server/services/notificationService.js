import { Notification } from '../models/Notification.js';

/**
 * CREW FORGE NOTIFICATION SERVICE
 * Manages persistent in-app notifications for Organizers, Freelancers, and Admins.
 */

/**
 * 1. New Event Assignment Notification
 * Dispatched to freelancer when assigned or invited to a role
 */
export const notifyNewAssignment = async ({ freelancerId, role, eventName, eventId, assignmentId }) => {
  try {
    return await Notification.create({
      userId: freelancerId,
      type: 'Assignment',
      title: 'New Event Assignment',
      message: `You have been selected as ${role} for "${eventName}".`,
      metadata: { eventId, assignmentId, role },
    });
  } catch (error) {
    console.error('[NotificationService Error notifyNewAssignment]:', error.message);
    return null;
  }
};

/**
 * 2. Assignment Approval Notification
 * Dispatched to freelancer when organizer confirms/locks in their assignment
 */
export const notifyAssignmentApproval = async ({ freelancerId, role, eventName, eventId, assignmentId }) => {
  try {
    return await Notification.create({
      userId: freelancerId,
      type: 'Approval',
      title: 'Assignment Confirmed',
      message: `Your assignment as ${role} for "${eventName}" has been officially approved!`,
      metadata: { eventId, assignmentId, role },
    });
  } catch (error) {
    console.error('[NotificationService Error notifyAssignmentApproval]:', error.message);
    return null;
  }
};

/**
 * 3. Assignment Rejection / Decline Notification
 * Dispatched to organizer if a freelancer declines or is removed
 */
export const notifyAssignmentRejection = async ({ organizerId, freelancerName, role, eventName, eventId }) => {
  try {
    return await Notification.create({
      userId: organizerId,
      type: 'Rejection',
      title: 'Assignment Declined',
      message: `${freelancerName} declined the ${role} assignment for "${eventName}". Standby backup ready.`,
      metadata: { eventId, role },
    });
  } catch (error) {
    console.error('[NotificationService Error notifyAssignmentRejection]:', error.message);
    return null;
  }
};

/**
 * 4. Freelancer Cancellation Notification
 * Dispatched to organizer when an active crew member cancels
 */
export const notifyFreelancerCancellation = async ({ organizerId, freelancerName, role, eventName, eventId, assignmentId }) => {
  try {
    return await Notification.create({
      userId: organizerId,
      type: 'Cancellation',
      title: 'Emergency Cancellation Alert',
      message: `${freelancerName} (${role}) has cancelled for "${eventName}". Standby replacement recommended.`,
      metadata: { eventId, assignmentId, role },
    });
  } catch (error) {
    console.error('[NotificationService Error notifyFreelancerCancellation]:', error.message);
    return null;
  }
};

/**
 * 5. Backup Crew Activation Notification
 * Dispatched to the backup freelancer and organizer when standby candidate is activated
 */
export const notifyBackupActivation = async ({ backupFreelancerId, role, eventName, eventId, organizerId, replacedName }) => {
  try {
    const notifications = await Promise.all([
      // Alert to backup freelancer
      Notification.create({
        userId: backupFreelancerId,
        type: 'BackupActivation',
        title: 'Standby Activated!',
        message: `You have been promoted from Standby to Primary ${role} for "${eventName}". Please report on schedule.`,
        metadata: { eventId, role },
      }),
      // Alert to organizer
      Notification.create({
        userId: organizerId,
        type: 'BackupActivation',
        title: 'Backup Activated',
        message: `Standby crew member has been successfully activated for ${role} on "${eventName}" (replaced ${replacedName}).`,
        metadata: { eventId, role },
      }),
    ]);
    return notifications;
  } catch (error) {
    console.error('[NotificationService Error notifyBackupActivation]:', error.message);
    return null;
  }
};

/**
 * 6. Assignment Status Change Notification
 * Dispatched when assignment progress updates (e.g. Briefed, On-Site, Completed)
 */
export const notifyStatusChange = async ({ targetUserId, role, eventName, newStatus, eventId, assignmentId }) => {
  try {
    return await Notification.create({
      userId: targetUserId,
      type: 'StatusUpdate',
      title: `Assignment Status: ${newStatus}`,
      message: `Your ${role} status for "${eventName}" is now updated to "${newStatus}".`,
      metadata: { eventId, assignmentId, newStatus },
    });
  } catch (error) {
    console.error('[NotificationService Error notifyStatusChange]:', error.message);
    return null;
  }
};

/**
 * 7. Event Update Notification
 * Dispatched to all assigned crew members when event details (date, venue, budget) change
 */
export const notifyEventUpdate = async ({ crewUserIds, eventName, updateSummary, eventId }) => {
  try {
    if (!Array.isArray(crewUserIds) || crewUserIds.length === 0) return [];
    const created = await Promise.all(
      crewUserIds.map((userId) =>
        Notification.create({
          userId,
          type: 'EventUpdate',
          title: `Update: ${eventName}`,
          message: updateSummary || `Schedule or venue details updated for "${eventName}". Please check your call sheet.`,
          metadata: { eventId },
        })
      )
    );
    return created;
  } catch (error) {
    console.error('[NotificationService Error notifyEventUpdate]:', error.message);
    return [];
  }
};

