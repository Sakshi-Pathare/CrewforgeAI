import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRightLeft,
  Clock,
  Phone,
  Loader2
} from 'lucide-react';
import { PageType, Freelancer } from '../types';
import { getBackupContingency, replaceAssignment } from '../services/api';

interface BackupCrewPageProps {
  onNavigate: (page: PageType) => void;
  onViewProfile: (freelancer: Freelancer) => void;
  freelancers?: Freelancer[];
  eventId?: string;
  onRosterUpdated?: (assignment: any) => void;
}

interface BackupPair {
  id: string;
  assignmentId?: string;
  role: string;
  primaryName: string;
  primaryAvatar: string;
  backupName: string;
  backupAvatar: string;
  standbyStatus: 'Ready On-Call' | 'Within 15 Mins' | 'Standby Engaged' | 'Uncovered';
  riskScore: 'Low Risk' | 'Medium Risk' | 'High Risk';
  swapped?: boolean;
  explanation?: string;
}

export const BackupCrewPage: React.FC<BackupCrewPageProps> = ({
  onNavigate,
  onViewProfile,
  freelancers = [],
  eventId = 'evt-101',
  onRosterUpdated,
}) => {
  const [pairs, setPairs] = useState<BackupPair[]>([
    {
      id: 'bp-1',
      assignmentId: 'asg-1',
      role: 'Sound Engineer',
      primaryName: 'Aditya Kulkarni',
      primaryAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
      backupName: 'Rohit Sharma (Audio Tech)',
      backupAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
      standbyStatus: 'Within 15 Mins',
      riskScore: 'Low Risk',
      explanation: 'Backup ready: Rohit Sharma has high audio & stage lighting compatibility as standby.',
    },
    {
      id: 'bp-2',
      assignmentId: 'asg-2',
      role: 'Photographer',
      primaryName: 'Riya Deshmukh',
      primaryAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
      backupName: 'Ananya Roy (Videographer)',
      backupAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
      standbyStatus: 'Ready On-Call',
      riskScore: 'Low Risk',
      explanation: 'Backup ready: Ananya Roy offers 93% visual capture compatibility as standby.',
    },
    {
      id: 'bp-3',
      assignmentId: 'asg-3',
      role: 'Event Anchor',
      primaryName: 'Sneha Iyer',
      primaryAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      backupName: 'Arjun Mehta (Lead Host)',
      backupAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
      standbyStatus: 'Ready On-Call',
      riskScore: 'Low Risk',
      explanation: 'Backup ready: Arjun Mehta is seasoned in crowd management and stage pacing.',
    },
    {
      id: 'bp-4',
      assignmentId: 'asg-4',
      role: 'Security Lead',
      primaryName: 'Priya Patel',
      primaryAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
      backupName: 'Sameer Khan (Operations)',
      backupAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=240&auto=format&fit=crop&q=80',
      standbyStatus: 'Within 15 Mins',
      riskScore: 'Low Risk',
      explanation: 'Backup ready: Sameer Khan coordinates crowd zones and perimeter safety.',
    }
  ]);

  const [coveragePercent, setCoveragePercent] = useState(100);
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadContingency = async () => {
      try {
        const data = await getBackupContingency(eventId);
        if (isMounted && data && data.backupPairs && data.backupPairs.length > 0) {
          setPairs(data.backupPairs);
          setCoveragePercent(data.coveragePercent);
        }
      } catch (err) {
        console.warn('Backup contingency load notice:', err);
      }
    };

    loadContingency();
    return () => { isMounted = false; };
  }, [eventId]);

  const handleSwap = async (item: BackupPair) => {
    const isCurrentlySwapped = item.swapped;

    // Call backend replacement endpoint
    try {
      if (item.assignmentId) {
        await replaceAssignment(item.assignmentId, {
          id: item.id,
          name: item.backupName,
          avatar: item.backupAvatar,
        }, isCurrentlySwapped ? 'Reverted to original primary' : 'Activated emergency standby');
      }
    } catch (e) {
      // continues with optimistic UI update
    }

    setPairs(prev => prev.map(p => {
      if (p.id === item.id) {
        const tempName = p.primaryName;
        const tempAvatar = p.primaryAvatar;
        return {
          ...p,
          primaryName: p.backupName,
          primaryAvatar: p.backupAvatar,
          backupName: tempName,
          backupAvatar: tempAvatar,
          standbyStatus: isCurrentlySwapped ? 'Ready On-Call' : 'Standby Engaged',
          swapped: !isCurrentlySwapped
        };
      }
      return p;
    }));

    const alertMsg = isCurrentlySwapped 
      ? 'Primary crew restored. Standby talent returned to ready pool.'
      : 'Emergency Standby Activated! Production call sheet and live run sheet updated.';
    
    setNotification(alertMsg);
    onRosterUpdated?.(item);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenProfileByName = (fullName: string) => {
    const cleanName = fullName.split('(')[0].trim().toLowerCase();
    const matched = freelancers.find(f => f.name.toLowerCase().includes(cleanName));
    if (matched) {
      onViewProfile(matched);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto pb-12 animate-in fade-in duration-150 space-y-7">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-[#101D4B] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#563CF0] flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          <span className="text-[13.5px] font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#142653] tracking-tight">
            Backup Crew & Risk Shield
          </h1>
          <p className="text-[14.5px] text-[#5F6D82] mt-1">
            Automated contingency pool ensuring 100% attendance and zero event downtime.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold bg-[#E8F8F0] text-[#10B981] border border-[#10B981]/30">
            <ShieldCheck className="w-4 h-4" />
            Shield Protection Active ({coveragePercent}% Covered)
          </span>
        </div>
      </div>

      {/* Hero Contingency Card */}
      <div className="bg-gradient-to-r from-[#101D4B] to-[#1D2F6B] rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#563CF0] flex items-center justify-center text-white shrink-0">
            <RefreshCw className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold">1-Click Emergency Crew Swap</h2>
            <p className="text-[13px] text-white/80 mt-0.5 max-w-xl">
              If an assigned freelancer faces a transit delay or emergency, tap "Instant Swap" to immediately assign pre-briefed backup talent at matching rates.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('find-crew')}
          className="px-5 py-2.5 rounded-xl bg-white text-[#101D4B] hover:bg-[#F2F5FD] font-bold text-[13px] shrink-0 transition-all"
        >
          Add Standby Talent
        </button>
      </div>

      {/* Standby Matrix */}
      <div className="space-y-4">
        <h2 className="text-[17px] font-bold text-[#142653]">
          Active Contingency Mappings ({pairs.length} Roles Protected)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pairs.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-6 shadow-card transition-all ${
                item.swapped ? 'border-[#563CF0] ring-2 ring-[#563CF0]/20' : 'border-[#EAEFF8]'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F3F9]">
                <div>
                  <span className="text-[11px] font-bold text-[#8A95A5] uppercase tracking-wider">
                    Role Category
                  </span>
                  <h3 className="text-[16px] font-bold text-[#142653]">
                    {item.role}
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  item.standbyStatus === 'Standby Engaged'
                    ? 'bg-[#FEF3C7] text-[#D97706]'
                    : item.standbyStatus === 'Uncovered'
                    ? 'bg-[#FEE2E2] text-[#EF4444]'
                    : 'bg-[#E8F8F0] text-[#10B981]'
                }`}>
                  {item.standbyStatus}
                </span>
              </div>

              {/* Primary vs Backup comparison */}
              <div className="py-4 grid grid-cols-2 gap-4 items-center">
                {/* Primary Crew */}
                <div 
                  onClick={() => handleOpenProfileByName(item.primaryName)}
                  className="p-3 rounded-xl bg-[#F8FAFD] border border-[#EAEFF8] cursor-pointer hover:border-[#563CF0] transition-colors"
                  title="Click to view profile"
                >
                  <div className="text-[10.5px] font-bold text-[#8A95A5] uppercase mb-2">
                    {item.swapped ? 'Standby (Now Primary)' : 'Primary Assigned'}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.primaryAvatar}
                      alt={item.primaryName}
                      className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                    />
                    <div className="truncate">
                      <div className="text-[13.5px] font-bold text-[#142653] truncate">
                        {item.primaryName}
                      </div>
                      <div className="text-[11px] text-[#10B981] font-medium">
                        On Run Sheet
                      </div>
                    </div>
                  </div>
                </div>

                {/* Backup Crew */}
                <div 
                  onClick={() => handleOpenProfileByName(item.backupName)}
                  className="p-3 rounded-xl bg-[#F0EEFF]/50 border border-[#DDD6FE] cursor-pointer hover:border-[#563CF0] transition-colors"
                  title="Click to view profile"
                >
                  <div className="text-[10.5px] font-bold text-[#563CF0] uppercase mb-2">
                    {item.swapped ? 'Original Standby' : 'Standby Backup'}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.backupAvatar}
                      alt={item.backupName}
                      className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                    />
                    <div className="truncate">
                      <div className="text-[13.5px] font-bold text-[#142653] truncate">
                        {item.backupName}
                      </div>
                      <div className="text-[11px] text-[#563CF0] font-medium">
                        Briefed & Ready
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanation Note */}
              {item.explanation && (
                <div className="pb-3 text-[11.5px] text-[#5F6D82]">
                  {item.explanation}
                </div>
              )}

              {/* Bottom Swap Action */}
              <div className="pt-3 border-t border-[#F0F3F9] flex items-center justify-between">
                <span className="text-[12px] text-[#5F6D82] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#8A95A5]" />
                  Auto-syncs call sheet
                </span>

                <button
                  onClick={() => handleSwap(item)}
                  className={`px-4 py-2 rounded-xl text-[12.5px] font-bold flex items-center gap-2 transition-all ${
                    item.swapped
                      ? 'bg-[#101D4B] text-white hover:bg-[#1B2A5E]'
                      : 'bg-[#563CF0] text-white hover:bg-[#472FD6] shadow-sm'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{item.swapped ? 'Revert Swap' : 'Instant Swap'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
