import React from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { EventData, Freelancer, PageType } from '../types';

interface DashboardPageProps {
  events: EventData[];
  freelancers: Freelancer[];
  onNavigate: (page: PageType) => void;
  onViewProfile: (freelancer: Freelancer) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  events,
  freelancers,
  onNavigate,
  onViewProfile,
}) => {
  const topFreelancers = freelancers.slice(0, 4);

  return (
    <div className="max-w-[1360px] mx-auto pb-12 animate-in fade-in duration-150 space-y-7">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#101D4B] via-[#1B2A5E] to-[#563CF0] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7545F5]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[12px] font-semibold mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#A5B4FB]" />
              <span>AI Assembly Engine Active</span>
            </div>
            <h1 className="text-[30px] font-extrabold tracking-tight">
              Welcome back, Varsharani! 👋
            </h1>
            <p className="text-[14.5px] text-white/80 mt-1 max-w-xl">
              You have 3 active productions scheduled this month. 8 positions are currently being matched by our recommendation engine.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('create-event')}
              className="px-6 py-3 rounded-xl bg-white text-[#101D4B] hover:bg-[#F2F5FD] font-bold text-[14px] flex items-center gap-2 shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4 text-[#563CF0]" />
              <span>Create Event</span>
            </button>
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EEFF] text-[#563CF0] flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Active Events
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              3
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#10B981] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Crew Sourced
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              24
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Avg Match Score
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              94%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
              Budget Allocated
            </div>
            <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
              ₹1,45,000
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Events (Left 65%) + Recommended Crew (Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Upcoming Events Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-[18px] font-bold text-[#142653]">
              Upcoming Events & Productions
            </h2>
            <button
              onClick={() => onNavigate('create-event')}
              className="text-[13px] font-semibold text-[#563CF0] hover:underline flex items-center gap-1"
            >
              <span>+ Add Event</span>
            </button>
          </div>

          <div className="space-y-4">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={evt.bannerImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'}
                    alt={evt.name}
                    className="w-16 h-16 rounded-xl object-cover ring-1 ring-gray-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[16.5px] font-bold text-[#142653]">
                        {evt.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0EEFF] text-[#563CF0]">
                        {evt.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-[12.5px] text-[#5F6D82]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#8A95A5]" />
                        {evt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#8A95A5]" />
                        {evt.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-[12px] font-medium text-[#142653]">
                      <span>{evt.crewMembersNeeded} crew slots</span>
                      <span>•</span>
                      <span>Budget: ₹{evt.totalBudget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button
                    onClick={() => onNavigate('ai-recommendations')}
                    className="px-4 py-2 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[12.5px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View AI Crew</span>
                  </button>
                  <button
                    onClick={() => onNavigate('create-event')}
                    className="px-3.5 py-2 rounded-xl border border-[#DFE5F2] hover:bg-[#F8FAFD] text-[12.5px] font-semibold text-[#5F6D82] transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Crew Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-[18px] font-bold text-[#142653]">
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
                    <h4 className="text-[14px] font-bold text-[#142653] group-hover:text-[#563CF0] transition-colors">
                      {crew.name}
                    </h4>
                    <p className="text-[12px] text-[#5F6D82]">{crew.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#142653]">
                    ₹{crew.pricePerEvent.toLocaleString()}
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

