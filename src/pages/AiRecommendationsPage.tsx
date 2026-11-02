import React, { useState, useEffect } from 'react';
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
  Edit3,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { EventData, Freelancer, PageType } from '../types';
import { getAiRecommendations, approveTeam } from '../services/api';

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
  const [loading, setLoading] = useState(false);
  const [teamData, setTeamData] = useState<any>(null);
  const [approvalNotice, setApprovalNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch AI & Rule-based recommendations whenever eventData changes
  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const data = await getAiRecommendations(eventData);
        if (isMounted && data) {
          setTeamData(data);
        }
      } catch (err) {
        console.error('Failed to load matching recommendations', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecommendations();
    return () => { isMounted = false; };
  }, [eventData]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApproveTeam = async () => {
    if (!teamData || !teamData.selectedTeam) return;
    setLoading(true);
    setApprovalNotice(null);
    try {
      const eventId = eventData.id || eventData._id;
      const res = await approveTeam(eventId, teamData.selectedTeam);
      if (res && res.success) {
        setApprovalNotice({
          type: 'success',
          text: res.message || 'Crew team approved! Roster and call sheet have been confirmed.',
        });
        setTimeout(() => {
          setApprovalNotice(null);
          onNavigate('assignments');
        }, 2000);
      } else {
        setApprovalNotice({
          type: 'error',
          text: res?.message || 'Failed to approve team recommendations.',
        });
      }
    } catch (err: any) {
      setApprovalNotice({
        type: 'error',
        text: err.message || 'Error communicating with team matching service.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Merge backend candidate scores with full freelancer profile list
  const candidatesList = (teamData?.selectedTeam && teamData.selectedTeam.length > 0)
    ? teamData.selectedTeam
    : freelancers;

  const sortedRecommendations = [...candidatesList].sort((a: any, b: any) => {
    if (sortBy === 'Match Score') return (b.matchScore || 90) - (a.matchScore || 90);
    if (sortBy === 'Price: Low to High') return a.pricePerEvent - b.pricePerEvent;
    return b.rating - a.rating;
  });

  const avgMatchScore = teamData?.averageMatchScore || 94;
  const committedBudget = teamData?.totalCommittedBudget || 17200;
  const remainingBudget = teamData?.budgetRemaining !== undefined ? teamData.budgetRemaining : (eventData.totalBudget - committedBudget);

  return (
    <div className="max-w-[1360px] mx-auto pb-12 animate-in fade-in duration-150">
      {/* Toast Alert Notice */}
      {approvalNotice && (
        <div className={`fixed top-20 right-8 z-50 text-white px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          approvalNotice.type === 'success' ? 'bg-[#101D4B] border-[#10B981]' : 'bg-red-900 border-red-500'
        }`}>
          {approvalNotice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-[13.5px] font-medium">{approvalNotice.text}</span>
        </div>
      )}

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#142653] tracking-tight">
            AI Recommendations
          </h1>
          <p className="text-[14.5px] text-[#5F6D82] mt-1">
            Explainable multi-criteria crew matching powered by skill, reliability, availability, and budget.
          </p>
        </div>

        {/* Organizer Final Approval Authority Button */}
        <button
          onClick={handleApproveTeam}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[13.5px] font-bold shadow-btn flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          <span>Approve & Lock In Team</span>
        </button>
      </div>

      {/* Missing Roles Warning if any role couldn't be auto-matched */}
      {teamData?.unfilledRoles && teamData.unfilledRoles.length > 0 && (
        <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-[14px]">Unfilled Positions Detected</h4>
            <div className="text-[12.5px] mt-1 space-y-1">
              {teamData.unfilledRoles.map((unfilled: any, idx: number) => (
                <p key={idx}>
                  • <span className="font-semibold">{unfilled.role}:</span> {unfilled.reason}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

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

        {/* Right: Total Crew Needed & Budget Status */}
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
              Budget Status
            </div>
            <div className="font-bold text-[17px] text-[#142653] mt-0.5">
              ₹{eventData.totalBudget.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#10B981] font-semibold mt-0.5">
              ₹{committedBudget.toLocaleString()} allocated ({remainingBudget >= 0 ? `₹${remainingBudget.toLocaleString()} left` : 'over budget'})
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
                Top AI Recommendations ({sortedRecommendations.length})
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
            {sortedRecommendations.map((crew: any) => {
              const crewId = crew.freelancerId || crew.id;
              const isSelected = selectedIds.includes(crewId);
              const isFav = !!favorites[crewId];

              return (
                <div
                  key={crewId}
                  className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  {/* Left: Avatar + Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={crew.avatar}
                      alt={crew.name}
                      onClick={() => onViewProfile(crew)}
                      className="w-20 h-20 rounded-2xl object-cover bg-gray-100 ring-2 ring-[#F2F5FD] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                      title="Click to view full profile"
                    />
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 
                          onClick={() => onViewProfile(crew)}
                          className="text-[17px] font-bold text-[#142653] leading-tight hover:text-[#563CF0] cursor-pointer transition-colors"
                        >
                          {crew.name}
                        </h4>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981] bg-[#E8F8F0] px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#5F6D82] mt-0.5">
                        {crew.assignedRole || crew.role}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-[13px]">
                        <div className="flex items-center gap-1 text-[#F59E0B] font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{crew.rating}</span>
                        </div>
                        <span className="text-[#8A95A5] text-[12px]">
                          ({crew.reviewsCount || 45} reviews)
                        </span>
                      </div>

                      <div className="font-bold text-[15px] text-[#142653] mt-1.5">
                        ₹{crew.pricePerEvent.toLocaleString()}
                        <span className="text-[12px] font-normal text-[#5F6D82] ml-1">
                          / per event
                        </span>
                      </div>

                      {/* Matching Explanation Snippet */}
                      {crew.explanation && (
                        <p className="text-[12px] text-[#563CF0] bg-[#F0EEFF] px-2.5 py-1 rounded-lg mt-2 max-w-lg leading-relaxed">
                          💡 <span className="font-semibold">Why Selected:</span> {crew.explanation}
                        </p>
                      )}

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {crew.skills.map((skill: string, i: number) => (
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
                      onClick={(e) => toggleFavorite(crewId, e)}
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
          {/* AI Match Score Gradient Panel with Dynamic Ring */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#7545F5] to-[#563CF0] text-white shadow-lg shadow-indigo-950/20 relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-[17px] font-bold">AI Match Score</h3>
            </div>
            <p className="text-[12.5px] text-white/85 leading-relaxed mb-6">
              Our 5-factor engine evaluates skill match (30%), real-time availability (25%), past reliability (20%), budget fit (15%), and location (10%).
            </p>

            {/* Circular Progress Ring calculating exact percentage */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
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
                    strokeDashoffset={2 * Math.PI * 52 * (1 - (avgMatchScore / 100))}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[32px] font-extrabold tracking-tight">{avgMatchScore}%</span>
                </div>
              </div>
              <span className="text-[12.5px] font-semibold text-white/90 mt-2">
                Average Team Match Score
              </span>
            </div>
          </div>

          {/* Explainable Evaluation Criteria Card */}
          <div className="bg-white rounded-2xl border border-[#EAEFF8] p-6 shadow-card">
            <h4 className="text-[15px] font-bold text-[#142653] mb-4">
              Configurable Scoring Weights
            </h4>
            <div className="space-y-3 text-[13px] text-[#5F6D82]">
              <div className="flex items-center justify-between">
                <span>1. Skill & Role Match</span>
                <span className="font-bold text-[#563CF0]">30%</span>
              </div>
              <div className="w-full bg-[#EAEFF8] h-1.5 rounded-full">
                <div className="bg-[#563CF0] h-1.5 rounded-full w-[30%]"></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span>2. Event Date Availability</span>
                <span className="font-bold text-[#10B981]">25%</span>
              </div>
              <div className="w-full bg-[#EAEFF8] h-1.5 rounded-full">
                <div className="bg-[#10B981] h-1.5 rounded-full w-[25%]"></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span>3. Experience & Reliability</span>
                <span className="font-bold text-[#3B82F6]">20%</span>
              </div>
              <div className="w-full bg-[#EAEFF8] h-1.5 rounded-full">
                <div className="bg-[#3B82F6] h-1.5 rounded-full w-[20%]"></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span>4. Budget Suitability</span>
                <span className="font-bold text-[#F59E0B]">15%</span>
              </div>
              <div className="w-full bg-[#EAEFF8] h-1.5 rounded-full">
                <div className="bg-[#F59E0B] h-1.5 rounded-full w-[15%]"></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span>5. Location Proximity</span>
                <span className="font-bold text-[#8B5CF6]">10%</span>
              </div>
              <div className="w-full bg-[#EAEFF8] h-1.5 rounded-full">
                <div className="bg-[#8B5CF6] h-1.5 rounded-full w-[10%]"></div>
              </div>
            </div>
          </div>

          {/* Adjust Requirements Card */}
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
                  Modify roles, dates, or budget parameters to recalculate matched crew.
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
