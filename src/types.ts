export type PageType = 
  | 'dashboard'
  | 'create-event'
  | 'find-crew'
  | 'ai-recommendations'
  | 'assignments'
  | 'backup-crew'
  | 'login'
  | 'register'
  | 'freelancer-profile'
  | 'organizer-profile'
  | 'manage-events';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Organizer' | 'Freelancer' | 'Admin';
  phone?: string;
  avatar?: string;
  city?: string;
  organizationName?: string;
  organizationDescription?: string;
  headline?: string;
  createdAt?: string;
}

export interface FreelancerProfileDetail {
  _id?: string;
  userId: string;
  primaryRole: string;
  headline?: string;
  skills: string[];
  experienceYears: number;
  previousEventExperience?: string;
  certifications?: string[];
  pricePerEvent: number;
  rateType?: 'per-event' | 'hourly' | 'daily';
  city?: string;
  location?: string;
  rating?: number;
  reviewsCount?: number;
  completedEvents?: number;
  reliabilityScore?: number;
  bio?: string;
  languages?: string[];
  portfolioUrl?: string;
  availabilityDates?: string[];
  availabilityNote?: string;
  status?: 'Online' | 'Offline';
}

export interface Freelancer {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviewsCount: number;
  pricePerEvent: number;
  skills: string[];
  status: 'Online' | 'Offline';
  isAvailableOnDate: boolean;
  matchScore?: number;
  avatar: string;
  location?: string;
  bio?: string;
  experienceYears?: number;
  completedEvents?: number;
  headline?: string;
}

export interface RoleRequirement {
  role: string;
  count: number;
  skills?: string[];
  budgetPerRole?: number;
}

export interface EventData {
  id: string;
  _id?: string;
  name: string;
  eventName?: string;
  type: string;
  eventType?: string;
  category?: string;
  description?: string;
  bannerImage?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  address?: string;
  city?: string;
  location: string;
  totalBudget: number;
  crewMembersNeeded: number;
  requiredRoles: string[];
  requiredSkills?: string[];
  roleRequirements?: RoleRequirement[];
  additionalRequirements?: string;
  specialInstructions?: string;
  organizerId?: any;
  status?:
    | 'Draft'
    | 'Published'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled'
    | 'Planning'
    | 'Crew Sourced'
    | 'Confirmed'
    | 'Live';
  createdAt?: string;
  updatedAt?: string;
}

export interface CrewAssignment {
  id: string;
  freelancerId: string;
  freelancerName: string;
  role: string;
  avatar: string;
  eventName: string;
  date: string;
  fee: number;
  status: 'Pending' | 'Confirmed' | 'Briefed' | 'On-Site' | 'Completed' | 'Declined' | 'Cancelled';
  backupAssigned?: string;
  phone?: string;
  eventId?: string;
}
