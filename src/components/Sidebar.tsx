import React from 'react';
import { 
  Home, 
  PlusCircle, 
  Users, 
  Sparkles, 
  ClipboardList, 
  RefreshCw, 
  Calendar, 
  User, 
  LogIn,
  HelpCircle,
  X
} from 'lucide-react';
import { PageType, User as UserType } from '../types';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  pendingCount?: number;
  currentUser?: UserType | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onNavigate,
  pendingCount = 4,
  currentUser,
  isOpen = false,
  onClose
}) => {
  const navItems: { id: PageType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'create-event', label: 'Create Event', icon: PlusCircle },
    { id: 'find-crew', label: 'Find Crew', icon: Users },
    { id: 'ai-recommendations', label: 'AI Recommendations', icon: Sparkles },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'backup-crew', label: 'Backup Crew', icon: RefreshCw },
  ];

  const profilePageId: PageType = currentUser 
    ? (currentUser.role === 'Freelancer' ? 'freelancer-profile' : 'organizer-profile')
    : 'login';
  const profileLabel = currentUser 
    ? (currentUser.role === 'Freelancer' ? 'My Profile' : 'Organization') 
    : 'Sign In';
  const isProfileActive = currentPage === 'freelancer-profile' || currentPage === 'organizer-profile' || (currentPage === 'login' && !currentUser);

  const handleNavClick = (page: PageType) => {
    onNavigate(page);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0B1536]/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] sm:w-[294px] lg:w-[294px] min-w-[280px] sm:min-w-[294px] lg:min-w-[294px] h-screen bg-[#101D4B] text-white flex flex-col justify-between select-none shrink-0 border-r border-[#1B2A5E]/40 overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="pt-6 pb-5 px-6 sm:px-7 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Logo Icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#563CF0] to-[#7545F5] flex items-center justify-center shadow-lg shadow-indigo-900/40 shrink-0">
                <div className="flex -space-x-1 items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/90"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-white -translate-y-0.5"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-white/90"></span>
                </div>
              </div>
              <div>
                <div className="text-[17px] font-bold tracking-wide text-white leading-tight">
                  CREW FORGE
                </div>
                <div className="text-[11px] font-medium text-[#8F9CAE] tracking-tight">
                  AI-Powered Crew Assembly
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-[#8E9BB5] hover:text-white hover:bg-[#1B2A5E] transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 sm:px-4 py-2 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-[14.5px] transition-all duration-200 text-left btn-press ${
                    isActive
                      ? 'bg-[#563CF0] text-white shadow-md shadow-indigo-950/40 font-semibold'
                      : 'text-[#8E9BB5] hover:bg-[#182759] hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#8E9BB5]'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.id === 'assignments' && pendingCount > 0 && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#1D2F6B] text-[#93A5D4]'
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Profile / Account Nav Item */}
            <button
              onClick={() => handleNavClick(profilePageId)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-[14.5px] transition-all duration-200 text-left btn-press ${
                isProfileActive
                  ? 'bg-[#563CF0] text-white shadow-md shadow-indigo-950/40 font-semibold'
                  : 'text-[#8E9BB5] hover:bg-[#182759] hover:text-white'
              }`}
            >
              {currentUser ? (
                <User className={`w-5 h-5 shrink-0 ${isProfileActive ? 'text-white' : 'text-[#8E9BB5]'}`} />
              ) : (
                <LogIn className={`w-5 h-5 shrink-0 ${isProfileActive ? 'text-white' : 'text-[#8E9BB5]'}`} />
              )}
              <span className="flex-1">{profileLabel}</span>
              {currentUser && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#1D2F6B] text-[#A5B4FB]">
                  {currentUser.role}
                </span>
              )}
            </button>

            {/* Help Center Nav Item */}
            <button
              onClick={() => handleNavClick('help')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-[14.5px] transition-all duration-200 text-left btn-press ${
                currentPage === 'help'
                  ? 'bg-[#563CF0] text-white shadow-md shadow-indigo-950/40 font-semibold'
                  : 'text-[#8E9BB5] hover:bg-[#182759] hover:text-white'
              }`}
            >
              <HelpCircle className={`w-5 h-5 shrink-0 ${currentPage === 'help' ? 'text-white' : 'text-[#8E9BB5]'}`} />
              <span className="flex-1">Help Center</span>
            </button>
          </nav>
        </div>

        {/* Bottom Illustration & Tagline */}
        <div className="p-5 sm:p-6 m-3 sm:m-4 rounded-2xl bg-[#142358]/60 border border-[#1E306E]/40 relative overflow-hidden group">
          {/* Subtle Decorative glow */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#563CF0]/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Calendar and crew graphic */}
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-[#1E2E6B] flex items-center justify-center text-[#7545F5] border border-[#2D3E82]">
              <Calendar className="w-5 sm:w-6 h-5 sm:h-6 text-[#8B6BFF]" />
            </div>
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#563CF0] border-2 border-[#101D4B] flex items-center justify-center text-[10px] text-white font-bold">
                CF
              </div>
              <div className="w-7 h-7 rounded-full bg-[#7545F5] border-2 border-[#101D4B] flex items-center justify-center text-[10px] text-white font-bold">
                AI
              </div>
              <div className="w-7 h-7 rounded-full bg-[#3B82F6] border-2 border-[#101D4B] flex items-center justify-center text-[10px] text-white font-bold">
                ✓
              </div>
            </div>
          </div>

          <div className="text-[14px] sm:text-[15px] font-bold text-white leading-snug">
            {currentPage === 'ai-recommendations' ? (
              <>
                Smarter Matches.<br />
                <span className="text-[#A5B4FB]">Better Events.</span>
              </>
            ) : (
              <>
                Better People.<br />
                <span className="text-[#A5B4FB]">Bigger Events.</span>
              </>
            )}
          </div>

          {/* Purple bar accent */}
          <div className="w-8 h-1 bg-[#563CF0] rounded-full mt-3"></div>
        </div>
      </aside>
    </>
  );
};
