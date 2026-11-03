import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Event } from '../models/Event.js';
import { Assignment } from '../models/Assignment.js';
import { Availability } from '../models/Availability.js';
import { Notification } from '../models/Notification.js';
import { maskMongoURI } from '../config/db.js';

// Reliably resolve server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else {
  dotenv.config();
}

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crewforge';
const isAtlas = mongoURI.startsWith('mongodb+srv://');

if (isAtlas) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch {
    // Continue with default resolver if restricted
  }
}

const seedData = async () => {
  try {
    console.log(`\n[Seed] Connecting to MongoDB at ${maskMongoURI(mongoURI)}...`);
    console.log(`[Seed] Atlas Cloud DB: ${isAtlas ? 'YES' : 'NO'}`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('[Seed] Database connected successfully.');

    // 1. Clear existing collections
    console.log('[Seed] Cleaning old database collections...');
    await User.deleteMany({});
    await FreelancerProfile.deleteMany({});
    await Event.deleteMany({});
    await Assignment.deleteMany({});
    await Availability.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed] Collections cleared.');

    // Common salt for development seed
    const salt = await bcrypt.genSalt(10);

    // 2. Create Sample Admin (created exclusively via dev-only seed process)
    console.log('[Seed] Creating Sample Admin account...');
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
    const adminUser = await User.create({
      name: 'Crew Forge Admin',
      email: 'admin@crewforge.ai',
      passwordHash: adminPasswordHash,
      role: 'Admin',
      phone: '+91 90000 00001',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80',
    });

    // 3. Create Sample Organizer (Varsharani)
    console.log('[Seed] Creating Sample Organizer account...');
    const organizerPasswordHash = await bcrypt.hash('Organizer@123', salt);
    const organizerUser = await User.create({
      name: 'Varsharani',
      email: 'varsharani@eventco.in',
      passwordHash: organizerPasswordHash,
      role: 'Organizer',
      phone: '+91 98220 12345',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
    });

    // 4. Create 12 Sample Freelancer Accounts with Profiles
    console.log('[Seed] Creating 12 Sample Freelancers & Profiles...');
    const freelancerPasswordHash = await bcrypt.hash('Freelancer@123', salt);

    const freelancersRaw = [
      {
        name: 'Riya Deshmukh',
        email: 'riya.deshmukh@crewforge.ai',
        phone: '+91 98221 00001',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'Photographer',
        rating: 4.9,
        reviewsCount: 124,
        pricePerEvent: 4500,
        skills: ['Photography', 'Editing', 'Team Player'],
        status: 'Online',
        location: 'Pune, Maharashtra',
        bio: 'Award-winning event photographer with 5+ years capturing college fests, concerts, and brand activations.',
        experienceYears: 5,
        completedEvents: 86,
        reliabilityScore: 98,
      },
      {
        name: 'Aditya Kulkarni',
        email: 'aditya.kulkarni@crewforge.ai',
        phone: '+91 98221 00002',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'Sound Engineer',
        rating: 4.8,
        reviewsCount: 98,
        pricePerEvent: 5000,
        skills: ['Sound Mixing', 'Audio Setup', 'Technical'],
        status: 'Online',
        location: 'Pune, Maharashtra',
        bio: 'Specialist in live concert sound balance, digital consoles, line arrays, and wireless mic synchronization.',
        experienceYears: 6,
        completedEvents: 112,
        reliabilityScore: 95,
      },
      {
        name: 'Sneha Iyer',
        email: 'sneha.iyer@crewforge.ai',
        phone: '+91 98221 00003',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'Event Anchor',
        rating: 4.7,
        reviewsCount: 76,
        pricePerEvent: 3500,
        skills: ['Anchoring', 'Communication', 'Public Speaking'],
        status: 'Offline',
        location: 'Mumbai / Pune',
        bio: 'Dynamic bilingual host adept at audience engagement, stage pacing, games, and ceremonial protocol.',
        experienceYears: 4,
        completedEvents: 65,
        reliabilityScore: 92,
      },
      {
        name: 'Rohit Sharma',
        email: 'rohit.sharma@crewforge.ai',
        phone: '+91 98221 00004',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'Lighting Technician',
        rating: 4.6,
        reviewsCount: 64,
        pricePerEvent: 4000,
        skills: ['Lighting', 'Stage Setup', 'Technical'],
        status: 'Online',
        location: 'Pune, Maharashtra',
        bio: 'Stage lighting wizard skilled in DMX programming, moving heads, spotlights, and laser atmospheric effects.',
        experienceYears: 4,
        completedEvents: 54,
        reliabilityScore: 90,
      },
      {
        name: 'Neha Verma',
        email: 'neha.verma@crewforge.ai',
        phone: '+91 98221 00005',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'Makeup Artist',
        rating: 4.5,
        reviewsCount: 52,
        pricePerEvent: 3000,
        skills: ['Makeup', 'Grooming', 'Styling'],
        status: 'Online',
        location: 'Pune, Maharashtra',
        bio: 'Celebrity and stage artist makeup expert with HD cosmetic kit and quick turnaround touch-ups.',
        experienceYears: 3,
        completedEvents: 42,
        reliabilityScore: 87,
      },
      {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@crewforge.ai',
        phone: '+91 98221 00006',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'Event Manager',
        rating: 4.4,
        reviewsCount: 41,
        pricePerEvent: 6000,
        skills: ['Planning', 'Coordination', 'Communication'],
        status: 'Offline',
        location: 'Pune, Maharashtra',
        bio: 'On-ground orchestrator managing run-of-show, backstage logistics, VIP escorting, and team rosters.',
        experienceYears: 7,
        completedEvents: 95,
        reliabilityScore: 84,
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@crewforge.ai',
        phone: '+91 98221 00007',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'Security Lead',
        rating: 4.9,
        reviewsCount: 110,
        pricePerEvent: 4200,
        skills: ['Crowd Control', 'Safety', 'Logistics'],
        status: 'Online',
        location: 'Pune, Maharashtra',
        bio: 'Certified safety coordinator with extensive experience in university barricades and emergency protocols.',
        experienceYears: 5,
        completedEvents: 78,
        reliabilityScore: 94,
      },
      {
        name: 'Kunal Verma',
        email: 'kunal.verma@crewforge.ai',
        phone: '+91 98221 00008',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'Stage Designer',
        rating: 4.7,
        reviewsCount: 58,
        pricePerEvent: 4800,
        skills: ['Stage Decor', 'CAD', 'Fabrication'],
        status: 'Online',
        location: 'Pune, Maharashtra',
        bio: '3D spatial designer creating immersive backdrops, LED wall visuals, and truss architectures.',
        experienceYears: 4,
        completedEvents: 49,
        reliabilityScore: 89,
      },
      {
        name: 'Ananya Roy',
        email: 'ananya.roy@crewforge.ai',
        phone: '+91 98221 00009',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'Videographer',
        rating: 4.8,
        reviewsCount: 83,
        pricePerEvent: 5500,
        skills: ['4K Video', 'Drone', 'Color Grading'],
        status: 'Online',
        location: 'Pune, Maharashtra',
        bio: 'Cinematographer capturing cinematic aftermovies, multi-cam live streams, and Instagram reels.',
        experienceYears: 5,
        completedEvents: 72,
        reliabilityScore: 93,
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram.joshi@crewforge.ai',
        phone: '+91 98221 00010',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'DJ & Music Curator',
        rating: 4.8,
        reviewsCount: 115,
        pricePerEvent: 5200,
        skills: ['DJing', 'Audio FX', 'Crowd Hype'],
        status: 'Online',
        location: 'Pune, Maharashtra',
        bio: 'Club & college fest resident DJ with seamless genre transitions from EDM to Bollywood & Hip-Hop.',
        experienceYears: 6,
        completedEvents: 140,
        reliabilityScore: 91,
      },
      {
        name: 'Tanvi Shinde',
        email: 'tanvi.shinde@crewforge.ai',
        phone: '+91 98221 00011',
        avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'Hospitality Lead',
        rating: 4.6,
        reviewsCount: 47,
        pricePerEvent: 3200,
        skills: ['Guest Relations', 'Catering', 'VIP Care'],
        status: 'Offline',
        location: 'Pune, Maharashtra',
        bio: 'Smooth green room coordination, guest accommodation, and front-desk attendee welcoming.',
        experienceYears: 3,
        completedEvents: 38,
        reliabilityScore: 86,
      },
      {
        name: 'Sameer Khan',
        email: 'sameer.khan@crewforge.ai',
        phone: '+91 98221 00012',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=240&auto=format&fit=crop&q=80',
        primaryRole: 'Drone Operator',
        rating: 4.7,
        reviewsCount: 62,
        pricePerEvent: 4500,
        skills: ['Aerial Shots', 'FPV', 'Safety Regulations'],
        status: 'Online',
        location: 'Pune, Maharashtra',
        bio: 'DGCA-licensed drone pilot for outdoor high-speed aerials, crowd overviews, and night shots.',
        experienceYears: 4,
        completedEvents: 50,
        reliabilityScore: 88,
      },
    ];

    const createdFreelancers = [];
    for (const f of freelancersRaw) {
      const user = await User.create({
        name: f.name,
        email: f.email,
        passwordHash: freelancerPasswordHash,
        role: 'Freelancer',
        phone: f.phone,
        avatar: f.avatar,
      });

      const profile = await FreelancerProfile.create({
        userId: user._id,
        primaryRole: f.primaryRole,
        rating: f.rating,
        reviewsCount: f.reviewsCount,
        pricePerEvent: f.pricePerEvent,
        skills: f.skills,
        status: f.status,
        location: f.location,
        bio: f.bio,
        experienceYears: f.experienceYears,
        completedEvents: f.completedEvents,
        reliabilityScore: f.reliabilityScore,
      });

      await Availability.create({
        freelancerId: user._id,
        availableDates: ['2026-10-24', '2026-11-12', '2026-12-05'],
        unavailableDates: [],
      });

      createdFreelancers.push({ user, profile });
    }

    // 5. Create Sample Event for Varsharani
    console.log('[Seed] Creating Sample Event: Annual College Fest...');
    const event = await Event.create({
      organizerId: organizerUser._id,
      eventName: 'Annual College Fest',
      eventType: 'College Event',
      date: '24 October 2026',
      location: 'Pune, Maharashtra',
      totalBudget: 25000,
      crewMembersNeeded: 8,
      requiredRoles: ['Photographer', 'Sound Engineer', 'Event Anchor', 'Security Lead'],
      additionalRequirements: 'Need high-energy crew familiar with large campus crowds and evening outdoor lighting acoustics.',
      bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      status: 'Confirmed',
    });

    await Event.create({
      organizerId: organizerUser._id,
      eventName: 'MITAOE College Hackathon',
      eventType: 'College Event',
      date: '20 November 2026',
      startTime: '09:00 AM',
      endTime: '09:00 PM',
      venue: 'MIT Academy of Engineering (MITAOE) Campus',
      city: 'Pune',
      location: 'Alandi, Pune, Maharashtra',
      totalBudget: 35000,
      crewMembersNeeded: 8,
      requiredRoles: ['Photographer', 'Videographer', 'Technical Coordinator', 'Event Anchor'],
      additionalRequirements: '48-hour continuous national hackathon. Crew needed for live stage announcements, project presentations coverage, and high-speed photo highlights.',
      bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
      status: 'Published',
    });

    await Event.create({
      organizerId: organizerUser._id,
      eventName: 'Birthday Party',
      eventType: 'Private Party',
      date: '28 November 2026',
      startTime: '06:30 PM',
      endTime: '11:30 PM',
      venue: 'The Westin Grand Ballroom',
      city: 'Pune',
      location: 'Koregaon Park, Pune, Maharashtra',
      totalBudget: 18000,
      crewMembersNeeded: 4,
      requiredRoles: ['Photographer', 'Sound Engineer', 'Event Anchor', 'Decorator'],
      additionalRequirements: 'Evening milestone birthday party with dance floor, cake-cutting ceremony, family portrait sessions, and curated party playlist.',
      bannerImage: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80',
      status: 'Published',
    });

    // 6. Create Confirmed Assignments
    console.log('[Seed] Creating Confirmed Assignments with Standby mappings...');
    const riya = createdFreelancers.find(f => f.user.name === 'Riya Deshmukh').user;
    const aditya = createdFreelancers.find(f => f.user.name === 'Aditya Kulkarni').user;
    const sneha = createdFreelancers.find(f => f.user.name === 'Sneha Iyer').user;
    const priya = createdFreelancers.find(f => f.user.name === 'Priya Patel').user;

    const assignments = [
      {
        eventId: event._id,
        freelancerId: riya._id,
        role: 'Photographer',
        fee: 4500,
        status: 'Confirmed',
        isBackup: false,
        backupAssignedName: 'Ananya Roy',
      },
      {
        eventId: event._id,
        freelancerId: aditya._id,
        role: 'Sound Engineer',
        fee: 5000,
        status: 'Briefed',
        isBackup: false,
        backupAssignedName: 'Rohit Sharma',
      },
      {
        eventId: event._id,
        freelancerId: sneha._id,
        role: 'Event Anchor',
        fee: 3500,
        status: 'Confirmed',
        isBackup: false,
        backupAssignedName: 'Arjun Mehta',
      },
      {
        eventId: event._id,
        freelancerId: priya._id,
        role: 'Security Lead',
        fee: 4200,
        status: 'Confirmed',
        isBackup: false,
        backupAssignedName: 'Sameer Khan',
      },
    ];

    await Assignment.insertMany(assignments);

    // 7. Create Sample Notifications
    await Notification.create([
      {
        userId: organizerUser._id,
        type: 'StatusUpdate',
        title: 'Assignment Confirmed',
        message: 'Riya Deshmukh confirmed assignment for Annual College Fest.',
      },
      {
        userId: organizerUser._id,
        type: 'Match',
        title: 'New AI Match Available',
        message: 'New 98% AI Match available for Sound Engineer position.',
      },
    ]);

    console.log('\n======================================================');
    console.log('✅ Crew Forge Database Seeding Completed Successfully!');
    console.log('======================================================');
    console.log('Credentials Summary:');
    console.log('1. Admin:');
    console.log('   Email:    admin@crewforge.ai');
    console.log('   Password: Admin@123');
    console.log('2. Organizer:');
    console.log('   Email:    varsharani@eventco.in');
    console.log('   Password: Organizer@123');
    console.log('3. Freelancers (12 total):');
    console.log('   Emails:   riya.deshmukh@crewforge.ai (and 11 others)');
    console.log('   Password: Freelancer@123');
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ [Seed Error]', error);
    process.exit(1);
  }
};

seedData();

