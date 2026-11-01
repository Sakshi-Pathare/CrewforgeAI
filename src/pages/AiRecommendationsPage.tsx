import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Sparkles, 
  Star, 
  Check, 
  Heart, 
  ChevronDown,
  Brain,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { EventData, Freelancer, PageType } from '../types';

interface AiRecommendationsPageProps {
  eventData: EventData;
  freelancers: Freelancer[];
  onNavigate: (page: PageType) => void;
  onViewProfile: (freelancer: Freelancer) => void;
  onSelectFreelancer: (freelancer: Freelancer) => void;
  selectedIds: string[];
}

export const AiRecommendationsPage: React.FC<AiRecommendationsPageProps> = ({
  eventData,
  freelancers,
  onNavigate,
  onViewProfile,
  onSelectFreelancer,
  selectedIds,
}) => {
  const [favorites, setFavorites] = useState<{ [id: string]: boolean }>({});
  const [sortBy, setSortBy] = useState('Match Score');

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter top matches
  const topRecommendations = freelancers
    .filter(f => (f.matchScore || 0) >= 88)
    .sort((a, b) => {
      if (sortBy === 'Match Score') return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === 'Price: Low to High') return a.pricePerEvent - b.pricePerEvent;
      return b.rating - a.rating;
    });

  return (
    <div className="max-w-[1360px] mx-auto pb-12 animate-in fade-in duration-150">
      {/* Back Link */}
      <div className="mb-3">
        <button
          onClick={() => onNavigate('create-event')}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#563CF0] hover:text-[#472FD6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event</span>
        </button>
      </div>

      {/* Page Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#142653] tracking-tight">
          AI Recommendations
        </h1>
        <p className="text-[14.5px] text-[#5F6D82] mt-1">
          We found the best crew members for your event based on your requirements.
        </p>
      </div>

      {/* Top Event Summary Card */}
      <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card mb-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Thumbnail & Name & Info */}
        <div className="flex items-center gap-4">
          <img
            src={eventData.bannerImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'}
            alt="Event thumbnail"
            className="w-16 h-16 rounded-xl object-cover ring-1 ring-gray-100 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[18px] font-bold text-[#142653]">
                {eventData.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0EEFF] text-[#563CF0]">
                {eventData.type}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-[12.5px] text-[#5F6D82]">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-[#8A95A5]" />
                {eventData.date}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8A95A5]" />
                {eventData.location}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Required Crew Roles */}
        <div className="border-t lg:border-t-0 lg:border-l lg:border-r border-[#F0F3F9] pt-3 lg:pt-0 lg:px-8 w-full lg:w-auto">
          <span className="block text-[11.5px] font-semibold text-[#8A95A5] mb-2 uppercase tracking-wide">
            Required Crew Roles
          </span>
          <div className="flex flex-wrap gap-2">
            {eventData.requiredRoles.map((role, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl text-[12px] font-semibold bg-[#F0EEFF] text-[#563CF0]"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Total Crew Needed & Budget */}
        <div className="flex items-center gap-8 shrink-0">
          <div>
            <div className="text-[11.5px] font-semibold text-[#8A95A5] uppercase tracking-wide">
              Total Crew Needed
            </div>
            <div className="flex items-center gap-1.5 font-bold text-[15px] text-[#142653] mt-0.5">
              <Users className="w-4 h-4 text-[#563CF0]" />
              <span>{eventData.crewMembersNeeded} members</span>
            </div>
          </div>
          <div>
            <div className="text-[11.5px] font-semibold text-[#8A95A5] uppercase tracking-wide">
              Budget
            </div>
            <div className="font-bold text-[17px] text-[#142653] mt-0.5">
              ₹{eventData.totalBudget.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Recommendations List + Match Score Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Recommendations Stack (8 cols ~65%) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#563CF0]" />
              <h3 className="text-[16.5px] font-bold text-[#142653]">
                Top AI Recommendations
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#5F6D82]">
              <span>Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-[#DFE5F2] rounded-xl px-3 py-1.5 pr-8 text-[13px] font-semibold text-[#142653] focus:outline-none focus:border-[#563CF0] cursor-pointer appearance-none"
                >
                  <option value="Match Score">Match Score</option>
                  <option value="Highest Rated">Highest Rated</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none text-[#8A95A5]">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Cards */}
          <div className="space-y-4">
            {topRecommendations.map((crew) => {
              const isSelected = selectedIds.includes(crew.id);
              const isFav = !!favorites[crew.id];

              return (
                <div
                  key={crew.id}
                  className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  {/* Left: Avatar + Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={crew.avatar}
                      alt={crew.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-gray-100 ring-2 ring-[#F2F5FD] shrink-0"
                    />
                    <div>
                      <h4 className="text-[17px] font-bold text-[#142653] leading-tight">
                        {crew.name}
                      </h4>
                      <p className="text-[13px] text-[#5F6D82] mt-0.5">
                        {crew.role}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-[13px]">
                        <div className="flex items-center gap-1 text-[#F59E0B] font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{crew.rating}</span>
                        </div>
                        <span className="text-[#8A95A5] text-[12px]">
                          ({crew.reviewsCount} reviews)
                        </span>
                      </div>

                      <div className="font-bold text-[15px] text-[#142653] mt-1.5">
                        ₹{crew.pricePerEvent.toLocaleString()}
                        <span className="text-[12px] font-normal text-[#5F6D82] ml-1">
                          / per event
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {crew.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-[#F3F4F8] text-[#4B5563]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Middle: AI Match Percentage & Availability */}
                  <div className="flex md:flex-col items-center md:items-center justify-between w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 gap-2 shrink-0 px-2">
                    <div className="text-center">
                      <div className="text-[24px] font-extrabold text-[#563CF0] leading-tight">
                        {crew.matchScore}%
                      </div>
                      <div className="text-[11px] font-semibold text-[#8A95A5] uppercase tracking-wide">
                        AI Match
                      </div>
                    </div>

                    <div className="flex flex-col items-end md:items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F8F0] text-[#10B981]">
                        <Check className="w-3 h-3 stroke-[3]" /> Available
                      </span>
                      <span className="text-[11px] text-[#8A95A5] flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Available on event date
                      </span>
                    </div>
                  </div>

                  {/* Right Actions: View Profile & Favorite */}
                  <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
                    <button
                      onClick={() => onViewProfile(crew)}
                      className="px-5 py-2.5 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[13px] font-semibold shadow-sm transition-all"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={(e) => toggleFavorite(crew.id, e)}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isFav
                          ? 'border-[#EF4444] text-[#EF4444] bg-[#FEE2E2]/30'
                          : 'border-[#DFE5F2] text-[#8A95A5] hover:text-[#563CF0] hover:border-[#563CF0]'
                      }`}
                      title={isFav ? "Saved to favorites" : "Save favorite"}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: AI Match Score & Explanation (4 cols ~35%) */}
        <div className="lg:col-span-4 space-y-5">
          {/* AI Match Score Gradient Panel */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#7545F5] to-[#563CF0] text-white shadow-lg shadow-indigo-950/20 relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-[17px] font-bold">AI Match Score</h3>
            </div>
            <p className="text-[12.5px] text-white/85 leading-relaxed mb-6">
              Our AI analyzes skills, experience, location and availability to find the best fit for your event.
            </p>

            {/* Circular Progress Ring */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* SVG Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#FFFFFF"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - 0.94)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[32px] font-extrabold tracking-tight">94%</span>
                </div>
              </div>
              <span className="text-[12.5px] font-semibold text-white/90 mt-2">
                Average Match Score
              </span>
            </div>
          </div>

          {/* Why AI Recommendations? White Card */}
          <div className="bg-white rounded-2xl border border-[#EAEFF8] p-6 shadow-card">
            <h4 className="text-[15px] font-bold text-[#142653] mb-4">
              Why AI Recommendations?
            </h4>
            <div className="space-y-3.5 text-[13px] text-[#5F6D82]">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#563CF0] shrink-0 mt-0.5 stroke-[3]" />
                <span>Best skill match for your event</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#563CF0] shrink-0 mt-0.5 stroke-[3]" />
                <span>Verified and trusted professionals</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#563CF0] shrink-0 mt-0.5 stroke-[3]" />
                <span>Based on real-time availability</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#563CF0] shrink-0 mt-0.5 stroke-[3]" />
                <span>Budget-friendly options</span>
              </div>
            </div>
          </div>

          {/* Need to adjust requirements Card */}
          <div className="bg-white rounded-2xl border border-[#EAEFF8] p-6 shadow-card space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F0EEFF] text-[#563CF0] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#142653]">
                  Need to adjust your requirements?
                </h4>
                <p className="text-[12px] text-[#5F6D82] mt-0.5 leading-relaxed">
                  Go back to create event or edit your details to get better matches.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('create-event')}
              className="w-full py-2.5 rounded-xl border border-[#563CF0] text-[#563CF0] hover:bg-[#F0EEFF] text-[13.5px] font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Event Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

