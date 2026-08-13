import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Plus, Edit2, Trash2, X, Check, Bell, BellOff, BellRing, Play } from 'lucide-react';

const INITIAL_ROUTINE_SLOTS = [
  {
    id: 'r-1',
    timeRange: '06:00 AM - 08:00 AM',
    startTime: '06:00',
    endTime: '08:00',
    subjects: 'Mathematics',
    notes: 'Focus on Calculus & Integration Exercises'
  },
  {
    id: 'r-2',
    timeRange: '10:00 AM - 12:00 PM',
    startTime: '10:00',
    endTime: '12:00',
    subjects: 'Chemistry',
    notes: 'Organic Chemistry Homologous Series & Formulas'
  },
  {
    id: 'r-3',
    timeRange: '04:00 PM - 06:00 PM',
    startTime: '16:00',
    endTime: '18:00',
    subjects: 'Bangla + English',
    notes: 'Grammar practice & Essay Writing'
  },
  {
    id: 'r-4',
    timeRange: '08:00 PM - 10:00 PM',
    startTime: '20:00',
    endTime: '22:00',
    subjects: 'Physics + Chemistry + Biology',
    notes: 'Science Revision & Problem Solving'
  }
];

// Helper to format 24h time format to AM/PM
const formatTimeAMPM = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH < 10 ? '0' + displayH : displayH}:${displayM} ${period}`;
};

// Web Audio Chime Sound Generator
const playChimeSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Note 1: E5 (659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // Note 2: A5 (880Hz) played after 0.2s
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.9);
  } catch (e) {
    console.error('Audio playback error', e);
  }
};

export const PlannerView = () => {
  const { setActiveTab, addNotificationToHistory } = useApp();

  // Local Storage state for Student Routine Slots
  const [routineSlots, setRoutineSlots] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_student_routine');
      return saved ? JSON.parse(saved) : INITIAL_ROUTINE_SLOTS;
    } catch (e) {
      return INITIAL_ROUTINE_SLOTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_student_routine', JSON.stringify(routineSlots));
  }, [routineSlots]);

  // Notifications Feature Toggle State
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_routine_notifications_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_routine_notifications_enabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  // Native Device Permission State
  const [notificationPermission, setNotificationPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  const [activeToast, setActiveToast] = useState(null);
  const notifiedKeysRef = useRef(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);

  // Form Fields
  const [subjectsInput, setSubjectsInput] = useState('');
  const [startTimeInput, setStartTimeInput] = useState('06:00');
  const [endTimeInput, setEndTimeInput] = useState('08:00');
  const [notesInput, setNotesInput] = useState('');

  // Toggle Notification Feature (Enable / Disable)
  const handleToggleNotifications = () => {
    if (!notificationsEnabled) {
      // Re-enabling feature
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then((perm) => {
          setNotificationPermission(perm);
        });
      }
      setNotificationsEnabled(true);
    } else {
      // Disabling feature immediately
      setNotificationsEnabled(false);
      setActiveToast(null); // Clear active toast immediately
    }
  };

  // Trigger Notification for a Routine Slot
  const triggerRoutineNotification = (slot) => {
    playChimeSound();

    const titleMessage = `⏰ Routine Alert: ${formatTimeAMPM(slot.startTime)}`;

    // 1. In-App Floating Toast Banner
    setActiveToast({
      id: slot.id,
      title: titleMessage,
      subjects: slot.subjects,
      time: formatTimeAMPM(slot.startTime),
      notes: slot.notes
    });

    // Add to Notification History (stored for 24 hours)
    if (addNotificationToHistory) {
      addNotificationToHistory(
        `⏰ Routine Alarm (${formatTimeAMPM(slot.startTime)})`,
        `Time to study ${slot.subjects}! Let's make it count.`,
        'routine'
      );
    }

    // 2. System / Browser Device Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ Routine Time: ${slot.subjects}`, {
          body: `It's ${formatTimeAMPM(slot.startTime)}! Time to study ${slot.subjects}. Let's make it count!`,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // REAL-TIME DEVICE CLOCK MONITOR
  useEffect(() => {
    const interval = setInterval(() => {
      // If notifications are disabled by the student, skip monitoring!
      if (!notificationsEnabled) return;

      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime24 = `${hours}:${minutes}`;
      const todayDate = now.toDateString();

      // Check all slots
      routineSlots.forEach((slot) => {
        if (slot.startTime === currentTime24) {
          const notifyKey = `${slot.id}-${todayDate}-${currentTime24}`;
          if (!notifiedKeysRef.current.has(notifyKey)) {
            notifiedKeysRef.current.add(notifyKey);
            triggerRoutineNotification(slot);
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [routineSlots, notificationsEnabled]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingSlotId(null);
    setSubjectsInput('');
    setStartTimeInput('06:00');
    setEndTimeInput('08:00');
    setNotesInput('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (slot) => {
    setEditingSlotId(slot.id);
    setSubjectsInput(slot.subjects);
    setStartTimeInput(slot.startTime || '06:00');
    setEndTimeInput(slot.endTime || '08:00');
    setNotesInput(slot.notes || '');
    setIsModalOpen(true);
  };

  // Delete Routine Slot
  const handleDeleteSlot = (id) => {
    setRoutineSlots(prev => prev.filter(s => s.id !== id));
  };

  // Save (Create or Update) Routine Slot
  const handleSaveRoutineSlot = (e) => {
    e.preventDefault();
    if (!subjectsInput.trim()) return;

    const formattedRange = `${formatTimeAMPM(startTimeInput)} - ${formatTimeAMPM(endTimeInput)}`;

    if (editingSlotId) {
      setRoutineSlots(prev => prev.map(s => s.id === editingSlotId ? {
        ...s,
        subjects: subjectsInput.trim(),
        startTime: startTimeInput,
        endTime: endTimeInput,
        timeRange: formattedRange,
        notes: notesInput.trim()
      } : s));
    } else {
      const newSlot = {
        id: `r-${Date.now()}`,
        subjects: subjectsInput.trim(),
        startTime: startTimeInput,
        endTime: endTimeInput,
        timeRange: formattedRange,
        notes: notesInput.trim()
      };
      setRoutineSlots(prev => [...prev, newSlot]);
    }

    setIsModalOpen(false);
  };

  // Sorted routine slots chronologically
  const sortedSlots = [...routineSlots].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-16 relative overflow-x-hidden">
      
      {/* IN-APP REAL-TIME TOAST NOTIFICATION POPUP */}
      {activeToast && notificationsEnabled && (
        <div className="fixed top-4 right-3 sm:right-6 z-50 max-w-md w-[calc(100vw-24px)] sm:w-full bg-white rounded-2xl p-4 border-2 border-[#2563EB] shadow-2xl animate-in slide-in-from-top-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-[#2563EB] animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                    ⏰ {activeToast.time}
                  </span>
                  <span className="text-xs font-semibold text-[#6B7280]">Routine Alarm</span>
                </div>
                <h4 className="text-sm font-extrabold text-[#111827]">
                  Time to study {activeToast.subjects}! 🚀
                </h4>
                {activeToast.notes && (
                  <p className="text-xs text-[#6B7280] font-medium">
                    📌 {activeToast.notes}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="p-1 text-[#6B7280] hover:text-[#111827] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex items-center justify-end">
            <button
              onClick={() => setActiveToast(null)}
              className="px-4 py-1.5 rounded-xl bg-[#2563EB] text-white font-semibold text-xs cursor-pointer hover:bg-blue-700 shadow-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E5E7EB] dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              Daily Routine
            </h1>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium mt-1">
            Your master daily timetable with automatic real-world start time notifications & audio alarms.
          </p>
        </div>

        {/* HEADER ACTION BUTTONS */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* INSTANT NOTIFICATION TOGGLE BUTTON */}
          <button
            onClick={handleToggleNotifications}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-2xs ${
              notificationsEnabled
                ? 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-[#EF4444] dark:text-red-400 border border-red-200 dark:border-red-800/60'
                : 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
            }`}
            title={notificationsEnabled ? 'Disable Routine Notifications' : 'Enable Routine Notifications'}
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
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Routine Slot</span>
          </button>
        </div>
      </div>

      {/* OVERALL MASTER ROUTINE CONTAINER */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E5E7EB] dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
            <span>Master Daily Routine Timetable</span>
          </h2>
          <span className="text-xs font-semibold text-[#6B7280] dark:text-slate-400">
            {sortedSlots.length} Time Slots Scheduled
          </span>
        </div>

        {sortedSlots.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-12 text-center text-[#6B7280] dark:text-slate-400 space-y-3">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-[#111827] dark:text-white">No Routine Slots Added Yet</h3>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">Create your daily study routine to stay disciplined.</p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#2563EB] text-white font-semibold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add First Routine Slot
            </button>
          </div>
        ) : (
          /* ROUTINE SLOTS LIST */
          <div className="space-y-3">
            {sortedSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E5E7EB] dark:border-slate-700/80 hover:border-blue-200 dark:hover:border-blue-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Time & Subject Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold font-mono text-[#2563EB] dark:text-blue-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-[#E5E7EB] dark:border-slate-700 shadow-2xs flex items-center gap-1">
                      <Bell className="w-3 h-3 text-[#2563EB] dark:text-blue-400" /> {slot.timeRange}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#111827] dark:text-white">
                      {slot.subjects}
                    </h3>
                  </div>

                  {slot.notes && (
                    <p className="text-xs text-[#6B7280] dark:text-slate-300 font-medium pl-1">
                      📌 {slot.notes}
                    </p>
                  )}
                </div>

                {/* Right: Modification Action Buttons (Edit & Delete) */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEditModal(slot)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#111827] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-[#EF4444] dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT ROUTINE SLOT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] rounded-xl w-[92vw] sm:w-full max-w-md p-5 sm:p-6 border border-[#E5E7EB] dark:border-slate-800 shadow-xl space-y-4 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#6B7280] dark:text-slate-400 hover:text-[#111827] dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-[#111827]">
              {editingSlotId ? 'Modify Routine Slot' : 'Add Routine Slot'}
            </h3>

            <form onSubmit={handleSaveRoutineSlot} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-[#111827] mb-1">
                  Subject(s) / Study Task
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics or Bangla + English"
                  value={subjectsInput}
                  onChange={(e) => setSubjectsInput(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Start Time (Alarm Time)</label>
                  <input
                    type="time"
                    value={startTimeInput}
                    onChange={(e) => setStartTimeInput(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#111827] mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTimeInput}
                    onChange={(e) => setEndTimeInput(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#111827] mb-1">Notes / Specific Topics (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Practice 5 exercises, Chapter 4..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-[#E5E7EB] text-[#6B7280] font-semibold cursor-pointer text-xs sm:text-sm hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#2563EB] text-white font-semibold cursor-pointer hover:bg-blue-700 text-xs sm:text-sm shadow-xs"
                >
                  {editingSlotId ? 'Save Changes' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
