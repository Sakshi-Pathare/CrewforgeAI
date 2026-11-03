import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { SAMPLE_EVENTS, SAMPLE_EVENT } from '../utils/sampleData.js';
import { Assignment } from '../models/Assignment.js';
import { Notification } from '../models/Notification.js';
import { notifyEventUpdate } from '../services/notificationService.js';

// Valid statuses for Phase 7
const VALID_STATUSES = [
  'Draft',
  'Published',
  'In Progress',
  'Completed',
  'Cancelled',
  'Planning',
  'Crew Sourced',
  'Confirmed',
  'Live',
];

// @desc    Get events with role-based filtering (Organizer owns, Freelancers see published)
// @route   GET /api/events
// @access  Public / Private (Role-based via optionalProtect)
export const getEvents = async (req, res) => {
  try {
    const { status, category, eventType, city, search, scope } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let filtered = [...SAMPLE_EVENTS];
      if (status && status !== 'All') {
        filtered = filtered.filter(e => (e.status || 'Published').toLowerCase() === status.toLowerCase());
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(e => 
          (e.eventName && e.eventName.toLowerCase().includes(q)) ||
          (e.name && e.name.toLowerCase().includes(q)) ||
          (e.location && e.location.toLowerCase().includes(q)) ||
          (e.type && e.type.toLowerCase().includes(q))
        );
      }
      return res.status(200).json({
        success: true,
        count: filtered.length,
        events: filtered,
        isDatabaseConnected: false,
      });
    }
    let query = {};

    // 1. Determine Scope based on user role and query
    if (req.user) {
      if (req.user.role === 'Admin') {
        // Admin sees all by default, can filter by organizerId if passed
        if (req.query.organizerId) query.organizerId = req.query.organizerId;
      } else if (req.user.role === 'Freelancer' || scope === 'public' || req.query.feed === 'true') {
        // Freelancers see published / active events
        query.status = { $in: ['Published', 'In Progress', 'Live', 'Planning', 'Crew Sourced', 'Confirmed'] };
      } else if (req.user.role === 'Organizer') {
        if (scope === 'all' || req.query.feed === 'true') {
          // Viewing global feed of published events
          query.status = { $in: ['Published', 'In Progress', 'Live', 'Planning', 'Crew Sourced', 'Confirmed'] };
        } else {
          // Default for Organizer: their own events
          query.organizerId = req.user._id;
        }
      }
    } else {
      // Unauthenticated visitor: see published / active events
      query.status = { $in: ['Published', 'In Progress', 'Live', 'Planning', 'Crew Sourced', 'Confirmed'] };
    }

    // 2. Specific status filter override if explicitly requested
    if (status && VALID_STATUSES.includes(status)) {
      query.status = status;
    }

    // 3. Category / Event Type filter
    const cat = category || eventType;
    if (cat && cat !== 'All') {
      query.$or = [{ eventType: cat }, { category: cat }];
    }

    // 4. City filter
    if (city && city !== 'All') {
      query.city = new RegExp(city.trim(), 'i');
    }

    // 5. Keyword search filter
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { eventName: regex },
        { venue: regex },
        { location: regex },
        { city: regex },
        { description: regex },
      ];
    }

    let events = await Event.find(query)
      .populate('organizerId', 'name email phone avatar organizationName')
      .sort({ createdAt: -1 });

    if (SAMPLE_EVENTS && SAMPLE_EVENTS.length > 0) {
      const existingNames = new Set(events.map(e => (e.eventName || e.name || '').toLowerCase()));
      for (const sample of SAMPLE_EVENTS) {
        const sName = (sample.eventName || sample.name || '').toLowerCase();
        if (!existingNames.has(sName)) {
          events.push(sample);
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch events',
    });
  }
};

