import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  FileText, 
  Edit3, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Eye,
  Globe,
  Tag
} from 'lucide-react';
import { EventData, User, CrewAssignment } from '../types';
import { 
  updateEventStatus, 
  publishEvent, 
  deleteEvent, 
  applyForEvent 
} from '../services/api';

interface EventDetailsModalProps {
  event: EventData | null;
  currentUser: User | null;
  onClose: () => void;
  onEditEvent?: (event: EventData) => void;
  onEventUpdated?: (event: EventData) => void;
  onEventDeleted?: (eventId: string) => void;
  onViewAiCrew?: (event: EventData) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  currentUser,
  onClose,
  onEditEvent,
  onEventUpdated,
  onEventDeleted,
  onViewAiCrew,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [customFee, setCustomFee] = useState<number>(0);
  const [applying, setApplying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!event) return null;

  const isOrganizerOrAdmin = 
    currentUser?.role === 'Admin' || 
    (currentUser?.role === 'Organizer' && (!event.organizerId || event.organizerId === currentUser.id || event.organizerId?._id === currentUser.id || !currentUser.id));

  const isFreelancer = currentUser?.role === 'Freelancer';

  const roles = event.requiredRoles && event.requiredRoles.length > 0
    ? event.requiredRoles
    : ['Photographer', 'Sound Engineer', 'Event Anchor', 'Security Lead'];

  const defaultFee = Math.round(event.totalBudget / (event.crewMembersNeeded || 1));

