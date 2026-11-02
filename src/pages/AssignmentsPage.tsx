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
  Check,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CrewAssignment, PageType, Freelancer, User } from '../types';
import { approveAssignment, declineAssignment } from '../services/api';

interface AssignmentsPageProps {
  assignments: CrewAssignment[];
  onNavigate: (page: PageType) => void;
  onUpdateStatus?: (id: string, newStatus: CrewAssignment['status']) => void;
  onViewProfileByName?: (name: string) => void;
  currentUser?: User | null;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({
  assignments,
  onNavigate,
  onUpdateStatus,
  currentUser,
}) => {
  const [assignmentList, setAssignmentList] = useState<CrewAssignment[]>(assignments);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setAssignmentList(assignments);
  }, [assignments]);

  const updateStatus = (id: string, newStatus: CrewAssignment['status']) => {
    setAssignmentList(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    onUpdateStatus?.(id, newStatus);
  };

  const handleApprove = async (id: string, freelancerName: string, role: string) => {
    setBannerMessage(null);
    setProcessingId(id);
    try {
      const res = await approveAssignment(id);
      if (res.success) {
        setBannerMessage({
          type: 'success',
          text: res.message || `Application approved! ${freelancerName} is now confirmed as ${role}.`,
        });
        updateStatus(id, 'Confirmed');
      } else {
        setBannerMessage({
          type: 'error',
          text: res.message || 'Failed to approve application on server.',
        });
      }
    } catch (err: any) {
      setBannerMessage({
        type: 'error',
        text: err.message || 'Error connecting to assignment service.',
      });
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
        setBannerMessage({
          type: 'success',
          text: res.message || `Application declined for ${freelancerName}.`,
        });
        updateStatus(id, 'Declined');
      } else {
        setBannerMessage({
          type: 'error',
          text: res.message || 'Failed to decline application.',
        });
      }
    } catch (err: any) {
      setBannerMessage({
        type: 'error',
        text: err.message || 'Error connecting to assignment service.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = filterStatus === 'All' 
    ? assignmentList 
    : assignmentList.filter(a => a.status === filterStatus);

  const totalCommitted = assignmentList.reduce((acc, a) => acc + a.fee, 0);

  return (
    <div className="max-w-[1360px] mx-auto pb-12 animate-in fade-in duration-150 space-y-7">
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
            Track confirmed crew rosters, call sheets, and contractual status.
          </p>
        </div>

        <button
          onClick={() => onNavigate('find-crew')}
          className="px-5 py-2.5 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[13.5px] font-semibold shadow-btn transition-all self-start sm:self-auto"
        >
          + Assign More Crew
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card">
          <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
            Total Confirmed Crew
          </div>
          <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
            {assignmentList.length} / 8 slots
          </div>
          <div className="w-full bg-[#EAEFF8] rounded-full h-1.5 mt-3">
            <div className="bg-[#563CF0] h-1.5 rounded-full" style={{ width: `${Math.min(100, (assignmentList.length / 8) * 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card">
          <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
            Budget Committed
          </div>
          <div className="text-[24px] font-extrabold text-[#142653] mt-0.5">
            ₹{totalCommitted.toLocaleString()}
          </div>
          <div className="text-[12px] text-[#10B981] font-semibold mt-1">
            Within ₹25,000 allocated budget
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAEFF8] p-5 shadow-card">
          <div className="text-[12px] font-bold text-[#8A95A5] uppercase tracking-wider">
            Standby Redundancy
          </div>
          <div className="text-[24px] font-extrabold text-[#10B981] mt-0.5">
            100% Backed Up
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
              Annual College Fest Roster
            </h2>
            <span className="text-[11px] font-semibold text-[#563CF0] bg-[#F0EEFF] px-2.5 py-0.5 rounded-full">
              24 Oct 2026
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#5F6D82]">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#F8FAFD] border border-[#DFE5F2] rounded-xl px-3 py-1.5 text-[13px] font-semibold text-[#142653] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Approval</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Briefed">Briefed</option>
              <option value="On-Site">On-Site</option>
              <option value="Completed">Completed</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-[#F0F3F9]">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-[#5F6D82]">
              <p className="text-[15px] font-medium">No crew assigned for this status yet.</p>
              <button
                onClick={() => onNavigate('find-crew')}
                className="mt-3 px-5 py-2 rounded-xl bg-[#563CF0] text-white text-[13px] font-semibold"
              >
                Find & Assign Crew
              </button>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:bg-[#FBFDFF] transition-colors"
              >
                {/* Crew Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={item.avatar}
                    alt={item.freelancerName}
                    className="w-13 h-13 rounded-2xl object-cover bg-gray-100 ring-2 ring-[#F2F5FD] shrink-0"
                  />
                  <div>
                    <h3 className="text-[16px] font-bold text-[#142653]">
                      {item.freelancerName}
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
                      Status & Actions
                    </div>
                    {item.status === 'Pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={processingId === item.id}
                          onClick={() => handleApprove(item.id, item.freelancerName, item.role)}
                          className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
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
                          className="px-3 py-1.5 rounded-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[12px] font-semibold transition-colors disabled:opacity-50"
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
                        className={`text-[12px] font-bold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none ${
                          item.status === 'Confirmed'
                            ? 'bg-[#E8F8F0] text-[#10B981] border-[#10B981]/30'
                            : item.status === 'Briefed'
                            ? 'bg-[#EFF6FF] text-[#3B82F6] border-[#3B82F6]/30'
                            : item.status === 'On-Site'
                            ? 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]/30'
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
                    onClick={() => alert(`Calling ${item.freelancerName}... Connected with Crew Forge Dispatch.`)}
                    className="p-2.5 rounded-xl border border-[#DFE5F2] hover:bg-[#F0EEFF] hover:border-[#563CF0] text-[#563CF0] transition-colors"
                    title="Direct Phone Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => alert(`Opening NDA & Contract brief for ${item.freelancerName}.`)}
                    className="px-4 py-2 rounded-xl bg-[#F0EEFF] text-[#563CF0] hover:bg-[#563CF0] hover:text-white font-semibold text-[12.5px] transition-all flex items-center gap-1.5"
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
    </div>
  );
};
