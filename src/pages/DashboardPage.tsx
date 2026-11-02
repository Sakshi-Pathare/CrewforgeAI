import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  MapPin, 
  ChevronRight, 
  ShieldCheck, 
  RefreshCw, 
  Database,
  Eye,
  Edit3,
  Filter,
  Layers,
  Flag
} from 'lucide-react';
import { EventData, Freelancer, PageType, User } from '../types';
import { getDashboardStats, reconnectDatabase, DashboardStats } from '../services/api';

interface DashboardPageProps {
  events: EventData[];
  freelancers: Freelancer[];
  onNavigate: (page: PageType) => void;
  onViewProfile: (freelancer: Freelancer) => void;
  onSelectEvent?: (event: EventData) => void;
  onEditEvent?: (event: EventData) => void;
  currentUser?: User | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  events,
  freelancers,
  onNavigate,
  onViewProfile,
  onSelectEvent,
  onEditEvent,
  currentUser,
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: events.length || 4,
    upcomingEvents: events.filter(e => e.status !== 'Completed' && e.status !== 'Cancelled').length || 3,
    activeEvents: events.filter(e => e.status === 'In Progress' || e.status === 'Live' || e.status === 'Confirmed').length || 2,
    completedEvents: events.filter(e => e.status === 'Completed').length || 1,
    crewRequirements: events.reduce((sum, e) => sum + (e.crewMembersNeeded || 8), 0) || 32,
    activeAssignments: 14,
    availableFreelancers: freelancers.filter(f => f.status === 'Online').length || 12,
    pendingApprovals: 2,
    confirmedCrewMembers: 12,
    totalCrewBudget: 42500,
    backupCoverage: 100,
  });

  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data.stats);
      setIsDbConnected(data.isDatabaseConnected);
      if (data.warning) {
        setWarningMessage(data.warning);
      } else {
        setWarningMessage(null);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      const res = await reconnectDatabase();
      await fetchStats();
      if (!res.isConnected) {
        if (res.database?.errorCategory === 'IP_WHITELIST_OR_FIREWALL') {
          setWarningMessage('Atlas TLS Handshake rejected: Current IP not authorized in MongoDB Atlas Network Access. Add 0.0.0.0/0 or your current IP in Atlas Network Access, then click Reconnect.');
        } else {
          setWarningMessage(res.message || 'Atlas cluster unreachable. Please verify network access.');
        }
      }
    } catch {
      await fetchStats();
    } finally {
      setIsReconnecting(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const topFreelancers = freelancers.slice(0, 4);

  // Filter events by selected status tab
  const filteredEvents = events.filter((e) => {
    if (selectedStatusFilter === 'All') return true;
    if (selectedStatusFilter === 'Published') {
      return e.status === 'Published' || e.status === 'Planning' || e.status === 'Crew Sourced';
    }
    if (selectedStatusFilter === 'In Progress') {
      return e.status === 'In Progress' || e.status === 'Live' || e.status === 'Confirmed';
    }
    return e.status === selectedStatusFilter;
  });

  // Status Badge Helper
  const getStatusBadge = (st?: string) => {
    switch (st) {
      case 'Published':
      case 'Confirmed':
      case 'Live':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Completed':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-indigo-50 text-[#563CF0] border-indigo-200';
    }
  };

  const displayName = currentUser?.name || 'Varsharani';

  return (
    <div className="max-w-[1360px] mx-auto pb-12 animate-fade-in-up space-y-7">
      {/* Database Status Alert Banner */}
      {!isDbConnected && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[13.5px] font-bold">Database Status: Local Operational Mode</p>
              <p className="text-[12px] text-amber-700/90">{warningMessage || 'Backend is disconnected from MongoDB Atlas. Operating in offline cache.'}</p>
            </div>
          </div>
          <button
            onClick={handleReconnect}
            disabled={isReconnecting}
            className="px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-[12px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
            <span>{isReconnecting ? 'Connecting...' : 'Reconnect'}</span>
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#101D4B] via-[#1B2A5E] to-[#563CF0] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7545F5]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[12px] font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#A5B4FB]" />
                <span>AI Assembly Engine Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>

              {isDbConnected ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-[12px] font-semibold border border-emerald-400/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Database: Connected (MongoDB Atlas Live)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-[12px] font-semibold border border-amber-400/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Database: Local Cache Mode</span>
                </div>
              )}
            </div>
            <h1 className="text-[30px] font-extrabold tracking-tight">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-[14.5px] text-white/80 mt-1 max-w-xl">
              You have <span className="font-semibold text-white">{stats.upcomingEvents} active productions</span> scheduled with <span className="font-semibold text-white">{stats.crewRequirements} crew slots</span> planned across events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0">
            {currentUser?.role !== 'Freelancer' && (
              <button
                onClick={() => onNavigate('create-event')}
                className="px-6 py-3 rounded-xl bg-white text-[#101D4B] hover:bg-[#F2F5FD] font-bold text-[14px] flex items-center gap-2 shadow-md transition-all"
              >
                <PlusCircle className="w-4 h-4 text-[#563CF0]" />
                <span>Create Event</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('ai-recommendations')}
              className="px-6 py-3 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white font-bold text-[14px] flex items-center gap-2 shadow-btn transition-all border border-white/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Matches</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row: 6 Core Production Metrics from MongoDB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total Events */}
        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EEFF] text-[#563CF0] flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Total Events
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              {isLoading ? '...' : stats.totalEvents}
            </div>
          </div>
        </div>

        {/* 2. Upcoming Shows */}
        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Upcoming Shows
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              {isLoading ? '...' : stats.upcomingEvents}
            </div>
          </div>
        </div>

        {/* 3. Active Productions (In Progress / Live) */}
        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Active Productions
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              {isLoading ? '...' : (stats.activeEvents ?? 2)}
            </div>
          </div>
        </div>

        {/* 4. Completed Shows */}
        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Completed Shows
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              {isLoading ? '...' : (stats.completedEvents ?? 1)}
            </div>
          </div>
        </div>

        {/* 5. Crew Requirements (Total Slots Needed) */}
        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Crew Slots Needed
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              {isLoading ? '...' : stats.crewRequirements} Slots
            </div>
          </div>
        </div>

        {/* 6. Confirmed Crew */}
        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#10B981] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Confirmed Crew
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              {isLoading ? '...' : stats.confirmedCrewMembers}
            </div>
          </div>
        </div>

        {/* 7. Available Freelancers */}
        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Talent Pool (Online)
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              {isLoading ? '...' : stats.availableFreelancers}
            </div>
          </div>
        </div>

        {/* 8. Total Crew Budget */}
        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Committed Budget
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              ₹{isLoading ? '...' : stats.totalCrewBudget.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Events Section (Left 65%) + Recommended Crew (Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Events Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header with Status Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
            <h2 className="text-[18px] font-bold text-[#101D4B]">
              Event Productions & Call Sheets
            </h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#EDF2FB] p-1 rounded-xl text-[12px] font-semibold text-[#5F6D82] overflow-x-auto max-w-full">
              {['All', 'Published', 'Draft', 'In Progress', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedStatusFilter(tab)}
                  className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    selectedStatusFilter === tab
                      ? 'bg-white text-[#563CF0] shadow-xs font-bold'
                      : 'hover:text-[#101D4B]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EAEFF8] p-8 text-center space-y-3">
                <Calendar className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="text-[16px] font-bold text-[#142653]">No events matching &quot;{selectedStatusFilter}&quot;</h3>
                <p className="text-[13px] text-[#5F6D82]">Create or adjust your status filter to inspect active productions.</p>
                {currentUser?.role !== 'Freelancer' && (
                  <button
                    onClick={() => onNavigate('create-event')}
                    className="px-4 py-2 rounded-xl bg-[#563CF0] text-white text-[13px] font-semibold inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Event</span>
                  </button>
                )}
              </div>
            ) : (
              filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={evt.bannerImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'}
                      alt={evt.name}
                      className="w-20 h-20 rounded-xl object-cover ring-1 ring-gray-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[16.5px] font-bold text-[#101D4B]">
                          {evt.name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(evt.status)}`}>
                          {evt.status || 'Published'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#F0EEFF] text-[#563CF0]">
                          {evt.type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-[#5F6D82]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#8A95A5]" />
                          {evt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#8A95A5]" />
                          {evt.venue ? `${evt.venue}, ${evt.city || 'Pune'}` : evt.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[12px] font-medium text-[#101D4B] pt-0.5">
                        <span className="text-[#563CF0] font-bold">{evt.crewMembersNeeded} crew slots</span>
                        <span>•</span>
                        <span>Budget: ₹{evt.totalBudget.toLocaleString('en-IN')}</span>
                        {evt.startTime && (
                          <>
                            <span>•</span>
                            <span className="text-[#8A95A5]">{evt.startTime} - {evt.endTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    {/* View Details / Specs */}
                    <button
                      type="button"
                      onClick={() => onSelectEvent?.(evt)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#D5DCE8] hover:bg-[#F8FAFD] text-[#101D4B] text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5F6D82]" />
                      <span>Details</span>
                    </button>

                    {/* AI Matches */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectEvent?.(evt);
                        onNavigate('ai-recommendations');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Assemble Crew</span>
                    </button>

                    {/* Edit Event (for Organizers) */}
                    {currentUser?.role !== 'Freelancer' && (
                      <button
                        type="button"
                        onClick={() => onEditEvent?.(evt)}
                        className="px-3 py-2 rounded-xl border border-[#DFE5F2] hover:bg-[#F8FAFD] text-[12px] font-semibold text-[#5F6D82] transition-colors"
                        title="Edit Event"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Featured Crew Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-[18px] font-bold text-[#101D4B]">
              Top Rated Professionals
            </h2>
            <button
              onClick={() => onNavigate('find-crew')}
              className="text-[13px] font-semibold text-[#563CF0] hover:underline"
            >
              Browse All
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card space-y-4">
            {topFreelancers.map((crew) => (
              <div
                key={crew.id}
                onClick={() => onViewProfile(crew)}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFD] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={crew.avatar}
                      alt={crew.name}
                      className="w-11 h-11 rounded-xl object-cover bg-gray-100"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                        crew.status === 'Online' ? 'bg-[#10B981]' : 'bg-[#94A3B8]'
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#101D4B] group-hover:text-[#563CF0] transition-colors">
                      {crew.name}
                    </h4>
                    <p className="text-[12px] text-[#5F6D82]">{crew.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#101D4B]">
                    ₹{crew.pricePerEvent.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-bold text-[#563CF0]">
                    {crew.matchScore}% Match
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => onNavigate('find-crew')}
              className="w-full py-2.5 mt-2 rounded-xl border border-[#DFE5F2] hover:bg-[#F0EEFF] hover:border-[#563CF0] text-[#563CF0] text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore 12+ Crew Profiles</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