  // Handle Freelancer Application
  const handleApply = async () => {
    setMessage(null);
    const chosenRole = selectedRole || roles[0];
    const finalFee = customFee > 0 ? customFee : defaultFee;

    setApplying(true);
    const res = await applyForEvent(event.id || event._id!, chosenRole, finalFee);
    setApplying(false);

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to submit application.' });
    }
  };

  // Handle Status Change
  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true);
    setMessage(null);
    const ok = await updateEventStatus(event.id || event._id!, newStatus);
    setStatusUpdating(false);

    if (ok) {
      const updated = { ...event, status: newStatus as any };
      onEventUpdated?.(updated);
      setMessage({ type: 'success', text: `Event status updated to ${newStatus}` });
    } else {
      setMessage({ type: 'error', text: 'Could not update status on server.' });
    }
  };

  // Handle Publish / Unpublish Toggle
  const handlePublishToggle = async () => {
    const isCurrentlyPublished = event.status === 'Published';
    const nextStatus = isCurrentlyPublished ? 'Draft' : 'Published';
    setStatusUpdating(true);
    setMessage(null);
    const ok = await publishEvent(event.id || event._id!, !isCurrentlyPublished);
    setStatusUpdating(false);

    if (ok) {
      const updated = { ...event, status: nextStatus as any };
      onEventUpdated?.(updated);
      setMessage({
        type: 'success',
        text: isCurrentlyPublished ? 'Event unpublished (saved as Draft).' : 'Event published successfully!',
      });
    } else {
      setMessage({ type: 'error', text: 'Could not toggle publish state.' });
    }
  };

  // Handle Delete with Confirmation
  const handleDelete = async () => {
    setDeleting(true);
    const ok = await deleteEvent(event.id || event._id!);
    setDeleting(false);

    if (ok) {
      onEventDeleted?.(event.id || event._id!);
      onClose();
    } else {
      setMessage({ type: 'error', text: 'Failed to delete event.' });
    }
  };

  // Status Badge Helper
  const getStatusBadge = (st?: string) => {
    switch (st) {
      case 'Published':
      case 'Confirmed':
      case 'Live':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#EAEFF8] overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Banner Header with Image */}
        <div className="relative h-48 w-full bg-[#101D4B]">
          <img
            src={event.bannerImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-1.5 ${getStatusBadge(event.status)}`}>
                {event.status || 'Published'}
              </span>
              <h2 className="text-[22px] font-black text-white tracking-tight leading-tight">
                {event.name}
              </h2>
              <p className="text-[12.5px] text-white/80">{event.type}</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-12rem)] overflow-y-auto">
          {/* Status Message */}
          {message && (
            <div className={`p-3.5 rounded-xl flex items-center gap-2.5 text-[13px] font-medium border ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Core Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFD] p-4 rounded-2xl border border-[#E2E8F0] text-center">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#8A95A5]">Date</p>
              <p className="text-[13px] font-bold text-[#101D4B] mt-0.5">{event.date}</p>
            </div>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#8A95A5]">Hours</p>
              <p className="text-[13px] font-bold text-[#101D4B] mt-0.5">
                {event.startTime || '09:00 AM'} - {event.endTime || '06:00 PM'}
              </p>
            </div>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#8A95A5]">Budget</p>
              <p className="text-[13px] font-bold text-emerald-600 mt-0.5">
                ₹{event.totalBudget?.toLocaleString('en-IN') || '25,000'}
              </p>
            </div>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#8A95A5]">Crew Needed</p>
              <p className="text-[13px] font-bold text-[#563CF0] mt-0.5">
                {event.crewMembersNeeded || 8} Members
              </p>
            </div>
          </div>

          {/* Location & Venue */}
          <div className="space-y-1">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#8A95A5]">Location & Venue</h4>
            <div className="flex items-start gap-2 text-[13.5px] text-[#101D4B]">
              <MapPin className="w-4 h-4 text-[#563CF0] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{event.venue || event.location}</p>
                {event.address && <p className="text-[12px] text-[#5F6D82]">{event.address}</p>}
                <p className="text-[12px] text-[#5F6D82]">{event.city || 'Pune'}, Maharashtra</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-1">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#8A95A5]">Event Scope & Description</h4>
              <p className="text-[13.5px] text-[#475569] leading-relaxed whitespace-pre-line bg-[#FAF5FF]/50 p-3.5 rounded-xl border border-[#F3E8FF]">
                {event.description}
              </p>
            </div>
          )}

          {/* Required Roles & Quantities */}
          <div className="space-y-2">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#8A95A5]">
              Required Crew Positions
            </h4>
            <div className="flex flex-wrap gap-2">
              {event.roleRequirements && event.roleRequirements.length > 0 ? (
                event.roleRequirements.map((r, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-[#EDE9FE] text-[#563CF0] text-[12.5px] font-bold border border-[#DDD6FE] flex items-center gap-1.5"
                  >
                    <span>{r.role}</span>
                    <span className="bg-[#563CF0] text-white text-[10.5px] px-1.5 py-0.2 rounded-md font-bold">
                      x{r.count}
                    </span>
                  </span>
                ))
              ) : (
                roles.map((r, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-[#EDE9FE] text-[#563CF0] text-[12.5px] font-semibold"
                  >
                    {r}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Technical Skills */}
          {event.requiredSkills && event.requiredSkills.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#8A95A5]">Technical Skills Needed</h4>
              <div className="flex flex-wrap gap-1.5">
                {event.requiredSkills.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-[#334155] text-[12px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {(event.specialInstructions || event.additionalRequirements) && (
            <div className="space-y-1">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#8A95A5]">Special Instructions & Rider</h4>
              <p className="text-[13px] text-[#5F6D82] bg-[#F8FAFD] p-3 rounded-xl border border-[#E2E8F0]">
                {event.specialInstructions || event.additionalRequirements}
              </p>
            </div>
          )}

          {/* Organizer Controls */}
          {isOrganizerOrAdmin && (
            <div className="pt-4 border-t border-[#F0F3F9] space-y-3">
              <h4 className="text-[13px] font-bold text-[#101D4B]">Organizer Production Controls</h4>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#5F6D82] font-medium">Status:</span>
                  <select
                    disabled={statusUpdating}
                    value={event.status || 'Published'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-[#D5DCE8] text-[12.5px] font-bold text-[#101D4B] bg-white outline-none focus:border-[#563CF0]"
                  >
                    <option value="Draft">Draft (Private)</option>
                    <option value="Published">Published (Open)</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Publish Toggle Button */}
                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={handlePublishToggle}
                  className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold border transition-colors ${
                    event.status === 'Published'
                      ? 'border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9]'
                      : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700'
                  }`}
                >
                  {event.status === 'Published' ? 'Unpublish to Draft' : 'Publish to Feed'}
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditEvent?.(event);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-white border border-[#563CF0] text-[#563CF0] hover:bg-[#F0EEFF] text-[12.5px] font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Event</span>
                </button>

                {/* View AI Recommendations */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewAiCrew?.(event);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#563CF0] text-white hover:bg-[#472FD6] text-[12.5px] font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Crew Assembly</span>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors ml-auto"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Delete Confirmation Box */}
              {showDeleteConfirm && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-3">
                  <p className="text-[13px] font-bold">
                    Are you sure you want to delete &quot;{event.name}&quot;?
                  </p>
                  <p className="text-[12px] text-red-700">
                    This will permanently cancel all associated assignments and remove this production from MongoDB.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={handleDelete}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[12px]"
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete Event'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-gray-700 font-semibold text-[12px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Freelancer Apply Section */}
          {isFreelancer && (
            <div className="pt-4 border-t border-[#F0F3F9] space-y-4">
              <h4 className="text-[14px] font-bold text-[#101D4B] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#563CF0]" />
                <span>Apply for this Event</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#101D4B] mb-1">Select Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5DCE8] text-[13px] bg-white outline-none focus:border-[#563CF0]"
                  >
                    {roles.map((r, idx) => (
                      <option key={idx} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#101D4B] mb-1">Your Proposed Fee (₹)</label>
                  <input
                    type="number"
                    value={customFee || defaultFee}
                    onChange={(e) => setCustomFee(Number(e.target.value))}
                    placeholder={`e.g. ${defaultFee}`}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5DCE8] text-[13px] outline-none focus:border-[#563CF0]"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={applying}
                onClick={handleApply}
                className="w-full py-3 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white font-bold text-[13.5px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{applying ? 'Submitting Application...' : 'Submit Application to Organizer'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;

