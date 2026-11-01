import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Tag, 
  MapPin, 
  Users, 
  FileText, 
  ChevronDown, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { EventData, PageType } from '../types';

interface CreateEventPageProps {
  eventData: EventData;
  onUpdateEvent: (data: Partial<EventData>) => void;
  onNavigate: (page: PageType) => void;
}

export const CreateEventPage: React.FC<CreateEventPageProps> = ({
  eventData,
  onUpdateEvent,
  onNavigate,
}) => {
  const [formData, setFormData] = useState({
    name: eventData.name,
    type: eventData.type,
    date: eventData.date,
    location: eventData.location,
    totalBudget: eventData.totalBudget.toString(),
    crewMembersNeeded: `${eventData.crewMembersNeeded} members`,
    requiredRoles: eventData.requiredRoles.join(', '),
    additionalRequirements: eventData.additionalRequirements || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rolesArray = formData.requiredRoles
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const membersCount = parseInt(formData.crewMembersNeeded, 10) || 8;
    const budgetNum = parseFloat(formData.totalBudget) || 25000;

    onUpdateEvent({
      name: formData.name,
      type: formData.type,
      date: formData.date,
      location: formData.location,
      totalBudget: budgetNum,
      crewMembersNeeded: membersCount,
      requiredRoles: rolesArray.length > 0 ? rolesArray : ['Photographer', 'Sound Engineer', 'Anchor', 'Security'],
      additionalRequirements: formData.additionalRequirements,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      onNavigate('ai-recommendations');
    }, 400);
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12 animate-in fade-in duration-150">
      {/* Top Back Link */}
      <div className="mb-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#563CF0] hover:text-[#472FD6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Page Title & Subtitle */}
      <div className="mb-7">
        <h1 className="text-[28px] font-bold text-[#142653] tracking-tight">
          Create New Event
        </h1>
        <p className="text-[14.5px] text-[#5F6D82] mt-1">
          Enter your event details to find the perfect crew.
        </p>
      </div>

      {/* Main Form Card Container */}
      <div className="bg-white rounded-2xl border border-[#EAEFF8] shadow-card p-8">
        {/* Card Header */}
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-11 h-11 rounded-xl bg-[#F0EEFF] text-[#563CF0] flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-[#563CF0]" />
          </div>
          <h2 className="text-[20px] font-bold text-[#142653]">
            Event Details
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two-Column Grid for Primary Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-[13.5px] font-bold text-[#142653] mb-2">
                Event Name <span className="text-[#563CF0]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-[#8A95A5]">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Annual College Fest"
                  className="w-full pl-11 pr-4 py-3 bg-white text-[14px] text-[#142653] border border-[#DFE5F2] rounded-xl focus:outline-none focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-[13.5px] font-bold text-[#142653] mb-2">
                Event Type <span className="text-[#563CF0]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-[#8A95A5]">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full pl-11 pr-10 py-3 bg-white text-[14px] text-[#142653] border border-[#DFE5F2] rounded-xl focus:outline-none focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="College Event">College Event</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Concert / Music Festival">Concert / Music Festival</option>
                  <option value="Wedding / Reception">Wedding / Reception</option>
                  <option value="Exhibition / Trade Show">Exhibition / Trade Show</option>
                  <option value="Sports Tournament">Sports Tournament</option>
                </select>
                <div className="absolute right-4 pointer-events-none text-[#8A95A5]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-[13.5px] font-bold text-[#142653] mb-2">
                Event Date <span className="text-[#563CF0]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-[#8A95A5]">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="24 October 2026"
                  className="w-full pl-11 pr-11 py-3 bg-white text-[14px] text-[#142653] border border-[#DFE5F2] rounded-xl focus:outline-none focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 transition-all font-medium"
                />
                <div className="absolute right-4 text-[#8A95A5] pointer-events-none">
                  <CalendarIcon className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[13.5px] font-bold text-[#142653] mb-2">
                Location <span className="text-[#563CF0]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-[#8A95A5]">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Pune, Maharashtra"
                  className="w-full pl-11 pr-4 py-3 bg-white text-[14px] text-[#142653] border border-[#DFE5F2] rounded-xl focus:outline-none focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* Total Budget */}
            <div>
              <label className="block text-[13.5px] font-bold text-[#142653] mb-2">
                Total Budget (₹)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none font-bold text-[15px] text-[#5F6D82]">
                  ₹
                </div>
                <input
                  type="number"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                  placeholder="25000"
                  className="w-full pl-11 pr-4 py-3 bg-white text-[14px] text-[#142653] border border-[#DFE5F2] rounded-xl focus:outline-none focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* Crew Members Needed */}
            <div>
              <label className="block text-[13.5px] font-bold text-[#142653] mb-2">
                Crew Members Needed
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-[#8A95A5]">
                  <Users className="w-4 h-4" />
                </div>
                <select
                  value={formData.crewMembersNeeded}
                  onChange={(e) => setFormData({ ...formData, crewMembersNeeded: e.target.value })}
                  className="w-full pl-11 pr-10 py-3 bg-white text-[14px] text-[#142653] border border-[#DFE5F2] rounded-xl focus:outline-none focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="4 members">4 members</option>
                  <option value="6 members">6 members</option>
                  <option value="8 members">8 members</option>
                  <option value="12 members">12 members</option>
                  <option value="15 members">15 members</option>
                  <option value="20+ members">20+ members</option>
                </select>
                <div className="absolute right-4 pointer-events-none text-[#8A95A5]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Field: Required Crew Roles */}
          <div>
            <label className="block text-[13.5px] font-bold text-[#142653] mb-2">
              Required Crew Roles
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-[#8A95A5]">
                <Users className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.requiredRoles}
                onChange={(e) => setFormData({ ...formData, requiredRoles: e.target.value })}
                placeholder="Photographer, Sound Engineer, Anchor, Security"
                className="w-full pl-11 pr-4 py-3 bg-white text-[14px] text-[#142653] border border-[#DFE5F2] rounded-xl focus:outline-none focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Full Width Field: Additional Requirements */}
          <div>
            <label className="block text-[13.5px] font-bold text-[#142653] mb-2">
              Additional Requirements
            </label>
            <div className="relative">
              <div className="absolute left-4 top-3.5 pointer-events-none text-[#8A95A5]">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={3}
                value={formData.additionalRequirements}
                onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                placeholder="Describe any special requirements..."
                className="w-full pl-11 pr-4 py-3 bg-white text-[14px] text-[#142653] placeholder-[#8A95A5] border border-[#DFE5F2] rounded-xl focus:outline-none focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-end gap-3.5 pt-4">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-7 py-3 rounded-xl border border-[#DFE5F2] hover:bg-[#F8FAFD] text-[14px] font-semibold text-[#5F6D82] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-[14px] font-semibold text-white shadow-btn flex items-center gap-2 transition-all"
            >
              <span>Save & Find Crew</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

