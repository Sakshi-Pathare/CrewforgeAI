import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Star, 
  Calendar as CalendarIcon, 
  Filter, 
  ChevronDown,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { Freelancer, PageType } from '../types';

interface FindCrewPageProps {
  freelancers: Freelancer[];
  onNavigate: (page: PageType) => void;
  onSelectFreelancer: (freelancer: Freelancer) => void;
  onViewProfile: (freelancer: Freelancer) => void;
  selectedIds: string[];
  searchQuery?: string;
}

export const FindCrewPage: React.FC<FindCrewPageProps> = ({
  freelancers,
  onNavigate,
  onSelectFreelancer,
  onViewProfile,
  selectedIds,
  searchQuery = '',
}) => {
  // Filter States
  const [searchName, setSearchName] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [experienceLevels, setExperienceLevels] = useState<{ [key: string]: boolean }>({
    beginner: false,
    intermediate: false,
    expert: false,
  });
  const [availability, setAvailability] = useState<{ [key: string]: boolean }>({
    onDate: true,
    now: false,
  });
  const [maxPrice, setMaxPrice] = useState(10000);
  const [ratingFilter, setRatingFilter] = useState(false);
  const [sortBy, setSortBy] = useState('Best Match');

  const handleReset = () => {
    setSearchName('');
    setSelectedRole('All');
    setExperienceLevels({ beginner: false, intermediate: false, expert: false });
    setAvailability({ onDate: true, now: false });
    setMaxPrice(10000);
    setRatingFilter(false);
    setSortBy('Best Match');
  };

  // Filtered List
  const filteredCrew = freelancers.filter((crew) => {
    // Search (from local input or top navigation)
    const activeSearch = (searchName || searchQuery).trim().toLowerCase();
    if (activeSearch) {
      const matchName = crew.name.toLowerCase().includes(activeSearch);
      const matchSkill = crew.skills.some((s) => s.toLowerCase().includes(activeSearch));
      const matchRole = crew.role.toLowerCase().includes(activeSearch);
      if (!matchName && !matchSkill && !matchRole) return false;
    }

    // Role
    if (selectedRole !== 'All' && crew.role !== selectedRole) {
      return false;
    }

    // Price
    if (crew.pricePerEvent > maxPrice) {
      return false;
    }

    // Rating
    if (ratingFilter && crew.rating < 4.0) {
      return false;
    }

    return true;
  });

  // Sort
  const sortedCrew = [...filteredCrew].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.pricePerEvent - b.pricePerEvent;
    if (sortBy === 'Price: High to Low') return b.pricePerEvent - a.pricePerEvent;
    if (sortBy === 'Highest Rated') return b.rating - a.rating;
    return (b.matchScore || 0) - (a.matchScore || 0);
  });

  return (
    <div className="max-w-[1360px] mx-auto pb-12 animate-in fade-in duration-150">
      {/* Page Header & AI Callout Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#142653] tracking-tight">
            Find Crew
          </h1>
          <p className="text-[14.5px] text-[#5F6D82] mt-1">
            Discover talented event professionals for your crew needs.
          </p>
        </div>

        {/* AI Recommendations Banner Pill */}
        <div className="bg-[#EDE9FE] border border-[#DDD6FE] rounded-2xl px-6 py-4 flex items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#563CF0] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#142653]">
                Need help finding the right crew?
              </h3>
              <p className="text-[12.5px] text-[#5F6D82] mt-0.5">
                Use our AI-powered recommendations for better matches.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ai-recommendations')}
            className="px-5 py-2.5 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[13.5px] font-semibold flex items-center gap-2 shadow-btn shrink-0 transition-all"
          >
            <span>Get AI Suggestions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Layout: Filters + Crew Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Column (3.5 cols on desktop ~280px) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#EAEFF8] p-6 shadow-card space-y-6">
          {/* Filter Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F0F3F9]">
            <h2 className="text-[16px] font-bold text-[#142653]">Filters</h2>
            <button
              onClick={handleReset}
              className="text-[13px] font-semibold text-[#563CF0] hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[13px] font-bold text-[#142653] mb-2">
              Search
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 pointer-events-none text-[#8A95A5]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Search by name or skill..."
                className="w-full pl-10 pr-3 py-2.5 bg-white text-[13px] text-[#142653] border border-[#DFE5F2] rounded-xl focus:outline-none focus:border-[#563CF0] focus:ring-1 focus:ring-[#563CF0]"
              />
            </div>
          </div>

          {/* Role / Skill */}
          <div>
            <label className="block text-[13px] font-bold text-[#142653] mb-2">
              Role / Skill
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white text-[13px] text-[#142653] border border-[#DFE5F2] rounded-xl focus:outline-none focus:border-[#563CF0] appearance-none cursor-pointer"
              >
                <option value="All">Select role</option>
                <option value="Photographer">Photographer</option>
                <option value="Sound Engineer">Sound Engineer</option>
                <option value="Event Anchor">Event Anchor</option>
                <option value="Lighting Technician">Lighting Technician</option>
                <option value="Makeup Artist">Makeup Artist</option>
                <option value="Event Manager">Event Manager</option>
                <option value="Security Lead">Security Lead</option>
                <option value="Videographer">Videographer</option>
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none text-[#8A95A5]">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-[13px] font-bold text-[#142653] mb-2.5">
              Experience Level
            </label>
            <div className="space-y-2 text-[13px] text-[#5F6D82]">
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#142653]">
                <input
                  type="checkbox"
                  checked={experienceLevels.beginner}
                  onChange={(e) => setExperienceLevels({ ...experienceLevels, beginner: e.target.checked })}
                  className="w-4 h-4 rounded text-[#563CF0] focus:ring-[#563CF0] border-gray-300"
                />
                <span>Beginner (0–1 years)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#142653]">
                <input
                  type="checkbox"
                  checked={experienceLevels.intermediate}
                  onChange={(e) => setExperienceLevels({ ...experienceLevels, intermediate: e.target.checked })}
                  className="w-4 h-4 rounded text-[#563CF0] focus:ring-[#563CF0] border-gray-300"
                />
                <span>Intermediate (1–3 years)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#142653]">
                <input
                  type="checkbox"
                  checked={experienceLevels.expert}
                  onChange={(e) => setExperienceLevels({ ...experienceLevels, expert: e.target.checked })}
                  className="w-4 h-4 rounded text-[#563CF0] focus:ring-[#563CF0] border-gray-300"
                />
                <span>Expert (3+ years)</span>
              </label>
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-[13px] font-bold text-[#142653] mb-2.5">
              Availability
            </label>
            <div className="space-y-2 text-[13px] text-[#5F6D82]">
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#142653]">
                <input
                  type="checkbox"
                  checked={availability.onDate}
                  onChange={(e) => setAvailability({ ...availability, onDate: e.target.checked })}
                  className="w-4 h-4 rounded text-[#563CF0] focus:ring-[#563CF0] border-gray-300"
                />
                <span>Available on event date</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#142653]">
                <input
                  type="checkbox"
                  checked={availability.now}
                  onChange={(e) => setAvailability({ ...availability, now: e.target.checked })}
                  className="w-4 h-4 rounded text-[#563CF0] focus:ring-[#563CF0] border-gray-300"
                />
                <span>Available now</span>
              </label>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-[#142653]">
                Price Range (per event)
              </label>
              <span className="text-[12px] font-bold text-[#563CF0]">
                Up to ₹{maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#563CF0] h-1.5 bg-[#DFE5F2] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-medium text-[#8A95A5] mt-1.5">
              <span>₹1,000</span>
              <span>₹10,000+</span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-[13px] font-bold text-[#142653] mb-2">
              Rating
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#5F6D82] hover:text-[#142653]">
              <input
                type="checkbox"
                checked={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.checked)}
                className="w-4 h-4 rounded text-[#563CF0] focus:ring-[#563CF0] border-gray-300"
              />
              <div className="flex items-center gap-1 text-[#F59E0B]">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-semibold text-[#142653]">4.0+</span>
            </label>
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={() => {}}
            className="w-full py-3 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 shadow-btn transition-all"
          >
            <Filter className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>

        {/* Right 3-Column Crew Cards Grid (9 cols on desktop) */}
        <div className="lg:col-span-9 space-y-5">
          {/* Grid Meta Header */}
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#142653]">
              Showing {sortedCrew.length} crew members
            </span>
            <div className="flex items-center gap-2 text-[13px] text-[#5F6D82]">
              <span>Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-[#DFE5F2] rounded-xl px-3 py-1.5 pr-8 text-[13px] font-semibold text-[#142653] focus:outline-none focus:border-[#563CF0] cursor-pointer appearance-none"
                >
                  <option value="Best Match">Best Match</option>
                  <option value="Highest Rated">Highest Rated</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none text-[#8A95A5]">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 3-Column Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sortedCrew.map((crew) => {
              const isSelected = selectedIds.includes(crew.id);
              // As in the screenshot: first 2 cards show "View Profile", others show "Select Crew" or if selected
              const isViewProfileDefault = crew.id === 'f-1' || crew.id === 'f-2';

              return (
                <div
                  key={crew.id}
                  className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Status Badge */}
                    <div className="flex justify-end mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          crew.status === 'Online'
                            ? 'bg-[#E8F8F0] text-[#10B981]'
                            : 'bg-[#F1F3F6] text-[#8A95A5]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            crew.status === 'Online' ? 'bg-[#10B981]' : 'bg-[#8A95A5]'
                          }`}
                        />
                        {crew.status}
                      </span>
                    </div>

                    {/* Avatar Portrait - Clickable to View Profile */}
                    <div 
                      className="flex justify-center mb-3.5 cursor-pointer"
                      onClick={() => onViewProfile(crew)}
                      title={`View ${crew.name}'s Profile`}
                    >
                      <img
                        src={crew.avatar}
                        alt={crew.name}
                        className="w-20 h-20 rounded-2xl object-cover bg-gray-100 ring-2 ring-[#F2F5FD] group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Name & Role - Clickable to View Profile */}
                    <div 
                      className="text-center mb-2 cursor-pointer"
                      onClick={() => onViewProfile(crew)}
                      title={`View ${crew.name}'s Profile`}
                    >
                      <h3 className="text-[16.5px] font-bold text-[#142653] leading-tight group-hover:text-[#563CF0] transition-colors">
                        {crew.name}
                      </h3>
                      <p className="text-[12.5px] text-[#5F6D82] font-normal mt-0.5">
                        {crew.role}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center gap-1 text-[13px] text-[#142653] font-bold mb-2">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span>{crew.rating}</span>
                      <span className="text-[#8A95A5] font-normal text-[12px]">
                        ({crew.reviewsCount} reviews)
                      </span>
                    </div>

                    {/* Price per event */}
                    <div className="text-center font-bold text-[16px] text-[#142653] mb-3">
                      ₹{crew.pricePerEvent.toLocaleString()}
                      <span className="text-[12px] font-normal text-[#5F6D82] ml-1">
                        / per event
                      </span>
                    </div>

                    {/* Skills Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
                      {crew.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F3F4F8] text-[#4B5563]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Availability Note */}
                    <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-[#5F6D82] mb-4">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#8A95A5]" />
                      <span>Available on event date</span>
                    </div>
                  </div>

                  {/* Card Bottom Action */}
                  <div>
                    {isSelected ? (
                      <button
                        onClick={() => onSelectFreelancer(crew)}
                        className="w-full py-2.5 rounded-xl bg-[#E8F8F0] border border-[#10B981]/30 text-[#10B981] font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selected for Event</span>
                      </button>
                    ) : isViewProfileDefault ? (
                      <button
                        onClick={() => onViewProfile(crew)}
                        className="w-full py-2.5 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white font-semibold text-[13px] shadow-sm transition-all"
                      >
                        View Profile
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectFreelancer(crew)}
                        className="w-full py-2.5 rounded-xl border border-[#563CF0] text-[#563CF0] hover:bg-[#F0EEFF] font-semibold text-[13px] transition-colors"
                      >
                        Select Crew
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
