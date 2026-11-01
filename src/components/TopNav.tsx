import React, { useState } from 'react';
import { 
  Search, 
  HelpCircle, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { PageType } from '../types';

interface TopNavProps {
  currentPage: PageType;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate?: (page: PageType) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  searchQuery,
  onSearchChange,
  onNavigate
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getSearchPlaceholder = () => {
    switch (currentPage) {
      case 'find-crew':
        return 'Search by skill, role, or name...';
      case 'ai-recommendations':
        return 'Search recommended crew or skills...';
      case 'assignments':
        return 'Search assignments or crew members...';
      default:
        return 'Search events, crew or locations...';
    }
  };

  return (
    <header className="h-[74px] bg-white border-b border-[#EAEFF8] px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Search Input on Left */}
      <div className="relative w-[440px]">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-[#8A95A5]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={getSearchPlaceholder()}
          className="w-full pl-11 pr-4 py-2.5 bg-[#F3F5FA] hover:bg-[#EDF1F8] focus:bg-white text-[13.5px] text-[#142653] placeholder-[#8A95A5] rounded-full border border-transparent focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 transition-all outline-none"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        {/* Help Centre */}
        <button 
          onClick={() => alert("Crew Forge Help Centre\n\nNeed assistance assembling crew for your event? Our 24/7 Concierge and AI matching algorithm are active.")}
          className="flex items-center gap-2 text-[13.5px] font-medium text-[#5F6D82] hover:text-[#142653] transition-colors"
        >
          <HelpCircle className="w-[18px] h-[18px] text-[#5F6D82]" />
          <span>Help Centre</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-[#F3F5FA] text-[#5F6D82] hover:text-[#142653] transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-[#5F6D82]" />
            {/* Red Notification Dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white"></span>
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-[#EAEFF8] p-4 py-3 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F3F9]">
                <h4 className="text-[14px] font-bold text-[#142653]">Notifications</h4>
                <span className="text-[11px] font-semibold text-[#563CF0] bg-[#F0EEFF] px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="space-y-3 py-2 max-h-72 overflow-y-auto">
                <div className="flex gap-3 text-left p-2 rounded-xl hover:bg-[#F8FAFD]">
                  <div className="w-8 h-8 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#10B981] shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium text-[#142653]">Riya Deshmukh confirmed assignment</p>
                    <p className="text-[11px] text-[#8A95A5]">10 mins ago • Annual College Fest</p>
                  </div>
                </div>
                <div className="flex gap-3 text-left p-2 rounded-xl hover:bg-[#F8FAFD]">
                  <div className="w-8 h-8 rounded-full bg-[#F0EEFF] flex items-center justify-center text-[#563CF0] shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium text-[#142653]">New 98% AI Match available</p>
                    <p className="text-[11px] text-[#8A95A5]">1 hour ago • Sound Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 py-1 pr-1 rounded-full hover:bg-[#F3F5FA] transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#563CF0] to-[#7545F5] flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-[#EDE9FE]">
              V
            </div>
            <span className="text-[14px] font-semibold text-[#142653]">Varsharani</span>
            <ChevronDown className="w-4 h-4 text-[#8A95A5]" />
          </button>

          {/* User Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-[#EAEFF8] p-2 z-50">
              <div className="px-3 py-2 border-b border-[#F0F3F9]">
                <p className="text-xs font-semibold text-[#8A95A5] uppercase tracking-wider">Signed in as</p>
                <p className="text-[13.5px] font-bold text-[#142653] truncate">varsharani@eventco.in</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => { setShowProfileMenu(false); onNavigate?.('create-event'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#142653] hover:bg-[#F3F5FA]"
                >
                  <User className="w-4 h-4 text-[#5F6D82]" />
                  Organizer Profile
                </button>
                <button 
                  onClick={() => { setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#142653] hover:bg-[#F3F5FA]"
                >
                  <Settings className="w-4 h-4 text-[#5F6D82]" />
                  Settings & Preferences
                </button>
                <button 
                  onClick={() => { setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#EF4444] hover:bg-[#FEE2E2]/40"
                >
                  <LogOut className="w-4 h-4 text-[#EF4444]" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