// @desc    Get currently logged in organizer's events
// @route   GET /api/events/my-events
// @access  Private (Organizer, Admin)
export const getMyEvents = async (req, res) => {
  try {
    const query = req.user.role === 'Admin' && req.query.organizerId 
      ? { organizerId: req.query.organizerId }
      : { organizerId: req.user._id };

    let events = await Event.find(query)
      .populate('organizerId', 'name email phone avatar organizationName')
      .sort({ createdAt: -1 });

    if (SAMPLE_EVENTS && SAMPLE_EVENTS.length > 0) {
      const existingNames = new Set(events.map(e => (e.eventName || e.name || '').toLowerCase()));
      for (const sample of SAMPLE_EVENTS) {
        const sName = (sample.eventName || sample.name || '').toLowerCase();
        if (!existingNames.has(sName)) {
          events.push(sample);
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch your events',
    });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer, Admin)
export const createEvent = async (req, res) => {
  try {
    const {
      eventName,
      eventType,
      category,
      description,
      bannerImage,
      date,
      startTime,
      endTime,
      venue,
      address,
      city,
      location,
      totalBudget,
      crewMembersNeeded,
      requiredRoles,
      requiredSkills,
      roleRequirements,
      additionalRequirements,
      specialInstructions,
      status,
    } = req.body;

    // 1. Mandatory Field Validation
    if (!eventName || !date || totalBudget === undefined) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Please provide eventName, date, and totalBudget.',
      });
    }

    if (Number(totalBudget) < 0) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Total budget cannot be negative.',
      });
    }

    const finalCrewNeeded = Number(crewMembersNeeded) || 8;
    if (finalCrewNeeded < 1) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Event must require at least 1 crew member.',
      });
    }

    // Resolve location string
    const finalCity = city ? city.trim() : 'Pune';
    const finalVenue = venue ? venue.trim() : '';
    const finalLocation = location
      ? location.trim()
      : [finalVenue, finalCity, 'Maharashtra'].filter(Boolean).join(', ');

    // Normalize roles
    const normalizedRoles = Array.isArray(requiredRoles) && requiredRoles.length > 0
      ? requiredRoles
      : ['Photographer', 'Sound Engineer', 'Event Anchor', 'Security Lead'];

    const event = await Event.create({
      organizerId: req.user._id,
      eventName: eventName.trim(),
      eventType: eventType || category || 'College Event',
      category: category || eventType || 'College Event',
      description: description ? description.trim() : '',
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      date: date.trim(),
      startTime: startTime || '09:00 AM',
      endTime: endTime || '06:00 PM',
      venue: finalVenue,
      address: address ? address.trim() : '',
      city: finalCity,
      location: finalLocation,
      totalBudget: Number(totalBudget),
      crewMembersNeeded: finalCrewNeeded,
      requiredRoles: normalizedRoles,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      roleRequirements: Array.isArray(roleRequirements) ? roleRequirements : [],
      additionalRequirements: additionalRequirements || specialInstructions || '',
      specialInstructions: specialInstructions || additionalRequirements || '',
      status: status && VALID_STATUSES.includes(status) ? status : 'Published',
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to create event',
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public / Private (with permission checking on drafts)
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'name email phone avatar organizationName city');

    if (!event) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Event not found',
      });
    }

    // If event is Draft and user is not the owner or Admin, disallow access
    if (event.status === 'Draft') {
      if (!req.user || (req.user.role !== 'Admin' && event.organizerId._id.toString() !== req.user._id.toString())) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'This event draft is private to the organizer.',
        });
      }
    }

    // Fetch confirmed crew assignments count and list for this event
    const assignments = await Assignment.find({ eventId: event._id })
      .populate('freelancerId', 'name avatar phone');

    return res.status(200).json({
      success: true,
      event,
      assignmentsCount: assignments.length,
      assignments,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch event',
    });
  }
};

// @desc    Update existing event
// @route   PUT /api/events/:id
// @access  Private (Organizer owner or Admin)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Event not found',
      });
    }

    // Enforce Ownership: Freelancers or other Organizers cannot update
    if (req.user.role !== 'Admin' && event.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to update this event.',
      });
    }

    const updatableFields = [
      'eventName',
      'eventType',
      'category',
      'description',
      'bannerImage',
      'date',
      'startTime',
      'endTime',
      'venue',
      'address',
      'city',
      'location',
      'totalBudget',
      'crewMembersNeeded',
      'requiredRoles',
      'requiredSkills',
      'roleRequirements',
      'additionalRequirements',
      'specialInstructions',
      'status',
    ];

    // Validation for budgets or counts if provided
    if (req.body.totalBudget !== undefined && Number(req.body.totalBudget) < 0) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Total budget cannot be negative.',
      });
    }

    if (req.body.crewMembersNeeded !== undefined && Number(req.body.crewMembersNeeded) < 1) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Must require at least 1 crew member.',
      });
    }

    if (req.body.status !== undefined && !VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
      });
    }

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    // Auto-update combined location if venue or city was changed
    if (req.body.venue !== undefined || req.body.city !== undefined) {
      if (!req.body.location) {
        event.location = [event.venue, event.city, 'Maharashtra'].filter(Boolean).join(', ');
      }
    }

    const updatedEvent = await event.save();

    // Notify assigned crew if active
    const activeAssignments = await Assignment.find({ eventId: event._id }).select('freelancerId');
    const crewUserIds = activeAssignments.map((a) => a.freelancerId);
    if (crewUserIds.length > 0) {
      await notifyEventUpdate({
        crewUserIds,
        eventName: updatedEvent.eventName,
        updateSummary: `Event "${updatedEvent.eventName}" details have been updated.`,
        eventId: updatedEvent._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to update event',
    });
  }
};

