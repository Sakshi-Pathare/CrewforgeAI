import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Feedback must be associated with an Event'],
      index: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Feedback must target a Freelancer'],
      index: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Feedback must originate from an Organizer'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a star rating (1 to 5)'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    comments: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comments cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ eventId: 1, freelancerId: 1, organizerId: 1 });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;

