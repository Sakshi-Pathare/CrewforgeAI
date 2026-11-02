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
  CheckCircle2,
  Clock,
  Building,
  DollarSign,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  Save,
  Send
} from 'lucide-react';
import { EventData, PageType, RoleRequirement } from '../types';
import { createEvent, updateEvent } from '../services/api';

interface CreateEventPageProps {
  eventData: EventData;
  onUpdateEvent: (data: Partial<EventData>) => void;
  onNavigate: (page: PageType) => void;
  isEditing?: boolean;
}

const PRESET_BANNERS = [
  { label: 'Concert & Music', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80' },
  { label: 'College Fest', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80' },
  { label: 'Corporate Summit', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80' },
  { label: 'Stage Show', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80' },
];

const PRESET_ROLES = [
  'Photographer',
  'Sound Engineer',
  'Event Anchor',
  'Stage Lighting Tech',
  'Security Lead',
  'Videographer',
  'DJ & Audio Mixer',
  'Hospitality Manager',
  'Crowd Coordinator',
];

export const CreateEventPage: React.FC<CreateEventPageProps> = ({
  eventData,
  onUpdateEvent,
  onNavigate,
  isEditing = false,
}) => {
  // Primary Info
  const [name, setName] = useState(eventData.name || eventData.eventName || '');
  const [type, setType] = useState(eventData.type || eventData.eventType || 'College Event');
  const [description, setDescription] = useState(eventData.description || '');
  const [bannerImage, setBannerImage] = useState(
    eventData.bannerImage || PRESET_BANNERS[0].url
  );

  // Date & Time
  const [date, setDate] = useState(eventData.date || '24 October 2026');
  const [startTime, setStartTime] = useState(eventData.startTime || '09:00 AM');
  const [endTime, setEndTime] = useState(eventData.endTime || '06:00 PM');

  // Venue & Location
  const [venue, setVenue] = useState(eventData.venue || 'Shivaji Memorial Hall');
  const [address, setAddress] = useState(eventData.address || 'FC Road, Shivajinagar');
  const [city, setCity] = useState(eventData.city || 'Pune');

  // Budget
  const [totalBudget, setTotalBudget] = useState(
    eventData.totalBudget ? eventData.totalBudget.toString() : '35000'
  );

  // Roles breakdown
  const [roleBreakdown, setRoleBreakdown] = useState<RoleRequirement[]>(() => {
    if (eventData.roleRequirements && eventData.roleRequirements.length > 0) {
      return eventData.roleRequirements;
    }
    const roles = eventData.requiredRoles && eventData.requiredRoles.length > 0
      ? eventData.requiredRoles
      : ['Photographer', 'Sound Engineer', 'Event Anchor', 'Security Lead'];
    return roles.map(r => ({ role: r, count: 2, budgetPerRole: 5000 }));
  });

  const [newRoleInput, setNewRoleInput] = useState('');

  // Skills
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    eventData.requiredSkills || ['Concert Audio', 'Low-Light Photography', 'Stage Management']
  );
  const [newSkillInput, setNewSkillInput] = useState('');

  // Instructions
  const [specialInstructions, setSpecialInstructions] = useState(
    eventData.specialInstructions || eventData.additionalRequirements || ''
  );

  // Status
  const [status, setStatus] = useState<EventData['status']>(
    eventData.status || 'Published'
  );

  // Form Submission & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate total crew needed from breakdown
  const totalCrewCount = roleBreakdown.reduce((sum, r) => sum + (Number(r.count) || 1), 0);

  // Role Breakdown Handlers
  const handleAddRole = (roleToAdd: string) => {
    const trimmed = roleToAdd.trim();
    if (!trimmed) return;
    if (roleBreakdown.some(r => r.role.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(`Role "${trimmed}" is already added in the breakdown.`);
      return;
    }
    setRoleBreakdown([...roleBreakdown, { role: trimmed, count: 1, budgetPerRole: 4500 }]);
    setNewRoleInput('');
    setErrorMessage(null);
  };

  const handleRemoveRole = (index: number) => {
    setRoleBreakdown(roleBreakdown.filter((_, i) => i !== index));
  };

  const handleUpdateRoleCount = (index: number, count: number) => {
    const next = [...roleBreakdown];
    next[index].count = Math.max(1, count);
    setRoleBreakdown(next);
  };

  // Skills Handlers
  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleSubmit = async (publishImmediate = true) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validations
    if (!name.trim()) {
      setErrorMessage('Please enter an event name.');
      return;
    }
    if (!date.trim()) {
      setErrorMessage('Please enter an event date.');
      return;
    }
    const budgetNum = parseFloat(totalBudget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      setErrorMessage('Please provide a valid, positive budget.');
      return;
    }
    if (roleBreakdown.length === 0) {
      setErrorMessage('Please specify at least one required crew role.');
      return;
    }

    setIsSaving(true);
    const chosenStatus = publishImmediate ? 'Published' : 'Draft';

    const fullLocation = [venue.trim(), city.trim(), 'Maharashtra'].filter(Boolean).join(', ');
    const rolesList = roleBreakdown.map(r => r.role);

    const eventPayload: Partial<EventData> = {
      name: name.trim(),
      eventName: name.trim(),
      type,
      eventType: type,
      category: type,
      description: description.trim(),
      bannerImage,
      date: date.trim(),
      startTime,
      endTime,
      venue: venue.trim(),
      address: address.trim(),
      city: city.trim(),
      location: fullLocation,
      totalBudget: budgetNum,
      crewMembersNeeded: totalCrewCount || 8,
      requiredRoles: rolesList,
      requiredSkills,
      roleRequirements: roleBreakdown,
      additionalRequirements: specialInstructions.trim(),
      specialInstructions: specialInstructions.trim(),
      status: chosenStatus,
    };

    try {
      let savedEvent: EventData | null = null;
      if (isEditing && eventData.id) {
        savedEvent = await updateEvent(eventData.id, eventPayload);
      } else {
        savedEvent = await createEvent(eventPayload);
      }

      const finalEvent = savedEvent || { ...eventData, ...eventPayload, id: eventData.id || `evt-${Date.now()}` };
      onUpdateEvent(finalEvent);

      setSuccessMessage(
        isEditing
          ? 'Event updated successfully in MongoDB Atlas!'
          : `Event created & ${chosenStatus.toLowerCase()} successfully!`
      );

      setTimeout(() => {
        if (chosenStatus === 'Published') {
          onNavigate('ai-recommendations');
        } else {
          onNavigate('dashboard');
        }
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving event to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto pb-16 animate-in fade-in duration-150 space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#563CF0] hover:text-[#472FD6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSubmit(false)}
            className="px-5 py-2.5 rounded-xl border border-[#D5DCE8] text-[13.5px] font-semibold text-[#5F6D82] hover:bg-[#F3F5FA] transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#8A95A5]" />
            <span>Save as Draft</span>
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSubmit(true)}
            className="px-6 py-2.5 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[13.5px] font-bold shadow-btn flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : isEditing ? 'Update & Publish' : 'Publish & Match Crew'}</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-[28px] font-extrabold text-[#101D4B] tracking-tight">
          {isEditing ? 'Edit Event Details' : 'Create New Event Production'}
        </h1>
        <p className="text-[14.5px] text-[#5F6D82] mt-1">
          Configure production specs, venue schedules, crew slots, and budget to activate the AI assembly engine.
        </p>
      </div>

      {/* Success / Error Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-[13.5px] font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13.5px] font-medium flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Two-Column Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left 8 Cols: Event Specs & Requirements */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Basic Event Details */}
          <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-5">
            <h2 className="text-[16.5px] font-bold text-[#101D4B] flex items-center gap-2 pb-2 border-b border-[#F0F3F9]">
              <CalendarIcon className="w-4 h-4 text-[#563CF0]" />
              <span>Event Overview</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[13px] font-bold text-[#101D4B] mb-1.5">
                  Event Name <span className="text-[#563CF0]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Annual Inter-College Cultural Extravaganza"
                  className="w-full px-4 py-3 bg-white text-[14px] text-[#101D4B] border border-[#DFE5F2] rounded-xl focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#101D4B] mb-1.5">
                  Category / Event Type <span className="text-[#563CF0]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-[14px] text-[#101D4B] border border-[#DFE5F2] rounded-xl focus:border-[#563CF0] outline-none appearance-none cursor-pointer font-medium"
                  >
                    <option value="College Event">College Event</option>
                    <option value="Concert / Music Festival">Concert / Music Festival</option>
                    <option value="Corporate Summit">Corporate Summit</option>
                    <option value="Wedding / Reception">Wedding / Reception</option>
                    <option value="Exhibition / Trade Show">Exhibition / Trade Show</option>
                    <option value="Sports Tournament">Sports Tournament</option>
                    <option value="Fashion & Runway Show">Fashion & Runway Show</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8A95A5] absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#101D4B] mb-1.5">
                  Event Date <span className="text-[#563CF0]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="24 October 2026"
                    className="w-full px-4 py-3 bg-white text-[14px] text-[#101D4B] border border-[#DFE5F2] rounded-xl focus:border-[#563CF0] outline-none font-medium"
                  />
                  <CalendarIcon className="w-4 h-4 text-[#8A95A5] absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[13px] font-bold text-[#101D4B] mb-1.5">
                Event Description & Objective
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the theme, audience size, VIP attendees, and production scope..."
                className="w-full px-4 py-3 bg-white text-[13.5px] text-[#101D4B] border border-[#DFE5F2] rounded-xl focus:border-[#563CF0] outline-none resize-none font-normal"
              ></textarea>
            </div>
          </div>

          {/* Section 2: Venue & Schedule */}
          <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-5">
            <h2 className="text-[16.5px] font-bold text-[#101D4B] flex items-center gap-2 pb-2 border-b border-[#F0F3F9]">
              <MapPin className="w-4 h-4 text-[#563CF0]" />
              <span>Venue, Location & Schedule</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-[#101D4B] mb-1.5">
                  Start Time
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE5F2] text-[13.5px] outline-none focus:border-[#563CF0]"
                  />
                  <Clock className="w-4 h-4 text-[#8A95A5] absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#101D4B] mb-1.5">
                  End Time
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="06:00 PM"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFE5F2] text-[13.5px] outline-none focus:border-[#563CF0]"
                  />
                  <Clock className="w-4 h-4 text-[#8A95A5] absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#101D4B] mb-1.5">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Balgandharva Rangmandir Auditorium"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE5F2] text-[13.5px] outline-none focus:border-[#563CF0]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#101D4B] mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE5F2] text-[13.5px] outline-none focus:border-[#563CF0]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[13px] font-bold text-[#101D4B] mb-1.5">
                  Full Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. JM Road, Deccan Gymkhana, Shivajinagar, Pune - 411004"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFE5F2] text-[13.5px] outline-none focus:border-[#563CF0]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Crew Roles & Number of People Required */}
          <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F3F9]">
              <h2 className="text-[16.5px] font-bold text-[#101D4B] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#563CF0]" />
                <span>Crew Positions & Slots Required</span>
              </h2>
              <span className="text-[12px] font-bold text-[#563CF0] bg-[#EDE9FE] px-2.5 py-1 rounded-full">
                {totalCrewCount} Total Slots
              </span>
            </div>

            {/* List of Configured Roles with Counters */}
            <div className="space-y-3">
              {roleBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] gap-4"
                >
                  <div className="flex-1">
                    <p className="text-[13.5px] font-bold text-[#101D4B]">{item.role}</p>
                    <p className="text-[11.5px] text-[#5F6D82]">
                      Target Budget: ₹{(item.budgetPerRole || 5000).toLocaleString('en-IN')} / person
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#D5DCE8]">
                      <span className="text-[11px] font-semibold text-[#8A95A5]">Qty:</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateRoleCount(idx, item.count - 1)}
                        className="w-6 h-6 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] text-gray-700 font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-[13px] font-bold text-[#101D4B]">
                        {item.count}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateRoleCount(idx, item.count + 1)}
                        className="w-6 h-6 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] text-gray-700 font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Custom Role Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRole(newRoleInput);
                  }
                }}
                placeholder="Add custom role (e.g. Drone Pilot, Pyro Tech)..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#DFE5F2] text-[13px] outline-none focus:border-[#563CF0]"
              />
              <button
                type="button"
                onClick={() => handleAddRole(newRoleInput)}
                className="px-4 py-2.5 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[13px] font-semibold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Role</span>
              </button>
            </div>

            {/* Quick Add Presets */}
            <div>
              <p className="text-[11.5px] font-bold uppercase text-[#8A95A5] tracking-wider mb-2">
                Common Event Roles (Click to add)
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_ROLES.map((preset, i) => {
                  const exists = roleBreakdown.some(r => r.role === preset);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={exists}
                      onClick={() => handleAddRole(preset)}
                      className={`text-[12px] font-medium px-3 py-1.5 rounded-xl border transition-colors ${
                        exists
                          ? 'bg-[#F1F5F9] border-transparent text-gray-400 cursor-not-allowed'
                          : 'bg-white border-[#E2E8F0] text-[#5F6D82] hover:border-[#563CF0] hover:text-[#563CF0]'
                      }`}
                    >
                      {exists ? '✓ Added' : `+ ${preset}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Required Skills Tags */}
            <div className="pt-3 border-t border-[#F0F3F9]">
              <label className="block text-[13px] font-bold text-[#101D4B] mb-2">
                Specific Technical Skills Needed
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {requiredSkills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EDE9FE] text-[#563CF0] text-[12px] font-semibold"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:bg-white/30 rounded p-0.5"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g. Yamaha CL5 Mixing, DMX Lighting Controller, Gimbal Operation..."
                  className="flex-1 px-4 py-2 rounded-xl border border-[#DFE5F2] text-[13px] outline-none focus:border-[#563CF0]"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl bg-white border border-[#D5DCE8] hover:bg-[#F3F5FA] text-[13px] font-semibold text-[#101D4B]"
                >
                  Add Skill
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Special Instructions */}
          <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-4">
            <h2 className="text-[16.5px] font-bold text-[#101D4B] flex items-center gap-2 pb-2 border-b border-[#F0F3F9]">
              <FileText className="w-4 h-4 text-[#563CF0]" />
              <span>Special Instructions & Technical Rider</span>
            </h2>

            <textarea
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Specify call time (e.g. sound check at 7:30 AM), all-black production crew attire, backstage badge access, or parking logistics..."
              className="w-full px-4 py-3 bg-white text-[13.5px] text-[#101D4B] border border-[#DFE5F2] rounded-xl focus:border-[#563CF0] outline-none resize-none font-normal"
            ></textarea>
          </div>
        </div>

        {/* Right 4 Cols: Commercials, Banner & Publishing Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Budget & Commercial Card */}
          <div className="bg-white rounded-3xl border border-[#EAEFF8] p-6 shadow-card space-y-4">
            <h3 className="text-[15.5px] font-bold text-[#101D4B] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#563CF0]" />
              <span>Budget & Crew Payout</span>
            </h3>

            <div>
              <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                Total Crew Budget (₹) <span className="text-[#563CF0]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-[15px] font-bold text-[#8A95A5]">₹</span>
                <input
                  type="number"
                  min="0"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#DFE5F2] text-[15px] font-bold text-[#101D4B] outline-none focus:border-[#563CF0]"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-2 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-[#5F6D82]">Allocated Slots</span>
                <span className="font-bold text-[#101D4B]">{totalCrewCount} crew members</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6D82]">Avg. Payout per Person</span>
                <span className="font-bold text-[#563CF0]">
                  ₹{Math.round((parseFloat(totalBudget) || 0) / (totalCrewCount || 1)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Banner Selector Card */}
          <div className="bg-white rounded-3xl border border-[#EAEFF8] p-6 shadow-card space-y-4">
            <h3 className="text-[15.5px] font-bold text-[#101D4B] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#563CF0]" />
              <span>Event Banner Image</span>
            </h3>

            {/* Live Banner Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] aspect-video">
              <img
                src={bannerImage}
                alt="Event Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_BANNERS[0].url;
                }}
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs">
                Live Preview
              </span>
            </div>

            <div>
              <p className="text-[11.5px] font-bold uppercase text-[#8A95A5] tracking-wider mb-2">
                Choose Preset Banner
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_BANNERS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setBannerImage(preset.url)}
                    className={`p-2 rounded-xl border text-[11.5px] font-semibold text-left transition-colors truncate ${
                      bannerImage === preset.url
                        ? 'border-[#563CF0] bg-[#EDE9FE] text-[#563CF0]'
                        : 'border-[#E2E8F0] hover:bg-[#F8FAFD] text-[#5F6D82]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#101D4B] mb-1">
                Custom Banner Image URL
              </label>
              <input
                type="url"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 rounded-xl border border-[#DFE5F2] text-[12.5px] outline-none focus:border-[#563CF0]"
              />
            </div>
          </div>

          {/* Publishing Controls */}
          <div className="bg-white rounded-3xl border border-[#EAEFF8] p-6 shadow-card space-y-4">
            <h3 className="text-[15.5px] font-bold text-[#101D4B]">Publishing Status</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] cursor-pointer hover:bg-[#F8FAFD]">
                <input
                  type="radio"
                  name="statusOption"
                  checked={status === 'Published'}
                  onChange={() => setStatus('Published')}
                  className="accent-[#563CF0]"
                />
                <div>
                  <p className="text-[13px] font-bold text-[#101D4B]">Published</p>
                  <p className="text-[11px] text-[#5F6D82]">Visible to freelancers and open for AI matching</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] cursor-pointer hover:bg-[#F8FAFD]">
                <input
                  type="radio"
                  name="statusOption"
                  checked={status === 'Draft'}
                  onChange={() => setStatus('Draft')}
                  className="accent-[#563CF0]"
                />
                <div>
                  <p className="text-[13px] font-bold text-[#101D4B]">Draft</p>
                  <p className="text-[11px] text-[#5F6D82]">Hidden from crew; private organizer planning mode</p>
                </div>
              </label>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSubmit(status === 'Published')}
              className="w-full py-3.5 rounded-2xl bg-[#563CF0] hover:bg-[#472FD6] text-white font-bold text-[14px] shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Confirm & Save Event'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
