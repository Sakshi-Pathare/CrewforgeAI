import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Radio, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Phone, 
  CheckCircle2, 
  Copy,
  Check
} from 'lucide-react';
import { EventData, CrewAssignment } from '../types';

interface CallSheetModalProps {
  event: EventData;
  assignments: CrewAssignment[];
  onClose: () => void;
}

export const CallSheetModal: React.FC<CallSheetModalProps> = ({
  event,
  assignments,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    const text = `
CREW FORGE — OFFICIAL PRODUCTION CALL SHEET
Event: ${event.name} (${event.type})
Date: ${event.date}
Location: ${event.location}
General Call Time: 02:00 PM IST | Soundcheck: 04:30 PM | Doors Open: 06:00 PM

ASSIGNED CREW ROSTER:
${assignments.map((a, i) => `${i + 1}. ${a.freelancerName} - ${a.role} [Status: ${a.status}] | Standby: ${a.backupAssigned || 'Auto'}`).join('\n')}

COMMUNICATIONS:
- Ch 1: Stage Operations & Safety
- Ch 2: Audio & Acoustics (Sound Engineer)
- Ch 3: Visuals, Lighting & Drone (Photo/Video)
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-[#101D4B]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl border border-[#EAEFF8] animate-fade-in-up">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#101D4B] via-[#1B2A5E] to-[#563CF0] text-white flex items-center justify-between rounded-t-3xl">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#A5B4FB] uppercase tracking-wider mb-1">
              <Radio className="w-3.5 h-3.5" />
              <span>Official Event Dispatch Run Sheet</span>
            </div>
            <h2 className="text-[22px] font-bold tracking-tight">
              {event.name} — Call Sheet
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-7 space-y-6">
          {/* Quick Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F8FAFD] border border-[#EAEFF8] text-[13px]">
            <div>
              <span className="text-[#8A95A5] block text-[11px] uppercase font-bold">Production Date</span>
              <span className="font-bold text-[#142653] flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#563CF0]" />
                {event.date}
              </span>
            </div>
            <div>
              <span className="text-[#8A95A5] block text-[11px] uppercase font-bold">Venue</span>
              <span className="font-bold text-[#142653] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#563CF0]" />
                {event.location}
              </span>
            </div>
            <div>
              <span className="text-[#8A95A5] block text-[11px] uppercase font-bold">Call Time</span>
              <span className="font-bold text-[#142653] flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                02:00 PM IST
              </span>
            </div>
            <div>
              <span className="text-[#8A95A5] block text-[11px] uppercase font-bold">Crew Roster</span>
              <span className="font-bold text-[#142653] flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-[#563CF0]" />
                {assignments.length} confirmed
              </span>
            </div>
          </div>

          {/* Radio / Channels Grid */}
          <div>
            <h4 className="text-[13px] font-bold text-[#8A95A5] uppercase tracking-wider mb-2.5">
              Radio Frequencies & Comms Roster
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#F0EEFF] border border-[#DDD6FE]">
                <div className="font-bold text-[12.5px] text-[#563CF0]">Channel 1: Stage Ops</div>
                <div className="text-[11.5px] text-[#5F6D82]">Stage Director, Security Lead & Floor Manager</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F0EEFF] border border-[#DDD6FE]">
                <div className="font-bold text-[12.5px] text-[#563CF0]">Channel 2: Audio & Mics</div>
                <div className="text-[11.5px] text-[#5F6D82]">FOH Sound Engineer, Monitor Mix & Stage Patch</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F0EEFF] border border-[#DDD6FE]">
                <div className="font-bold text-[12.5px] text-[#563CF0]">Channel 3: Visual & Broadcast</div>
                <div className="text-[11.5px] text-[#5F6D82]">Photographers, Videographers & Lighting Desk</div>
              </div>
            </div>
          </div>

          {/* Roster Table */}
          <div>
            <h4 className="text-[13px] font-bold text-[#8A95A5] uppercase tracking-wider mb-2.5">
              Crew Personnel & Status
            </h4>
            <div className="border border-[#EAEFF8] rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#F8FAFD] border-b border-[#EAEFF8] text-[11.5px] font-bold text-[#8A95A5] uppercase">
                  <tr>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Professional</th>
                    <th className="py-3 px-4">Call Time</th>
                    <th className="py-3 px-4">Standby Backup</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F3F9]">
                  {assignments.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFD]/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#142653]">{item.role}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img src={item.avatar} alt={item.freelancerName} className="w-7 h-7 rounded-lg object-cover" />
                          <span className="font-medium text-[#142653]">{item.freelancerName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#5F6D82] font-mono">02:30 PM</td>
                      <td className="py-3 px-4 text-[#563CF0] font-medium text-[12px]">{item.backupAssigned || 'Auto Standby'}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F8F0] text-[#10B981]">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[#F0F3F9] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopyText}
              className="px-4 py-2.5 rounded-xl border border-[#DFE5F2] hover:bg-[#F8FAFD] text-[13px] font-semibold text-[#142653] flex items-center gap-2 transition-colors btn-press"
            >
              {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#563CF0]" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl border border-[#DFE5F2] hover:bg-[#F8FAFD] text-[13px] font-semibold text-[#142653] flex items-center gap-2 transition-colors btn-press"
              >
                <Printer className="w-4 h-4 text-[#5F6D82]" />
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[13px] font-semibold shadow-btn transition-all btn-press"
              >
                Close Call Sheet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

