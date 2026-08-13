import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus, Search, CheckCircle2, Trash2, CheckSquare, Bell, BellOff, BellRing, X
} from 'lucide-react';

// Web Audio Chime Sound Generator for Homework 24h Alerts
const playChimeSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Note E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.35, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // Note B5 (987.77 Hz) played after 0.15s
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.45, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 1.0);
  } catch (e) {
    console.error('Audio playback error', e);
  }
};

export const HomeworkView = () => {
  const { homework, subjects, toggleHomeworkStatus, deleteHomework, addHomework, addNotificationToHistory } = useApp();

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Homework Notification Toggle State
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_hw_notifications_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_hw_notifications_enabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  // Persistent List of Notified Homework IDs (Guarantees notification fires ONLY ONCE, JUST ONE TIME!)
  const [notifiedHomework, setNotifiedHomework] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_notified_hw_once');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_notified_hw_once', JSON.stringify(notifiedHomework));
  }, [notifiedHomework]);

  const [activeToast, setActiveToast] = useState(null);

  // Toggle Notifications
  const handleToggleNotifications = () => {
    if (!notificationsEnabled) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
      setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
      setActiveToast(null);
    }
  };

  // REAL-TIME 24-HOUR HOMEWORK ALARM MONITOR (FIRES EXACTLY ONCE PER HOMEWORK!)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!notificationsEnabled) return;

      const now = new Date();

      homework.forEach((hw) => {
        if (!hw.dueDate || hw.status === 'Completed') return;

        // Skip if this homework item was ALREADY notified once!
        if (notifiedHomework.includes(hw.id)) return;

        const [year, month, day] = hw.dueDate.split('-').map(Number);
        // Homework due date target (9:00 AM of due date or 24 hours prior)
        const dueTargetDate = new Date(year, month - 1, day, 9, 0, 0);
        const timeDiffMs = dueTargetDate.getTime() - now.getTime();
        const hoursRemaining = timeDiffMs / (1000 * 60 * 60);

        // Triggers EXACTLY ONCE at the 24-hour mark (when hours remaining <= 24 and > 0)
        if (hoursRemaining <= 24 && hoursRemaining > 0) {
          // Permanently mark homework as notified!
          setNotifiedHomework(prev => [...prev, hw.id]);

          // Play Audio Chime
          playChimeSound();

          const sub = subjects.find(s => s.id === hw.subjectId);
          const displaySub = sub?.name || 'General';

          // Trigger In-App Toast
          setActiveToast({
            id: hw.id,
            title: hw.title,
            subject: displaySub,
            dueDate: hw.dueDate
          });

          // Record in 24h Notification History Bar
          if (addNotificationToHistory) {
            addNotificationToHistory({
              title: `Homework Due Tomorrow: ${hw.title}`,
              message: `${displaySub} assignment is due on ${hw.dueDate}`,
              iconType: 'homework'
            });
          }

          // Native Browser Toast Notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`📚 Homework Due Tomorrow!`, {
                body: `${hw.title} (${displaySub}) is due on ${hw.dueDate}. Complete it soon!`,
                icon: '/favicon.ico'
              });
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    }, 15000); // Checks every 15 seconds

    return () => clearInterval(interval);
  }, [homework, notificationsEnabled, notifiedHomework, subjects, addNotificationToHistory]);

  // Form
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [description, setDescription] = useState('');

  const filteredHomework = homework
    .filter(hw => {
      const matchesSearch = hw.title.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = filterPriority === 'All' || hw.priority === filterPriority;
      const matchesStatus = filterStatus === 'All' || hw.status === filterStatus;
      const matchesSubject = filterSubject === 'All' || hw.subjectId === filterSubject;
      return matchesSearch && matchesPriority && matchesStatus && matchesSubject;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
      if (sortBy === 'priority') return a.priority.localeCompare(b.priority);
      return 0;
    });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addHomework({
      title,
      subjectId: subjectId || subjects[0]?.id,
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      estimatedMinutes: Number(estimatedMinutes),
      description
    });
    setTitle('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-200 pb-16 relative overflow-x-hidden">
      
      {/* IN-APP REAL-TIME TOAST NOTIFICATION POPUP */}
      {activeToast && notificationsEnabled && (
        <div className="fixed top-4 right-3 sm:right-6 z-50 max-w-md w-[calc(100vw-24px)] sm:w-full bg-white dark:bg-[#0F172A] rounded-2xl p-4 border-2 border-[#2563EB] shadow-2xl animate-in slide-in-from-top-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-[#2563EB] dark:text-blue-400 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    ⏰ 24 Hours Alert
                  </span>
                  <span className="text-xs font-semibold text-[#6B7280] dark:text-slate-400">Homework Due Soon</span>
                </div>
                <h4 className="text-sm font-extrabold text-[#111827] dark:text-white">
                  {activeToast.title}
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium">
                  Subject: <strong className="text-[#111827] dark:text-slate-200">{activeToast.subject}</strong> • Due: {activeToast.dueDate}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="p-1 text-[#6B7280] hover:text-[#111827] dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E5E7EB] dark:border-slate-800 flex items-center justify-end">
            <button
              onClick={() => setActiveToast(null)}
              className="px-4 py-1.5 rounded-xl bg-[#2563EB] text-white font-semibold text-xs cursor-pointer hover:bg-blue-700 shadow-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E5E7EB] dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Homework & Assignments
          </h1>
          <p className="text-sm font-normal text-slate-600 dark:text-slate-400 mt-1">
            Track your tasks, priority levels, and due dates with automatic 24-hour advance notifications.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* NOTIFICATION TOGGLE BUTTON */}
          <button
            onClick={handleToggleNotifications}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-2xs ${
              notificationsEnabled
                ? 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-[#EF4444] dark:text-red-400 border border-red-200 dark:border-red-800/60'
                : 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
            }`}
            title={notificationsEnabled ? 'Disable Homework 24-Hour Notifications' : 'Enable Homework 24-Hour Notifications'}
          >
            {notificationsEnabled ? (
              <>
                <BellOff className="w-4 h-4" />
                <span>Disable Notification</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>Enable Notification</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Homework
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="saas-card p-4 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-3 sm:flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-2 sm:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-10 px-2 sm:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="h-10 px-2 sm:px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Mobile Card List View (Visible on Mobile < md) */}
      <div className="md:hidden space-y-3">
        {filteredHomework.length === 0 ? (
          <div className="saas-card p-8 text-center text-slate-500 dark:text-slate-400 font-medium text-xs bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 rounded-xl">
            No homework assignments found matching your filters.
          </div>
        ) : (
          filteredHomework.map((hw) => {
            const sub = subjects.find(s => s.id === hw.subjectId);
            const isCompleted = hw.status === 'Completed';

            return (
              <div key={hw.id} className="saas-card p-4 space-y-3 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 rounded-xl">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => toggleHomeworkStatus(hw.id)}
                      className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center cursor-pointer transition-all ${
                        isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400 dark:border-slate-600'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <h3 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500 font-normal' : 'text-slate-900 dark:text-white'}`}>
                        {hw.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub?.color || '#2563EB' }} />
                        {sub?.name || 'General'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteHomework(hw.id)}
                    className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Due: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{hw.dueDate}</strong></span>
                  
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      hw.priority === 'High'
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
                        : hw.priority === 'Medium'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {hw.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${isCompleted ? 'badge-completed' : 'badge-pending'}`}>
                      {hw.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (Hidden on Mobile < md) */}
      <div className="hidden md:block saas-card p-0 overflow-hidden bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                <th className="py-3.5 px-4 w-12 text-center">Done</th>
                <th className="py-3.5 px-4">Homework Title</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {filteredHomework.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-500 dark:text-slate-400 font-medium">
                    No homework assignments found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredHomework.map((hw) => {
                  const sub = subjects.find(s => s.id === hw.subjectId);
                  const isCompleted = hw.status === 'Completed';

                  return (
                    <tr key={hw.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleHomeworkStatus(hw.id)}
                          className={`w-4 h-4 mx-auto rounded border flex items-center justify-center cursor-pointer transition-all ${
                            isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400 dark:border-slate-600 hover:border-blue-600'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <span className={isCompleted ? 'line-through text-slate-400 dark:text-slate-400 font-normal' : 'text-slate-900 dark:text-white'}>{hw.title}</span>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub?.color || '#2563EB' }} />
                          {sub?.name || 'General'}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200 font-medium">
                        {hw.dueDate}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                          hw.priority === 'High'
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
                            : hw.priority === 'Medium'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {hw.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                          isCompleted ? 'badge-completed' : 'badge-pending'
                        }`}>
                          {hw.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => deleteHomework(hw.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Homework Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="saas-card w-full max-w-md bg-white dark:bg-slate-900 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Homework Task</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Solve Calculus Worksheet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-blue-600 text-white font-semibold cursor-pointer hover:bg-blue-700 text-xs sm:text-sm shadow-xs"
                >
                  Save Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
