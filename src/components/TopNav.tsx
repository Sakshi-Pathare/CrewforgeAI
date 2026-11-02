import React, { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import { PageType, User as UserType } from '../types';
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
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  searchQuery,
  onSearchChange,
  onNavigate,
  currentUser,
  onLogout
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

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
        return 'Search recommended crew or skills...';
      case 'assignments':
        return 'Search assignments or crew members...';
      default:
        return 'Search events, crew or locations...';
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
          onClick={() => onNavigate?.('help')}
          className={`flex items-center gap-2 text-[13.5px] font-medium transition-colors ${
            currentPage === 'help' ? 'text-[#563CF0] font-bold' : 'text-[#5F6D82] hover:text-[#142653]'
          }`}
          title="Open Help Center"
        >
          <HelpCircle className={`w-[18px] h-[18px] ${currentPage === 'help' ? 'text-[#563CF0]' : 'text-[#5F6D82]'}`} />
          <span>Help Centre</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifs();
            }}
            className="relative p-2 rounded-full hover:bg-[#F3F5FA] text-[#5F6D82] hover:text-[#142653] transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-[#5F6D82]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-88 bg-white rounded-2xl shadow-xl border border-[#EAEFF8] p-4 py-3 z-50 min-w-[320px]">
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
                        <p className="text-[10px] text-[#8A95A5] mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile or Sign In */}
        {currentUser ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-2 py-1 pr-1 rounded-full hover:bg-[#F3F5FA] transition-colors"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-[#EDE9FE]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#563CF0] to-[#7545F5] flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-[#EDE9FE]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <span className="block text-[13.5px] font-bold text-[#142653] leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="block text-[10.5px] font-semibold text-[#563CF0] leading-tight">
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#8A95A5]" />
            </button>

            {/* User Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-[#EAEFF8] p-2 z-50">
                <div className="px-3 py-2 border-b border-[#F0F3F9]">
                  <p className="text-xs font-semibold text-[#8A95A5] uppercase tracking-wider">Signed in as</p>
                  <p className="text-[13px] font-bold text-[#142653] truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#EDE9FE] text-[#563CF0]">
                    {currentUser.role}
                  </span>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => { 
                      setShowProfileMenu(false); 
                      onNavigate?.(currentUser.role === 'Freelancer' ? 'freelancer-profile' : 'organizer-profile'); 
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#142653] hover:bg-[#F3F5FA]"
                  >
                    <User className="w-4 h-4 text-[#563CF0]" />
                    <span>{currentUser.role === 'Freelancer' ? 'Freelancer Profile' : 'Organizer Profile'}</span>
                  </button>
                  <button 
                    onClick={() => { setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#142653] hover:bg-[#F3F5FA]"
                  >
                    <Settings className="w-4 h-4 text-[#5F6D82]" />
                    <span>Settings & Preferences</span>
                  </button>
                  <button 
                    onClick={() => { 
                      setShowProfileMenu(false); 
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#EF4444] hover:bg-[#FEE2E2]/40"
                  >
                    <LogOut className="w-4 h-4 text-[#EF4444]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate?.('login')}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#563CF0] hover:bg-[#F0EEFF] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate?.('register')}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#563CF0] hover:bg-[#472FD6] transition-colors shadow-sm"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
