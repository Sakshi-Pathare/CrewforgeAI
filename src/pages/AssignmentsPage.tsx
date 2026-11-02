import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  ShieldAlert, 
  FileCheck, 
  ExternalLink, 
  ChevronDown, 
  UserCheck, 
  Calendar,
  Radio,
  Download,
  Printer,
  Sparkles,
  PhoneCall,
  ArrowRightLeft,
  Check,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CrewAssignment, PageType, EventData, User } from '../types';
import { CallSheetModal } from '../components/CallSheetModal';
import { approveAssignment, declineAssignment } from '../services/api';

interface AssignmentsPageProps {
  assignments: CrewAssignment[];
  onNavigate: (page: PageType) => void;
  onUpdateStatus?: (id: string, newStatus: CrewAssignment['status']) => void;
  onViewProfileByName?: (name: string) => void;
  currentUser?: User | null;
  eventData?: EventData;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({
  assignments,
  onNavigate,
  onUpdateStatus,
  currentUser,
  eventData = {
    id: 'evt-101',
    name: 'Annual College Fest',
    type: 'College Event',
    date: '24 October 2026',
    location: 'Pune, Maharashtra',
    totalBudget: 25000,
    crewMembersNeeded: 8,
    requiredRoles: ['Photographer', 'Sound Engineer', 'Anchor', 'Security']
  },
  onShowToast,
}) => {
  const [assignmentList, setAssignmentList] = useState<CrewAssignment[]>(assignments);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCallSheet, setShowCallSheet] = useState(false);
  const [callingCrew, setCallingCrew] = useState<CrewAssignment | null>(null);

  useEffect(() => {
    setAssignmentList(assignments);
  }, [assignments]);

