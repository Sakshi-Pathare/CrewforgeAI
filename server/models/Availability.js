import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Availability must be linked to a Freelancer'],
      unique: true,
      index: true,
    },
    availableDates: {
      type: [String],
      default: [],
    },
    unavailableDates: {
      type: [String],
      default: [],
    },
    note: {
      type: String,
      trim: true,
      default: 'Available for university fests & weekend productions',
    },
  },
  {
    timestamps: true,
  }
);

export const Availability = mongoose.model('Availability', availabilitySchema);
export default Availability;

