import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon, CheckSquare, GraduationCap,
  FileText, Folder, BookCheck, BookOpen, X
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'planner', label: 'Routine', icon: CalendarIcon },
    { id: 'syllabus', label: 'Syllabus Tracker', icon: BookCheck },
    { id: 'homework', label: 'Homework', icon: CheckSquare },
    { id: 'exams', label: 'Exams', icon: GraduationCap },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'resources', label: 'Resources', icon: Folder },
    { id: 'dictionary', label: 'Dictionary', icon: BookOpen }
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-[220px] bg-white dark:bg-[#0F172A] border-r border-slate-100 dark:border-slate-800 p-4 sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto shrink-0 justify-between">
        
        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer rounded-xl ${
                  isActive
                    ? 'sidebar-item-active'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Menu Content */}
          <aside className="relative w-64 max-w-[80vw] bg-white dark:bg-[#0F172A] h-full p-4 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <span className="font-extrabold text-base text-slate-900 dark:text-white">Menu Navigation</span>
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all cursor-pointer rounded-xl ${
                        isActive
                          ? 'sidebar-item-active'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Floating Bottom Quick Access Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'planner', label: 'Routine', icon: CalendarIcon },
          { id: 'homework', label: 'Homework', icon: CheckSquare },
          { id: 'exams', label: 'Exams', icon: GraduationCap },
          { id: 'notes', label: 'Notes', icon: FileText },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
