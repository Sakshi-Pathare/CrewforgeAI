import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { ProfileModal } from './components/ProfileModal';
import { CreateEventPage } from './pages/CreateEventPage';
import { FindCrewPage } from './pages/FindCrewPage';
import { AiRecommendationsPage } from './pages/AiRecommendationsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { BackupCrewPage } from './pages/BackupCrewPage';
import { 
  PageType, 
  Freelancer, 
  EventData, 
  CrewAssignment 
} from './types';
import { 
  INITIAL_EVENT, 
  MOCK_FREELANCERS, 
  INITIAL_ASSIGNMENTS, 
  UPCOMING_EVENTS 
} from './data/mockData';

export const App: React.FC = () => {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<PageType>('create-event');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Event State
  const [eventData, setEventData] = useState<EventData>(INITIAL_EVENT);
  const [eventsList, setEventsList] = useState<EventData[]>(UPCOMING_EVENTS);

  // Freelancer & Assignment State
  const [freelancers] = useState<Freelancer[]>(MOCK_FREELANCERS);
  const [assignments, setAssignments] = useState<CrewAssignment[]>(INITIAL_ASSIGNMENTS);
  const [selectedIds, setSelectedIds] = useState<string[]>(['f-1', 'f-2', 'f-3', 'f-7']);

  // Modal State
  const [viewingFreelancer, setViewingFreelancer] = useState<Freelancer | null>(null);

  const handleUpdateEvent = (updated: Partial<EventData>) => {
    setEventData(prev => ({ ...prev, ...updated }));
    setEventsList(prev => prev.map(e => e.id === eventData.id ? { ...e, ...updated } : e));
  };

  const handleSelectFreelancer = (crew: Freelancer) => {
    setSelectedIds(prev => {
      if (prev.includes(crew.id)) {
        // Deselect
        setAssignments(a => a.filter(item => item.freelancerId !== crew.id));
        return prev.filter(id => id !== crew.id);
      } else {
        // Select
        const newAssignment: CrewAssignment = {
          id: `asg-${Date.now()}`,
          freelancerId: crew.id,
          freelancerName: crew.name,
          role: crew.role,
          avatar: crew.avatar,
          eventName: eventData.name,
          date: eventData.date,
          fee: crew.pricePerEvent,
          status: 'Confirmed',
          backupAssigned: 'Auto Standby'
        };
        setAssignments(a => [newAssignment, ...a]);
        return [...prev, crew.id];
      }
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F5FD]">
      {/* 1. Left Fixed Sidebar (approx 294px wide, dark navy #101D4B) */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        pendingCount={assignments.length}
      />

      {/* Main Area: TopNav + Scrollable Content Canvas */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. Top Navigation Bar (approx 74px high) */}
        <TopNav
          currentPage={currentPage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigate={setCurrentPage}
        />

        {/* 3. Main Scrollable Canvas (Light Lavender #F2F5FD, 1536x1024 desktop target) */}
        <main className="flex-1 overflow-y-auto px-9 py-7 scroll-smooth">
          {currentPage === 'create-event' && (
            <CreateEventPage
              eventData={eventData}
              onUpdateEvent={handleUpdateEvent}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'find-crew' && (
            <FindCrewPage
              freelancers={freelancers}
              onNavigate={setCurrentPage}
              onSelectFreelancer={handleSelectFreelancer}
              onViewProfile={setViewingFreelancer}
              selectedIds={selectedIds}
            />
          )}

          {currentPage === 'ai-recommendations' && (
            <AiRecommendationsPage
              eventData={eventData}
              freelancers={freelancers}
              onNavigate={setCurrentPage}
              onViewProfile={setViewingFreelancer}
              onSelectFreelancer={handleSelectFreelancer}
              selectedIds={selectedIds}
            />
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage
              events={eventsList}
              freelancers={freelancers}
              onNavigate={setCurrentPage}
              onViewProfile={setViewingFreelancer}
            />
          )}

          {currentPage === 'assignments' && (
            <AssignmentsPage
              assignments={assignments}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'backup-crew' && (
            <BackupCrewPage
              onNavigate={setCurrentPage}
              onViewProfile={setViewingFreelancer}
            />
          )}
        </main>
      </div>

      {/* Interactive Profile Drawer / Modal */}
      <ProfileModal
        freelancer={viewingFreelancer}
        onClose={() => setViewingFreelancer(null)}
        onSelect={handleSelectFreelancer}
        isSelected={viewingFreelancer ? selectedIds.includes(viewingFreelancer.id) : false}
      />
    </div>
  );
};

export default App;