// @desc    Change event status (Draft, Published, In Progress, Completed, Cancelled)
// @route   PATCH /api/events/:id/status
// @access  Private (Organizer owner or Admin)
export const changeEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `Please provide a valid status: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Event not found',
      });
    }

    // Ownership check
    if (req.user.role !== 'Admin' && event.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to modify the status of this event.',
      });
    }

    event.status = status;
    await event.save();

    return res.status(200).json({
      success: true,
      message: `Event status changed to ${status}`,
      event,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to change event status',
    });
  }
};

// @desc    Publish an event
// @route   POST /api/events/:id/publish
// @access  Private (Organizer owner or Admin)
export const publishEvent = async (req, res) => {
  req.body.status = 'Published';
  return changeEventStatus(req, res);
};

// @desc    Unpublish an event (sets status to Draft)
// @route   POST /api/events/:id/unpublish
// @access  Private (Organizer owner or Admin)
export const unpublishEvent = async (req, res) => {
  req.body.status = 'Draft';
  return changeEventStatus(req, res);
};

// @desc    Delete event with confirmation and cleanup
// @route   DELETE /api/events/:id
// @access  Private (Organizer owner or Admin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Event not found',
      });
    }

    // Enforce Ownership check: Freelancers or foreign Organizers get 403
    if (req.user.role !== 'Admin' && event.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to delete this event.',
      });
    }

    // Cancel related assignments in MongoDB
    await Assignment.updateMany(
      { eventId: event._id },
      { $set: { status: 'Cancelled' } }
    );

    await Event.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: `Event "${event.eventName}" and associated assignments have been deleted successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to delete event',
    });
  }
};

// @desc    Apply for an open event (Freelancer)
// @route   POST /api/events/:id/apply
// @access  Private (Freelancer)
export const applyForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Event not found',
      });
    }

    // Check if event is open for applications
    const openStatuses = ['Published', 'Planning', 'Crew Sourced', 'Confirmed'];
    if (!openStatuses.includes(event.status)) {
      return res.status(400).json({
        error: 'EventNotOpen',
        message: `This event is currently ${event.status} and not accepting crew applications.`,
      });
    }

    const { role, fee } = req.body;
    const requestedRole = role || (event.requiredRoles && event.requiredRoles[0]) || 'Event Specialist';

    // Check if freelancer already applied / assigned
    const existing = await Assignment.findOne({
      eventId: event._id,
      freelancerId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        error: 'DuplicateApplication',
        message: `You have already applied or have an active assignment (${existing.status}) for this event.`,
        assignment: existing,
      });
    }

    // Calculate sensible suggested fee based on total event budget
    const defaultFee = Math.round(event.totalBudget / (event.crewMembersNeeded || 1));
    const finalFee = fee !== undefined ? Number(fee) : defaultFee;

    const assignment = await Assignment.create({
      eventId: event._id,
      freelancerId: req.user._id,
      role: requestedRole,
      fee: Math.max(0, finalFee),
      status: 'Pending',
      backupAssignedName: 'Auto Standby',
    });

    // Notify Organizer
    await Notification.create({
      userId: event.organizerId,
      type: 'Assignment',
      title: 'New Crew Application Received',
      message: `${req.user.name} applied for ${requestedRole} on "${event.eventName}".`,
      metadata: { eventId: event._id, assignmentId: assignment._id, role: requestedRole },
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully! The organizer will review your profile.',
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to submit application',
    });
  }
};
