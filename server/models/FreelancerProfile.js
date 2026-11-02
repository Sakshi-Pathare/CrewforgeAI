import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Certificate name is required'],
      trim: true,
    },
    issuingOrganization: {
      type: String,
      required: [true, 'Issuing organization is required'],
      trim: true,
    },
    issueDate: {
      type: String,
      trim: true,
      default: '',
    },
    credentialUrl: {
      type: String,
      trim: true,
      default: '',
    },
    fileData: {
      type: String, // Base64 data URL or document link
      default: '',
    },
    fileName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true, timestamps: true }
);

const freelancerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer profile must be linked to a User'],
      unique: true,
      index: true,
    },
    primaryRole: {
      type: String,
      required: [true, 'Please specify a primary role (e.g. Photographer, Sound Engineer)'],
      trim: true,
    },
    headline: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      required: [true, 'Please provide experience in years'],
      min: [0, 'Experience years cannot be negative'],
      default: 0,
    },
    previousEventExperience: {
      type: String,
      trim: true,
      default: '',
    },
    certifications: {
      type: [String],
      default: [],
    },
    certificates: {
      type: [certificateSchema],
      default: [],
    },
    pricePerEvent: {
      type: Number,
      required: [true, 'Please provide standard fee per event (in INR)'],
      min: [0, 'Price per event cannot be negative'],
    },
    rateType: {
      type: String,
      enum: ['per-event', 'hourly', 'daily'],
      default: 'per-event',
    },
    city: {
      type: String,
      trim: true,
      default: 'Pune',
    },
    location: {
      type: String,
      trim: true,
      default: 'Pune, Maharashtra',
    },
    languages: {
      type: [String],
      default: ['English', 'Hindi'],
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: '',
    },
    availabilityDates: {
      type: [String],
      default: [],
    },
    availabilityNote: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5.0,
    },
    reviewsCount: {
      type: Number,
      min: [0, 'Reviews count cannot be negative'],
      default: 0,
    },
    completedEvents: {
      type: Number,
      min: [0, 'Completed events cannot be negative'],
      default: 0,
    },
    reliabilityScore: {
      type: Number,
      min: [0, 'Reliability score cannot be less than 0%'],
      max: [100, 'Reliability score cannot exceed 100%'],
      default: 95,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Online', 'Offline'],
      default: 'Online',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for matching engine queries
freelancerProfileSchema.index({ primaryRole: 1, location: 1, pricePerEvent: 1, rating: -1 });

export const FreelancerProfile = mongoose.model('FreelancerProfile', freelancerProfileSchema);
export default FreelancerProfile;

