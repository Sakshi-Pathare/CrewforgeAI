import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Assignment must belong to an Event'],
      index: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assignment must be assigned to a Freelancer User'],
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Please provide the assigned role'],
      trim: true,
    },
    fee: {
      type: Number,
      required: [true, 'Please provide the agreed fee for this assignment'],
      min: [0, 'Fee cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Briefed', 'On-Site', 'Completed', 'Declined', 'Cancelled'],
        message: '{VALUE} is not a valid assignment status',
      },
      default: 'Confirmed',
    },
    isBackup: {
      type: Boolean,
      default: false,
    },
    backupAssignedName: {
      type: String,
      trim: true,
      default: 'Auto Standby',
    },
    backupForFreelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find all assignments for an event
assignmentSchema.index({ eventId: 1, freelancerId: 1 });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;

