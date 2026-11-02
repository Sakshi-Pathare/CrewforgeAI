import React from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  PhoneCall, 
  Mail, 
  Sparkles 
} from 'lucide-react';
import { Freelancer } from '../types';

interface ProfileModalProps {
  freelancer: Freelancer | null;
  onClose: () => void;
  onSelect: (freelancer: Freelancer) => void;
  isSelected?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  freelancer,
  onClose,
  onSelect,
  isSelected = false
}) => {
  if (!freelancer) return null;

  return (
    <div className="fixed inset-0 bg-navy-heading/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EAEFF8] animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="relative h-32 bg-gradient-to-r from-[#101D4B] via-[#1D2F6B] to-[#563CF0] p-6 flex justify-end items-start rounded-t-3xl">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          {/* Avatar and Top Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 mb-6 gap-4">
            <div className="relative">
              <img
                src={freelancer.avatar}
                alt={freelancer.name}
                className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white shadow-lg bg-gray-100"
              />
              <span className={`absolute bottom-2 right-2 w-4 h-4 rounded-full ring-2 ring-white ${
                freelancer.status === 'Online' ? 'bg-[#10B981]' : 'bg-[#94A3B8]'
              }`} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onSelect(freelancer);
                  onClose();
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold text-[14px] transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#E8F8F0] text-[#10B981] border border-[#10B981]/40'
                    : 'bg-[#563CF0] text-white hover:bg-[#472FD6] shadow-md shadow-indigo-500/20'
                }`}
              >
                {isSelected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Selected for Event
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Select This Crew
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Name & Basic details */}
          <div className="border-b border-[#F0F3F9] pb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-[#142653]">{freelancer.name}</h2>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#10B981] bg-[#E8F8F0] px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Pro
              </span>
            </div>
            <p className="text-[15px] font-medium text-[#5F6D82] mt-0.5">{freelancer.role}</p>

            <div className="flex flex-wrap items-center gap-5 mt-3 text-[13.5px] text-[#5F6D82]">
              <div className="flex items-center gap-1 text-[#F59E0B] font-semibold">
                <Star className="w-4 h-4 fill-current" />
                <span>{freelancer.rating}</span>
                <span className="text-[#8A95A5] font-normal">({freelancer.reviewsCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#8A95A5]" />
                <span>{freelancer.location || 'Pune, Maharashtra'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#10B981] font-medium">
                <Calendar className="w-4 h-4" />
                <span>Available for event date</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 py-6 border-b border-[#F0F3F9]">
            <div className="bg-[#F8FAFD] p-3.5 rounded-2xl border border-[#EAEFF8] text-center">
              <div className="text-[12px] font-medium text-[#8A95A5]">Rate / Event</div>
              <div className="text-[18px] font-bold text-[#142653] mt-0.5">₹{freelancer.pricePerEvent.toLocaleString()}</div>
            </div>
            <div className="bg-[#F8FAFD] p-3.5 rounded-2xl border border-[#EAEFF8] text-center">
              <div className="text-[12px] font-medium text-[#8A95A5]">Experience</div>
              <div className="text-[18px] font-bold text-[#142653] mt-0.5">{freelancer.experienceYears || 4}+ Years</div>
            </div>
            <div className="bg-[#F8FAFD] p-3.5 rounded-2xl border border-[#EAEFF8] text-center">
              <div className="text-[12px] font-medium text-[#8A95A5]">Events Done</div>
              <div className="text-[18px] font-bold text-[#142653] mt-0.5">{freelancer.completedEvents || 45}+ Shows</div>
            </div>
          </div>

          {/* Bio */}
          <div className="py-5 border-b border-[#F0F3F9]">
            <h3 className="text-[14px] font-bold text-[#142653] mb-2">About Professional</h3>
            <p className="text-[13.5px] text-[#5F6D82] leading-relaxed">
              {freelancer.bio || `${freelancer.name} is a seasoned event professional with demonstrated success handling stage performances, campus festivals, and high-visibility live productions across western India.`}
            </p>
          </div>

          {/* Skills */}
          <div className="pt-5">
            <h3 className="text-[14px] font-bold text-[#142653] mb-3">Core Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold bg-[#F0EEFF] text-[#563CF0]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

