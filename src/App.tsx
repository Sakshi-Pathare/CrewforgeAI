import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { ProfileModal } from './components/ProfileModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { CreateEventPage } from './pages/CreateEventPage';
import { FindCrewPage } from './pages/FindCrewPage';
import { AiRecommendationsPage } from './pages/AiRecommendationsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { BackupCrewPage } from './pages/BackupCrewPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FreelancerProfilePage } from './pages/FreelancerProfilePage';
import { OrganizerProfilePage } from './pages/OrganizerProfilePage';
import { 
  PageType, 
  Freelancer, 
  EventData, 
  CrewAssignment,
  User 
} from './types';
import { 
  INITIAL_EVENT, 
  MOCK_FREELANCERS, 
  INITIAL_ASSIGNMENTS, 
  UPCOMING_EVENTS 
} from './data/mockData';
import { 
  getFreelancers, 
  getEvents, 
  getAssignments, 
  updateAssignmentStatus as apiUpdateAssignmentStatus,
  getStoredUser,
  getStoredToken,
  logoutUser,
  getMyProfile
} from './services/api';

export const App: React.FC = () => {
  // Authentication & Active User Session State
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());

  // Navigation State
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  // Search State (shared between TopNav and FindCrewPage)
  const [searchQuery, setSearchQuery] = useState('');

  // Event State
  const [eventData, setEventData] = useState<EventData>(INITIAL_EVENT);
  const [eventsList, setEventsList] = useState<EventData[]>(UPCOMING_EVENTS);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [selectedEventModal, setSelectedEventModal] = useState<EventData | null>(null);

  // Freelancer & Assignment State
  const [freelancers, setFreelancers] = useState<Freelancer[]>(MOCK_FREELANCERS);
  const [assignments, setAssignments] = useState<CrewAssignment[]>(INITIAL_ASSIGNMENTS);
  const [selectedIds, setSelectedIds] = useState<string[]>(['f-1', 'f-2', 'f-3', 'f-7']);

  // Modal State
  const [viewingFreelancer, setViewingFreelancer] = useState<Freelancer | null>(null);

  // Global Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      message,
      type,
    };
    setToasts(prev => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial Data & Auth Session Sync with Backend
  useEffect(() => {
    let isMounted = true;

    async function syncBackendData() {
      try {
        const token = getStoredToken();
        if (token) {
          try {
            const profileData = await getMyProfile();
            if (isMounted && profileData && profileData.user) {
              setCurrentUser(profileData.user);
            }
          } catch {
            console.warn('[Auth Sync] Session verification completed.');
          }
        }

        const [liveFreelancers, liveEvents, liveAssignments] = await Promise.all([
          getFreelancers(),
          getEvents(),
          getAssignments(eventData.id),
        ]);

        if (isMounted) {
          if (liveFreelancers && liveFreelancers.length > 0) {
            setFreelancers(liveFreelancers);
          }
          if (liveEvents && liveEvents.length > 0) {
            setEventsList(liveEvents);
            setEventData(liveEvents[0]);
          }
          if (liveAssignments && liveAssignments.length > 0) {
            setAssignments(liveAssignments);
            setSelectedIds(liveAssignments.map(a => a.freelancerId));
          }
        }
      } catch (err) {
        console.warn('[App Init] Live backend sync warning:', err);
      }
    }

    syncBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
    addToast('Welcome back', `Signed in as ${user.name || user.email}.`, 'success');
  };

  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    addToast('Account Created', 'Registration successful! Complete your profile.', 'success');
    if (user.role === 'Freelancer') {
      setCurrentPage('freelancer-profile');
    } else {
      setCurrentPage('organizer-profile');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentPage('login');
    addToast('Signed Out', 'You have been logged out securely.', 'info');
  };

  // Event Handlers
  const handleUpdateEvent = (updated: Partial<EventData>) => {
    setEventData(prev => {
      const next = { ...prev, ...updated };
      setEventsList(list => {
        const exists = list.some(e => e.id === next.id || e._id === next.id);
        return exists 
          ? list.map(e => (e.id === next.id || e._id === next.id ? next : e)) 
          : [next, ...list];
      });
      return next;
    });
    setIsEditingEvent(false);
    addToast('Event Updated', `${updated.name || eventData.name} details saved.`, 'success');
  };

  const handleEditEventFromDashboard = (evt: EventData) => {
    setEventData(evt);
    setIsEditingEvent(true);
    setCurrentPage('create-event');
  };

  const handleEventUpdated = (updatedEvt: EventData) => {
    setEventsList(list =>
      list.map(e => (e.id === updatedEvt.id || e._id === updatedEvt.id ? updatedEvt : e))
    );
    if (eventData.id === updatedEvt.id || eventData._id === updatedEvt.id) {
      setEventData(updatedEvt);
    }
    setSelectedEventModal(updatedEvt);
    addToast('Event Synchronized', `${updatedEvt.name} changes persisted.`, 'success');
  };

  const handleEventDeleted = (eventId: string) => {
    setEventsList(list => list.filter(e => e.id !== eventId && e._id !== eventId));
    if (eventData.id === eventId || eventData._id === eventId) {
      setEventData(INITIAL_EVENT);
    }
    setSelectedEventModal(null);
    addToast('Event Removed', 'Event removed from active schedule.', 'info');
  };

  const handleSelectFreelancer = (crew: Freelancer) => {
    const isCurrentlySelected = selectedIds.includes(crew.id);

    if (isCurrentlySelected) {
      // Deselect cleanly
      setSelectedIds(prev => prev.filter(id => id !== crew.id));
      setAssignments(prev => prev.filter(item => item.freelancerId !== crew.id));
      addToast(
        'Crew Deselected',
        `${crew.name} (${crew.role}) was unassigned from ${eventData.name}.`,
        'info'
      );
    } else {
      // Select cleanly
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
      setSelectedIds(prev => [...prev, crew.id]);
      setAssignments(prev => [newAssignment, ...prev]);
      addToast(
        'Crew Confirmed',
        `${crew.name} (${crew.role}) assigned to ${eventData.name} call sheet.`,
        'success'
      );
    }
  };

  const handleUpdateAssignmentStatus = (id: string, newStatus: CrewAssignment['status']) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    apiUpdateAssignmentStatus(id, newStatus).catch(() => {});
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F5FD]">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'create-event') setIsEditingEvent(false);
          setCurrentPage(page);
        }}
        pendingCount={assignments.length}
        currentUser={currentUser}
      />

      {/* Main Area: TopNav + Scrollable Content Canvas */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. Top Navigation Bar */}
        <TopNav
          currentPage={currentPage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigate={(page) => {
            if (page === 'create-event') setIsEditingEvent(false);
            setCurrentPage(page);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* 3. Main Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto px-9 py-7 scroll-smooth">
          {/* User Registration Screen */}
          {currentPage === 'register' && (
            <RegisterPage
              onNavigate={setCurrentPage}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}

          {/* User Sign In Screen */}
          {currentPage === 'login' && (
            <LoginPage
              onNavigate={setCurrentPage}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {/* Freelancer Profile Screen */}
          {currentPage === 'freelancer-profile' && (
            <FreelancerProfilePage
              currentUser={currentUser}
              onNavigate={setCurrentPage}
              onUserUpdated={setCurrentUser}
            />
          )}

          {/* Organizer Profile Screen */}
          {currentPage === 'organizer-profile' && (
            <OrganizerProfilePage
              currentUser={currentUser}
              onNavigate={setCurrentPage}
              onUserUpdated={setCurrentUser}
            />
          )}

          {/* Preserved Screen 1: Dashboard */}
          {currentPage === 'dashboard' && (
            <DashboardPage
              events={eventsList}
              freelancers={freelancers}
              onNavigate={(page) => {
                if (page === 'create-event') setIsEditingEvent(false);
                setCurrentPage(page);
              }}
              onViewProfile={setViewingFreelancer}
              onSelectEvent={(evt) => setSelectedEventModal(evt)}
              onEditEvent={handleEditEventFromDashboard}
              currentUser={currentUser}
            />
          )}

          {/* Preserved Screen 2: Create / Edit Event */}
          {currentPage === 'create-event' && (
            <CreateEventPage
              eventData={eventData}
              onUpdateEvent={handleUpdateEvent}
              onNavigate={setCurrentPage}
              isEditing={isEditingEvent}
            />
          )}

          {/* Preserved Screen 3: Find Crew */}
          {currentPage === 'find-crew' && (
            <FindCrewPage
              freelancers={freelancers}
              onNavigate={setCurrentPage}
              onSelectFreelancer={handleSelectFreelancer}
              onViewProfile={setViewingFreelancer}
              selectedIds={selectedIds}
              searchQuery={searchQuery}
            />
          )}

          {/* Preserved Screen 4: AI Recommendations */}
          {currentPage === 'ai-recommendations' && (
            <AiRecommendationsPage
              eventData={eventData}
              freelancers={freelancers}
              onNavigate={setCurrentPage}
              onViewProfile={setViewingFreelancer}
              onSelectFreelancer={handleSelectFreelancer}
              selectedIds={selectedIds}
              onShowToast={addToast}
            />
          )}

          {/* Preserved Screen 5: Assignments */}
          {currentPage === 'assignments' && (
            <AssignmentsPage
              assignments={assignments}
              onNavigate={setCurrentPage}
              onUpdateStatus={handleUpdateAssignmentStatus}
              eventData={eventData}
              onShowToast={addToast}
            />
          )}

          {/* Preserved Screen 6: Backup Crew */}
          {currentPage === 'backup-crew' && (
            <BackupCrewPage
              onNavigate={setCurrentPage}
              onViewProfile={setViewingFreelancer}
              freelancers={freelancers}
              eventId={eventData.id}
              onShowToast={addToast}
              onRosterUpdated={(swappedItem) => {
                setAssignments(prev => prev.map(a => {
                  if (a.role === swappedItem.role) {
                    return {
                      ...a,
                      freelancerName: swappedItem.primaryName,
                      avatar: swappedItem.primaryAvatar,
                      backupAssigned: swappedItem.backupName,
                    };
                  }
                  return a;
                }));
              }}
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

      {/* Interactive Event Details Modal */}
      <EventDetailsModal
        event={selectedEventModal}
        currentUser={currentUser}
        onClose={() => setSelectedEventModal(null)}
        onEditEvent={handleEditEventFromDashboard}
        onEventUpdated={handleEventUpdated}
        onEventDeleted={handleEventDeleted}
        onViewAiCrew={(evt) => {
          setEventData(evt);
          setCurrentPage('ai-recommendations');
        }}
      />

      {/* Global Interactive Notification Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
