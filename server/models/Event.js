import mongoose from 'mongoose';

const roleRequirementSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
    },
    count: {
      type: Number,
      required: [true, 'Number of crew needed for this role is required'],
      min: [1, 'Must require at least 1 person for this role'],
      default: 1,
    },
    skills: {
      type: [String],
      default: [],
    },
    budgetPerRole: {
      type: Number,
      default: 0,
      min: [0, 'Budget cannot be negative'],
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event must have an organizer'],
      index: true,
    },
    eventName: {
      type: String,
      required: [true, 'Please provide an event name'],
      trim: true,
      maxlength: [150, 'Event name cannot exceed 150 characters'],
    },
    eventType: {
      type: String,
      required: [true, 'Please select an event type'],
      trim: true,
      default: 'College Event',
    },
    category: {
      type: String,
      trim: true,
      default: 'College Event',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    },
    date: {
      type: String,
      required: [true, 'Please provide an event date (e.g. 24 October 2026)'],
      trim: true,
    },
    startTime: {
      type: String,
      trim: true,
      default: '09:00 AM',
    },
    endTime: {
      type: String,
      trim: true,
      default: '06:00 PM',
    },
    venue: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: 'Pune',
    },
    location: {
      type: String,
      required: [true, 'Please provide an event location/venue'],
      trim: true,
    },
    totalBudget: {
      type: Number,
      required: [true, 'Please provide a total budget (in INR)'],
      min: [0, 'Budget cannot be negative'],
    },
    crewMembersNeeded: {
      type: Number,
      required: [true, 'Please specify the number of crew members needed'],
      min: [1, 'Must need at least 1 crew member'],
      default: 8,
    },
    requiredRoles: {
      type: [String],
      required: [true, 'Please provide at least one required crew role'],
      default: ['Photographer', 'Sound Engineer', 'Anchor', 'Security'],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    roleRequirements: {
      type: [roleRequirementSchema],
      default: [],
    },
    additionalRequirements: {
      type: String,
      trim: true,
      maxlength: [2000, 'Additional requirements cannot exceed 2000 characters'],
      default: '',
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Special instructions cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Published',
        'In Progress',
        'Completed',
        'Cancelled',
        'Planning',
        'Crew Sourced',
        'Confirmed',
        'Live',
      ],
      default: 'Published',
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ organizerId: 1, date: 1 });
eventSchema.index({ status: 1, date: 1 });

export const Event = mongoose.model('Event', eventSchema);
export default Event;
