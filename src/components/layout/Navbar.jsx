import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen, Bell, Sun, Moon, Clock, Calendar, Menu
} from 'lucide-react';

export const Navbar = ({ onToggleMobileMenu }) => {
  const {
    theme, setTheme,
    setActiveTab,
    notificationHistory = [],
    markAllNotificationsRead
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notificationHistory.filter(n => !n.read).length;

  const handleToggleNotifications = () => {
    if (!showNotifications && unreadCount > 0 && markAllNotificationsRead) {
      markAllNotificationsRead();
    }
    setShowNotifications(!showNotifications);
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return '1d ago';
  };

  return (
    <header className="sticky top-0 z-30 w-full h-[64px] bg-white dark:bg-[#0F172A] border-b border-[#E5E7EB] dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between">
      <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Left Side: Mobile Menu Button + Brand Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('planner')}>
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            </div>
            <span className="font-bold text-sm sm:text-lg text-slate-900 dark:text-white tracking-tight truncate max-w-[180px] sm:max-w-none">
              Study Assistant
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Bell Notifications Button */}
          <div className="relative">
            <button
              onClick={handleToggleNotifications}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer relative"
              title="Real-Time Alerts History (Last 24 Hours)"
            >
              <Bell className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Real-Time Notification History Dropdown */}
            {showNotifications && (
              <div className="fixed sm:absolute top-16 right-3 sm:right-0 sm:mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-96 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
                
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">Recent Alerts</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      24h Storage
                    </span>
                  </div>
                  {notificationHistory.length > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead && markAllNotificationsRead()}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold cursor-pointer"
                    >
                      Clear Badge
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                  {notificationHistory.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        No alerts stored in the last 24 hours.
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Routine and exam notifications will appear here automatically.
                      </p>
                    </div>
                  ) : (
                    notificationHistory.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-3 cursor-default ${
                          !n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                          {n.iconType === 'exam' ? <Calendar className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {n.title}
                            </h5>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {formatTimeAgo(n.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Theme Toggle (Sun / Moon) */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-blue-400 fill-blue-400/20" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
