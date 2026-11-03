import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  HelpCircle, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Check,
  Menu,
  X,
  Users,
  Calendar as CalendarIcon,
  Star,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { PageType, User as UserType, Freelancer, EventData, CrewAssignment } from '../types';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  InAppNotification,
} from '../services/api';

interface TopNavProps {
  currentPage: PageType;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate?: (page: PageType) => void;
  currentUser?: UserType | null;
  onLogout?: () => void;
  onOpenMobileMenu?: () => void;
  freelancers?: Freelancer[];
  events?: EventData[];
  assignments?: CrewAssignment[];
  onViewFreelancer?: (freelancer: Freelancer) => void;
  onSelectEvent?: (event: EventData) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  searchQuery,
  onSearchChange,
  onNavigate,
  currentUser,
  onLogout,
  onOpenMobileMenu,
  freelancers = [],
  events = [],
  assignments = [],
  onViewFreelancer,
  onSelectEvent
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(target) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(target))
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const queryTrimmed = searchQuery.trim().toLowerCase();

  const matchingFreelancers = queryTrimmed
    ? freelancers.filter(f =>
        f.name.toLowerCase().includes(queryTrimmed) ||
        f.role.toLowerCase().includes(queryTrimmed) ||
        (f.skills && f.skills.some(s => s.toLowerCase().includes(queryTrimmed))) ||
        (f.location && f.location.toLowerCase().includes(queryTrimmed))
      ).slice(0, 4)
    : [];

  const matchingEvents = queryTrimmed
    ? events.filter(e =>
        e.name.toLowerCase().includes(queryTrimmed) ||
        e.type.toLowerCase().includes(queryTrimmed) ||
        (e.location && e.location.toLowerCase().includes(queryTrimmed))
      ).slice(0, 2)
    : [];

  const matchingAssignments = queryTrimmed
    ? assignments.filter(a =>
        a.freelancerName.toLowerCase().includes(queryTrimmed) ||
        a.role.toLowerCase().includes(queryTrimmed) ||
        (a.backupAssigned && a.backupAssigned.toLowerCase().includes(queryTrimmed))
      ).slice(0, 2)
    : [];

  const totalMatches = matchingFreelancers.length + matchingEvents.length + matchingAssignments.length;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsSearchFocused(false);
      setShowMobileSearch(false);
      if (onNavigate) {
        onNavigate('find-crew');
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  const handleMarkOne = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAll = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getSearchPlaceholder = () => {
    switch (currentPage) {
      case 'find-crew':
        return 'Search by skill, role, or name...';
      case 'ai-recommendations':
        return 'Search recommended crew...';
      case 'assignments':
        return 'Search assignments...';
      default:
        return 'Search events, crew, locations...';
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'Approval':
      case 'Confirmed':
        return <CheckCircle2 className="w-4 h-4 text-[#10B981]" />;
      case 'Cancellation':
      case 'Rejection':
        return <AlertTriangle className="w-4 h-4 text-[#EF4444]" />;
      case 'BackupActivation':
        return <ShieldCheck className="w-4 h-4 text-[#9333EA]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#563CF0]" />;
    }
  };

  const renderSearchDropdown = () => {
    if (!isSearchFocused || !queryTrimmed) return null;

    return (
      <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:w-[460px] bg-white rounded-2xl shadow-2xl border border-[#EAEFF8] overflow-hidden z-50 animate-fade-in-up">
        {/* Header */}
        <div className="px-4 py-2.5 bg-[#F8FAFD] border-b border-[#F0F3F9] flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#8A95A5] uppercase tracking-wider">
            Results for "{searchQuery}"
          </span>
          <span className="text-[11px] text-[#563CF0] font-semibold">
            Press Enter for all
          </span>
        </div>

        <div className="max-h-[360px] overflow-y-auto divide-y divide-[#F0F3F9]">
          {/* 1. Crew Talent */}
          {matchingFreelancers.length > 0 && (
            <div className="p-2">
              <div className="text-[10.5px] font-bold text-[#8A95A5] uppercase px-2.5 py-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#563CF0]" />
                Crew Talent ({matchingFreelancers.length})
              </div>
              <div className="space-y-1">
                {matchingFreelancers.map((crew) => (
                  <div
                    key={crew.id}
                    onMouseDown={() => {
                      if (onViewFreelancer) {
                        onViewFreelancer(crew);
                      } else if (onNavigate) {
                        onNavigate('find-crew');
                      }
                      setIsSearchFocused(false);
                      setShowMobileSearch(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F0EEFF]/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={crew.avatar}
                        alt={crew.name}
                        className="w-9 h-9 rounded-xl object-cover bg-gray-100 ring-1 ring-gray-200 shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-[13px] font-bold text-[#142653] group-hover:text-[#563CF0] transition-colors truncate">
                          {crew.name}
                        </div>
                        <div className="text-[11.5px] text-[#5F6D82] truncate">
                          {crew.role} • ₹{crew.pricePerEvent.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[12px] font-bold text-[#F59E0B] shrink-0 pl-2">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{crew.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Events */}
          {matchingEvents.length > 0 && (
            <div className="p-2">
              <div className="text-[10.5px] font-bold text-[#8A95A5] uppercase px-2.5 py-1 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#10B981]" />
                Events ({matchingEvents.length})
              </div>
              <div className="space-y-1">
                {matchingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onMouseDown={() => {
                      if (onSelectEvent) {
                        onSelectEvent(evt);
                      } else if (onNavigate) {
                        onNavigate('dashboard');
                      }
                      setIsSearchFocused(false);
                      setShowMobileSearch(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F0EEFF]/60 cursor-pointer transition-colors group"
                  >
                    <div className="truncate min-w-0">
                      <div className="text-[13px] font-bold text-[#142653] group-hover:text-[#563CF0] transition-colors truncate">
                        {evt.name}
                      </div>
                      <div className="text-[11.5px] text-[#5F6D82] truncate">
                        {evt.date} • {evt.location}
                      </div>
                    </div>
                    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F8F0] text-[#10B981] shrink-0 ml-2">
                      {evt.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Assignments */}
          {matchingAssignments.length > 0 && (
            <div className="p-2">
              <div className="text-[10.5px] font-bold text-[#8A95A5] uppercase px-2.5 py-1 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-[#563CF0]" />
                Assignments ({matchingAssignments.length})
              </div>
              <div className="space-y-1">
                {matchingAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    onMouseDown={() => {
                      if (onNavigate) onNavigate('assignments');
                      setIsSearchFocused(false);
                      setShowMobileSearch(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F0EEFF]/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0">
                      <img
                        src={asg.avatar}
                        alt={asg.freelancerName}
                        className="w-7 h-7 rounded-lg object-cover bg-gray-100 shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-[13px] font-bold text-[#142653] group-hover:text-[#563CF0] truncate">
                          {asg.freelancerName}
                        </div>
                        <div className="text-[11.5px] text-[#5F6D82] truncate">
                          {asg.role} • Standby: {asg.backupAssigned || 'Auto'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#F0EEFF] text-[#563CF0] shrink-0 ml-2">
                      {asg.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No matches */}
          {totalMatches === 0 && (
            <div className="p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-[#F3F5FA] flex items-center justify-center mx-auto text-[#8A95A5] mb-2">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-[13.5px] font-bold text-[#142653]">No exact matches found</p>
              <p className="text-[12px] text-[#8A95A5] mt-0.5">
                Try searching for names, roles like "Photographer", or "Audio"
              </p>
            </div>
          )}
        </div>

        {/* Footer Jump Button */}
        <div
          onMouseDown={() => {
            if (onNavigate) onNavigate('find-crew');
            setIsSearchFocused(false);
            setShowMobileSearch(false);
          }}
          className="p-3 bg-[#F8FAFD] hover:bg-[#F0EEFF] text-center cursor-pointer transition-colors border-t border-[#F0F3F9]"
        >
          <span className="text-[12.5px] font-bold text-[#563CF0] flex items-center justify-center gap-1.5">
            <span>Explore all matching crew in Find Crew</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <header className="h-[74px] bg-white border-b border-[#EAEFF8] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Hamburger & Search Input */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-[#142653] hover:bg-[#F3F5FA] transition-colors shrink-0 btn-press"
          title="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        {/* Mobile Compact Icon Brand */}
        <div
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="lg:hidden flex items-center cursor-pointer select-none shrink-0"
          title="CrewForge"
        >
          <img
            src="/brand/crewforge-icon.png"
            alt="CrewForge"
            className="w-7 h-7 object-contain"
          />
        </div>

        {/* Desktop & Tablet Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 hidden sm:block max-w-[440px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#8A95A5]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsSearchFocused(true);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder={getSearchPlaceholder()}
            className="w-full pl-11 pr-8 py-2.5 bg-[#F3F5FA] hover:bg-[#EDF1F8] focus:bg-white text-[13.5px] text-[#142653] placeholder-[#8A95A5] rounded-full border border-transparent focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 transition-all outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              ✕
            </button>
          )}

          {/* Desktop Search Dropdown */}
          {renderSearchDropdown()}
        </div>

        {/* Mobile Search Toggle Button */}
        <button
          onClick={() => {
            setShowMobileSearch(!showMobileSearch);
            setIsSearchFocused(true);
          }}
          className="sm:hidden p-2 rounded-xl text-[#5F6D82] hover:bg-[#F3F5FA] hover:text-[#142653] transition-colors"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Expandable Search Bar Drawer */}
      {showMobileSearch && (
        <div ref={mobileSearchRef} className="absolute top-[74px] left-0 right-0 bg-white border-b border-[#EAEFF8] p-3 shadow-md sm:hidden z-40 animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#8A95A5]" />
            </div>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSearchFocused(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={getSearchPlaceholder()}
              className="w-full pl-10 pr-9 py-2 bg-[#F3F5FA] text-[13.5px] text-[#142653] rounded-xl border border-transparent focus:border-[#563CF0] outline-none"
            />
            <button
              onClick={() => {
                setShowMobileSearch(false);
                setIsSearchFocused(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Mobile Search Dropdown */}
            {renderSearchDropdown()}
          </div>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Help Centre - Full on desktop, icon only on md, hidden on xs */}
        <button 
          onClick={() => onNavigate?.('help')}
          className={`hidden md:flex items-center gap-2 text-[13.5px] font-medium transition-colors p-2 sm:p-0 rounded-xl ${
            currentPage === 'help' ? 'text-[#563CF0] font-bold' : 'text-[#5F6D82] hover:text-[#142653]'
          }`}
          title="Open Help Center"
        >
          <HelpCircle className={`w-[18px] h-[18px] ${currentPage === 'help' ? 'text-[#563CF0]' : 'text-[#5F6D82]'}`} />
          <span className="hidden lg:inline">Help Centre</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifs();
            }}
            className="relative p-2 rounded-full hover:bg-[#F3F5FA] text-[#5F6D82] hover:text-[#142653] transition-colors btn-press"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-[#5F6D82]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full ring-2 ring-white animate-live-pulse"></span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-[#EAEFF8] p-4 py-3 z-50 animate-fade-in-up">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F3F9]">
                <div className="flex items-center gap-2">
                  <h4 className="text-[14px] font-bold text-[#142653]">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-semibold text-[#563CF0] bg-[#F0EEFF] px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="text-[11.5px] font-semibold text-[#563CF0] hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5 py-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-[13px] text-[#8A95A5]">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => !notif.isRead && handleMarkOne(notif._id)}
                      className={`flex gap-3 text-left p-2.5 rounded-xl transition-colors cursor-pointer ${
                        notif.isRead ? 'hover:bg-[#F8FAFD] opacity-75' : 'bg-[#F2F5FD]/60 hover:bg-[#F0EEFF]/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[12.5px] font-bold text-[#142653] truncate">{notif.title}</p>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#563CF0] shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-[#5F6D82] line-clamp-2 mt-0.5">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 sm:gap-2.5 pl-1.5 sm:pl-2 py-1 pr-1 rounded-full hover:bg-[#F3F5FA] transition-colors btn-press"
          >
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-gradient-to-tr from-[#563CF0] to-[#7545F5] flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm ring-2 ring-[#EDE9FE] shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'V'}
            </div>
            <span className="hidden sm:inline text-[13.5px] font-semibold text-[#142653] truncate max-w-[100px] lg:max-w-[130px]">
              {currentUser?.name || 'Varsharani'}
            </span>
            <ChevronDown className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#8A95A5]" />
          </button>

          {/* User Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-[#EAEFF8] p-2 z-50 animate-fade-in-up">
              <div className="px-3 py-2 border-b border-[#F0F3F9]">
                <p className="text-xs font-semibold text-[#8A95A5] uppercase tracking-wider">Signed in as</p>
                <p className="text-[13.5px] font-bold text-[#142653] truncate">
                  {currentUser?.email || 'varsharani@eventco.in'}
                </p>
                {currentUser?.role && (
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F0EEFF] text-[#563CF0]">
                    {currentUser.role}
                  </span>
                )}
              </div>
              <div className="py-1">
                {currentUser ? (
                  <>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate?.(currentUser.role === 'Freelancer' ? 'freelancer-profile' : 'organizer-profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#142653] hover:bg-[#F3F5FA] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#5F6D82]" />
                      <span>{currentUser.role === 'Freelancer' ? 'My Freelancer Profile' : 'Organizer Profile'}</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#EF4444] hover:bg-[#FEE2E2]/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-[#EF4444]" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate?.('login');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#563CF0] hover:bg-[#F0EEFF] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#563CF0]" />
                      <span>Sign In</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate?.('register');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#142653] hover:bg-[#F3F5FA] transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-[#5F6D82]" />
                      <span>Create Account</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
