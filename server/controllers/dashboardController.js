import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Assignment } from '../models/Assignment.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { User } from '../models/User.js';
import { SAMPLE_EVENTS } from '../utils/sampleData.js';

// @desc    Get aggregated dashboard metrics and summary from database
// @route   GET /api/dashboard/stats
// @access  Private (Organizer, Freelancer, Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      // Graceful degraded mode when database is offline
      return res.status(200).json({
        success: true,
        isDatabaseConnected: false,
        warning: 'MongoDB is disconnected. Returning fallback operational dashboard metrics.',
        stats: {
          totalEvents: 5,
          upcomingEvents: 5,
          activeEvents: 2,
          completedEvents: 1,
          crewRequirements: 47,
          activeAssignments: 14,
          availableFreelancers: 12,
          pendingApprovals: 2,
          confirmedCrewMembers: 12,
          totalCrewBudget: 42500,
          backupCoverage: 100,
          eventStatusBreakdown: {
            Draft: 0,
            Published: 2,
            InProgress: 1,
            Completed: 1,
            Cancelled: 0,
          },
        },
        recentEvents: SAMPLE_EVENTS,
        activeCrewCallSheet: [],
      });
    }

    // Determine organizer query scope: authenticated user, or seeded demo organizer, or all
    let organizerId = req.user?._id;
    const isAdmin = req.user?.role === 'Admin';

    if (!organizerId && !isAdmin) {
      const defaultOrganizer = await User.findOne({ email: 'varsharani@eventco.in' }) || await User.findOne({ role: 'Organizer' });
      if (defaultOrganizer) {
        organizerId = defaultOrganizer._id;
      }
    }

    const eventQuery = isAdmin || !organizerId ? {} : { organizerId };

    // 1. Total Events
    const totalEvents = await Event.countDocuments(eventQuery);

    // 2. Upcoming Events (events that are not cancelled or completed)
    const upcomingEvents = await Event.countDocuments({
      ...eventQuery,
      status: { $nin: ['Cancelled', 'Completed'] },
    });

    // 3. Active Events (events currently live, confirmed, or in progress)
    const activeEvents = await Event.countDocuments({
      ...eventQuery,
      status: { $in: ['Live', 'In Progress', 'Confirmed'] },
    });

    // 4. Completed Events
    const completedEvents = await Event.countDocuments({
      ...eventQuery,
      status: 'Completed',
    });

    // 5. Total Crew Requirements across events (sum of crewMembersNeeded)
    const crewReqAgg = await Event.aggregate([
      { $match: { ...eventQuery, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSlots: { $sum: '$crewMembersNeeded' } } },
    ]);
    const crewRequirements = crewReqAgg.length > 0 ? crewReqAgg[0].totalSlots : 0;

    // 6. Event Status Breakdown
    const [draftCount, pubCount, inProgCount, compCount, cancCount] = await Promise.all([
      Event.countDocuments({ ...eventQuery, status: 'Draft' }),
      Event.countDocuments({ ...eventQuery, status: { $in: ['Published', 'Planning', 'Crew Sourced'] } }),
      Event.countDocuments({ ...eventQuery, status: { $in: ['In Progress', 'Live', 'Confirmed'] } }),
      Event.countDocuments({ ...eventQuery, status: 'Completed' }),
      Event.countDocuments({ ...eventQuery, status: 'Cancelled' }),
    ]);

    // 7. User's event IDs to scope assignments
    const userEvents = await Event.find(eventQuery).select('_id');
    const userEventIds = userEvents.map((e) => e._id);

    const assignmentFilter = isAdmin || !organizerId
      ? {}
      : { eventId: { $in: userEventIds } };

    // 8. Active Assignments (status in Confirmed, Briefed, On-Site, Pending)
    const activeAssignments = await Assignment.countDocuments({
      ...assignmentFilter,
      status: { $in: ['Pending', 'Confirmed', 'Briefed', 'On-Site'] },
    });

    // 9. Confirmed Crew Members
    const confirmedCrewMembers = await Assignment.countDocuments({
      ...assignmentFilter,
      status: { $in: ['Confirmed', 'Briefed', 'On-Site'] },
    });

    // 10. Pending Approvals
    const pendingApprovals = await Assignment.countDocuments({
      ...assignmentFilter,
      status: 'Pending',
    });

    // 11. Available Freelancers count (from FreelancerProfile)
    const availableFreelancers = await FreelancerProfile.countDocuments({
      status: { $in: ['Online', 'Available'] },
    });

    // 12. Total Crew Budget (Sum of fees of confirmed assignments)
    const budgetAgg = await Assignment.aggregate([
      { $match: { ...assignmentFilter, status: { $in: ['Confirmed', 'Briefed', 'On-Site'] } } },
      { $group: { _id: null, total: { $sum: '$fee' } } },
    ]);
    const totalCrewBudget = budgetAgg.length > 0 ? budgetAgg[0].total : 0;

    // 13. Backup Coverage Percentage
    const totalAssigned = await Assignment.countDocuments(assignmentFilter);
    const backedAssignments = await Assignment.countDocuments({
      ...assignmentFilter,
      $or: [
        { isBackup: true },
        { backupAssignedName: { $exists: true, $ne: '' } },
      ],
    });
    const backupCoverage = totalAssigned > 0
      ? Math.round((backedAssignments / totalAssigned) * 100)
      : 100;

    // 14. Fetch 5 Most Recent Events with full schema fields
    const recentEvents = await Event.find(eventQuery)
      .populate('organizerId', 'name email phone avatar organizationName')
      .sort({ createdAt: -1 })
      .limit(5);

    // 15. Fetch Active Call Sheet
    const activeCrewCallSheet = await Assignment.find({
      ...assignmentFilter,
      status: { $in: ['Confirmed', 'Briefed', 'On-Site'] },
    })
      .populate('freelancerId', 'name avatar phone')
      .populate('eventId', 'eventName date location')
      .limit(5);

    return res.status(200).json({
      success: true,
      isDatabaseConnected: true,
      stats: {
        totalEvents,
        upcomingEvents,
        activeEvents,
        completedEvents,
        crewRequirements,
        activeAssignments,
        availableFreelancers,
        pendingApprovals,
        confirmedCrewMembers,
        totalCrewBudget,
        backupCoverage,
        eventStatusBreakdown: {
          Draft: draftCount,
          Published: pubCount,
          InProgress: inProgCount,
          Completed: compCount,
          Cancelled: cancCount,
        },
      },
      recentEvents,
      activeCrewCallSheet,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to calculate dashboard statistics',
    });
  }
};
