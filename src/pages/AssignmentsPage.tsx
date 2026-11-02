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
  X
} from 'lucide-react';
import { CrewAssignment, PageType, EventData } from '../types';
import { CallSheetModal } from '../components/CallSheetModal';

interface AssignmentsPageProps {
  assignments: CrewAssignment[];
  onNavigate: (page: PageType) => void;
  onUpdateStatus?: (id: string, newStatus: CrewAssignment['status']) => void;
  eventData?: EventData;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({
  assignments,
  onNavigate,
  onUpdateStatus,
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

  const filtered = filterStatus === 'All' 
    ? assignmentList 
    : assignmentList.filter(a => a.status === filterStatus);

  const totalCommitted = assignmentList.reduce((acc, a) => acc + a.fee, 0);

  return (
    <div className="max-w-[1360px] mx-auto pb-12 animate-fade-in-up space-y-7">
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
            <span>{assignmentList.length}</span>
            <span className="text-[14px] text-[#8A95A5] font-normal">/ {eventData.crewMembersNeeded || 8} slots</span>
          </div>
          <div className="w-full bg-[#EAEFF8] rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-[#563CF0] h-2 rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${Math.min(100, (assignmentList.length / (eventData.crewMembersNeeded || 8)) * 100)}%` }}
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
          <div className="text-[12px] text-[#10B981] font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Within ₹{eventData.totalBudget.toLocaleString()} allocated budget</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card crew-card-hover">
          <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
            Standby Redundancy
          </div>
          <div className="text-[24px] font-extrabold text-[#10B981] mt-0.5 flex items-center gap-2">
            <span>100% Active</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-live-pulse" />
          </div>
          <div className="text-[12px] text-[#5F6D82] mt-1">
            All positions mapped to Backup Crew pool
          </div>
        </div>
      </div>

      {/* Roster Table Card */}
      <div className="bg-white rounded-2xl border border-[#EAEFF8] shadow-card overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-[#F0F3F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[16.5px] font-bold text-[#142653]">
              {eventData.name} Roster
            </h2>
            <span className="text-[11px] font-semibold text-[#563CF0] bg-[#F0EEFF] px-2.5 py-0.5 rounded-full">
              {eventData.date}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#5F6D82]">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#F8FAFD] border border-[#DFE5F2] rounded-xl px-3 py-1.5 text-[13px] font-semibold text-[#142653] focus:outline-none focus:border-[#563CF0] cursor-pointer"
            >
              <option value="All">All Statuses ({assignmentList.length})</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Briefed">Briefed</option>
              <option value="On-Site">On-Site</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-[#F0F3F9]">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:bg-[#FBFDFF] transition-all"
            >
              {/* Crew Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={item.avatar}
                    alt={item.freelancerName}
                    className="w-13 h-13 rounded-2xl object-cover bg-gray-100 ring-2 ring-[#F2F5FD] shrink-0"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] ring-2 ring-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#142653] flex items-center gap-2">
                    <span>{item.freelancerName}</span>
                  </h3>
                  <p className="text-[12.5px] text-[#5F6D82] font-medium">
                    {item.role}
                  </p>
                  <p className="text-[11.5px] text-[#8A95A5] mt-0.5">
                    Production Date: {item.date} • Fee: ₹{item.fee.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status and Backup details */}
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-[11px] font-semibold text-[#8A95A5] uppercase tracking-wide mb-1">
                    Backup Assigned
                  </div>
                  <div className="text-[13px] font-semibold text-[#563CF0] flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{item.backupAssigned || 'Auto Standby'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-[#8A95A5] uppercase tracking-wide mb-1">
                    Live Status
                  </div>
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
          ))}
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
