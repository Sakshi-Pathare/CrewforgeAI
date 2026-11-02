import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must have a recipient User'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Crew Forge Update',
    },
    message: {
      type: String,
      required: [true, 'Please provide notification message text'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: [
          'Assignment',
          'Approval',
          'Rejection',
          'Cancellation',
          'BackupActivation',
          'StatusUpdate',
          'EventUpdate',
          'Match',
          'System'
        ],
        message: '{VALUE} is not a valid notification type',
      },
      default: 'System',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

