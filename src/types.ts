export type PageType = 
  | 'dashboard'
  | 'create-event'
  | 'find-crew'
  | 'ai-recommendations'
  | 'assignments'
  | 'backup-crew';

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
}

export interface EventData {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  totalBudget: number;
  crewMembersNeeded: number;
  requiredRoles: string[];
  additionalRequirements?: string;
  bannerImage?: string;
  status?: 'Planning' | 'Crew Sourced' | 'Confirmed' | 'Live';
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
  status: 'Confirmed' | 'Briefed' | 'On-Site' | 'Completed';
  backupAssigned?: string;
}