  const updateStatus = (id: string, newStatus: CrewAssignment['status']) => {
    setAssignmentList(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    onUpdateStatus?.(id, newStatus);
    onShowToast?.(
      'Status Updated',
      `Crew member status transitioned to "${newStatus}". Dispatch sheet updated.`,
      'success'
    );
  };

  const handleApprove = async (id: string, freelancerName: string, role: string) => {
    setBannerMessage(null);
    setProcessingId(id);
    try {
      const res = await approveAssignment(id);
      if (res.success) {
        const msg = res.message || `Application approved! ${freelancerName} is now confirmed as ${role}.`;
        setBannerMessage({
          type: 'success',
          text: msg,
        });
        onShowToast?.('Application Approved', msg, 'success');
        updateStatus(id, 'Confirmed');
      } else {
        const errorMsg = res.message || 'Failed to approve application on server.';
        setBannerMessage({
          type: 'error',
          text: errorMsg,
        });
        onShowToast?.('Approval Failed', errorMsg, 'error');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error connecting to assignment service.';
      setBannerMessage({
        type: 'error',
        text: errorMsg,
      });
      onShowToast?.('Approval Error', errorMsg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (id: string, freelancerName: string) => {
    setBannerMessage(null);
    setProcessingId(id);
    try {
      const res = await declineAssignment(id);
      if (res.success) {
        const msg = res.message || `Application declined for ${freelancerName}.`;
        setBannerMessage({
          type: 'success',
          text: msg,
        });
        onShowToast?.('Application Declined', msg, 'info');
        updateStatus(id, 'Declined');
      } else {
        const errorMsg = res.message || 'Failed to decline application.';
        setBannerMessage({
          type: 'error',
          text: errorMsg,
        });
        onShowToast?.('Decline Failed', errorMsg, 'error');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error connecting to assignment service.';
      setBannerMessage({
        type: 'error',
        text: errorMsg,
      });
      onShowToast?.('Decline Error', errorMsg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = filterStatus === 'All' 
    ? assignmentList 
    : assignmentList.filter(a => a.status === filterStatus);

  const totalCommitted = assignmentList.reduce((acc, a) => acc + a.fee, 0);
  const pendingCount = assignmentList.filter(a => a.status === 'Pending').length;

  return (
    <div className="max-w-[1360px] mx-auto pb-12 animate-fade-in-up space-y-7">
      {/* Alert Banner */}
      {bannerMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-[13.5px] font-medium border animate-in fade-in ${
          bannerMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {bannerMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#142653] tracking-tight">
            Assignments & Rosters
          </h1>
          <p className="text-[14.5px] text-[#5F6D82] mt-1">
            Track confirmed crew rosters, call sheets, and real-time on-site status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto self-start sm:self-auto">
          <button
            onClick={() => setShowCallSheet(true)}
            className="px-4 py-2.5 rounded-xl border border-[#563CF0] text-[#563CF0] hover:bg-[#F0EEFF] text-[13.5px] font-semibold transition-all flex items-center gap-2 btn-press"
          >
            <Radio className="w-4 h-4" />
            <span>Production Call Sheet</span>
          </button>

          <button
            onClick={() => onNavigate('find-crew')}
            className="px-5 py-2.5 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[13.5px] font-semibold shadow-btn transition-all btn-press flex items-center gap-2"
          >
            <span>+ Assign More Crew</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card crew-card-hover">
          <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
            Total Confirmed Crew
          </div>
          <div className="text-[24px] font-extrabold text-[#142653] mt-0.5 flex items-baseline gap-2">
            <span>{assignmentList.filter(a => a.status === 'Confirmed' || a.status === 'Briefed' || a.status === 'On-Site').length}</span>
            <span className="text-[14px] text-[#8A95A5] font-normal">/ {eventData.crewMembersNeeded || 8} slots</span>
          </div>
          <div className="w-full bg-[#EAEFF8] rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-[#563CF0] h-2 rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${Math.min(100, (assignmentList.filter(a => a.status === 'Confirmed' || a.status === 'Briefed' || a.status === 'On-Site').length / (eventData.crewMembersNeeded || 8)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card crew-card-hover">
          <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
            Budget Committed
          </div>
          <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
            ₹{totalCommitted.toLocaleString()}
          </div>
          <div className="text-[12px] text-[#5F6D82] mt-1">
            Of ₹{(eventData.totalBudget || 25000).toLocaleString()} allocated
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card crew-card-hover">
          <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
            Call Sheet Readiness
          </div>
          <div className="text-[24px] font-extrabold text-[#10B981] mt-0.5 flex items-center gap-2">
            <span>100%</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-[12px] text-[#5F6D82] mt-1">
            Automated backups & NDA lock active
          </div>
        </div>
      </div>

      {/* Main Roster Section */}
      <div className="bg-white rounded-3xl border border-[#EAEFF8] shadow-card overflow-hidden">
        {/* Controls bar */}
        <div className="p-4 sm:p-6 border-b border-[#EAEFF8] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAFBFD]">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Confirmed', 'Briefed', 'On-Site', 'Pending', 'Declined'].map((status) => {
              const count = status === 'All' 
                ? assignmentList.length 
                : assignmentList.filter(a => a.status === status).length;
              const isActive = filterStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all flex items-center gap-1.5 btn-press whitespace-nowrap ${
                    isActive
                      ? 'bg-[#563CF0] text-white shadow-sm'
                      : 'bg-white border border-[#EAEFF8] text-[#5F6D82] hover:bg-[#F3F5FA]'
                  }`}
                >
                  <span>{status}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#EAEFF8] text-[#5F6D82]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[13px] font-medium text-[#5F6D82]">
            Showing <strong className="text-[#142653]">{filtered.length}</strong> roster records
          </div>
        </div>

        {/* Assignments Table / List */}
        <div className="divide-y divide-[#EAEFF8]">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[#8A95A5]">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#563CF0]" />
              <div className="text-[16px] font-bold text-[#142653]">No crew members found</div>
              <div className="text-[13px] text-[#5F6D82] mt-1">Try selecting a different filter status above.</div>
            </div>
          ) : (
            filtered.map((item) => (
              <div 
                key={item.id} 
                className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-[#FAFBFD] transition-colors"
              >
                {/* Left: Crew & Role info */}
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={item.avatar}
                    alt={item.freelancerName}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-[#EAEFF8] shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[16px] sm:text-[17px] font-bold text-[#142653]">
                        {item.freelancerName}
                      </h3>
                      <span className="text-[11.5px] px-2.5 py-0.5 rounded-full font-semibold bg-[#F0EEFF] text-[#563CF0]">
                        {item.role}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[12.5px] text-[#5F6D82] mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#8A95A5]" />
                        {item.email || 'crew@forge.internal'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#8A95A5]" />
                        {item.phone || '+91 98220 12345'}
                      </span>
                      <span>•</span>
                      <span>₹{item.fee.toLocaleString()} fee</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Standby backup replacement & Status */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-8 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#EAEFF8]">
                  <div>
                    <div className="text-[11px] font-semibold text-[#8A95A5] uppercase tracking-wide mb-1">
                      Standby Backup
                    </div>
                    <div className="text-[12.5px] font-bold text-[#563CF0] flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{item.backupAssigned || 'Auto Standby'}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-[#8A95A5] uppercase tracking-wide mb-1">
                      Status & Actions
                    </div>
                    {item.status === 'Pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={processingId === item.id}
                          onClick={() => handleApprove(item.id, item.freelancerName, item.role)}
                          className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 btn-press"
                        >
                          {processingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Approve Application</span>
                        </button>
                        <button
                          type="button"
                          disabled={processingId === item.id}
                          onClick={() => handleDecline(item.id, item.freelancerName)}
                          className="px-3 py-1.5 rounded-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[12px] font-semibold transition-colors disabled:opacity-50 btn-press"
                        >
                          Decline
                        </button>
                      </div>
                    ) : item.status === 'Declined' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11.5px] font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                          Declined
                        </span>
                        <button
                          type="button"
                          disabled={processingId === item.id}
                          onClick={() => handleApprove(item.id, item.freelancerName, item.role)}
                          className="text-[11.5px] font-semibold text-[#563CF0] hover:underline"
                        >
                          Re-approve
                        </button>
                      </div>
                    ) : (
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value as any)}
                        className={`text-[12px] font-bold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none transition-all ${
                          item.status === 'Confirmed'
                            ? 'bg-[#E8F8F0] text-[#10B981] border-[#10B981]/30 hover:border-[#10B981]'
                            : item.status === 'Briefed'
                            ? 'bg-[#EFF6FF] text-[#3B82F6] border-[#3B82F6]/30 hover:border-[#3B82F6]'
                            : item.status === 'On-Site'
                            ? 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]/30 hover:border-[#D97706]'
                            : 'bg-[#F3F4F8] text-[#4B5563] border-gray-200'
                        }`}
                      >
                        <option value="Confirmed">✓ Confirmed</option>
                        <option value="Briefed">● Briefed</option>
                        <option value="On-Site">⚡ On-Site</option>
                        <option value="Completed">★ Completed</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 self-end lg:self-center">
                  <button
                    onClick={() => setCallingCrew(item)}
                    className="p-2.5 rounded-xl border border-[#DFE5F2] hover:bg-[#F0EEFF] hover:border-[#563CF0] text-[#563CF0] transition-colors btn-press"
                    title="Direct Dispatch Comms Link"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowCallSheet(true)}
                    className="px-4 py-2 rounded-xl bg-[#F0EEFF] text-[#563CF0] hover:bg-[#563CF0] hover:text-white font-semibold text-[12.5px] transition-all flex items-center gap-1.5 btn-press"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Call Sheet</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Production Call Sheet Modal */}
      {showCallSheet && (
        <CallSheetModal
          event={eventData}
          assignments={assignmentList}
          onClose={() => setShowCallSheet(false)}
        />
      )}

      {/* Simulated Live Dispatch Audio Comms Modal */}
      {callingCrew && (
        <div className="fixed inset-0 bg-[#101D4B]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-[#EAEFF8] text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-[#E8F8F0] text-[#10B981] flex items-center justify-center mx-auto mb-4 animate-live-pulse">
              <PhoneCall className="w-8 h-8" />
            </div>

            <h3 className="text-[18px] font-bold text-[#142653]">
              Direct Audio Link
            </h3>
            <p className="text-[13px] text-[#5F6D82] mt-1">
              Connecting secure radio dispatch with
            </p>
            <p className="text-[15px] font-bold text-[#563CF0] mt-1">
              {callingCrew.freelancerName} ({callingCrew.role})
            </p>

            <div className="my-5 p-3 rounded-xl bg-[#F8FAFD] border border-[#EAEFF8] text-[12px] text-[#5F6D82]">
              📻 Channel 2 Assigned • Latency: 18ms • Encryption Active
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onShowToast?.(
                    'Audio Link Established',
                    `Channel opened with ${callingCrew.freelancerName}.`,
                    'info'
                  );
                  setCallingCrew(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-[13px] transition-colors btn-press"
              >
                Connect Voice
              </button>
              <button
                onClick={() => setCallingCrew(null)}
                className="px-4 py-2.5 rounded-xl border border-[#DFE5F2] hover:bg-[#F3F5FA] text-[#5F6D82] font-semibold text-[13px] transition-colors btn-press"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
