import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Plus, Edit2, Trash2, X, Check, Bell, BellOff, BellRing, Calendar as CalendarIcon, Copy, Sparkles } from 'lucide-react';
import { deviceNotificationService } from '../../services/deviceNotificationService';

const DAYS_OF_WEEK = [
  { id: 'Saturday', label: 'Saturday', short: 'Sat' },
  { id: 'Sunday', label: 'Sunday', short: 'Sun' },
  { id: 'Monday', label: 'Monday', short: 'Mon' },
  { id: 'Tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'Wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'Thursday', label: 'Thursday', short: 'Thu' },
  { id: 'Friday', label: 'Friday', short: 'Fri' }
];

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

// Get today's day of week name
const getTodayDayName = () => {
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIdx = new Date().getDay();
  return daysMap[todayIdx];
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

  const todayDayName = getTodayDayName();
  const [selectedDay, setSelectedDay] = useState(todayDayName);

  // 7-Day Weekly Routine Store in localStorage
  const [weeklyRoutine, setWeeklyRoutine] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_weekly_routine_v3');
      if (saved) return JSON.parse(saved);

      // Check legacy single-routine migration
      const legacy = localStorage.getItem('ssp_student_routine');
      const baseSlots = legacy ? JSON.parse(legacy) : INITIAL_ROUTINE_SLOTS;

      const initialWeekly = {};
      DAYS_OF_WEEK.forEach(day => {
        initialWeekly[day.id] = baseSlots.map(s => ({ ...s, id: `${day.id}-${s.id}` }));
      });
      return initialWeekly;
    } catch (e) {
      const initialWeekly = {};
      DAYS_OF_WEEK.forEach(day => {
        initialWeekly[day.id] = INITIAL_ROUTINE_SLOTS.map(s => ({ ...s, id: `${day.id}-${s.id}` }));
      });
      return initialWeekly;
    }
  });

  // Notifications Feature Toggle State
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_routine_notifications_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState(null);

  const handleOpenDiagnostics = async () => {
    const status = await deviceNotificationService.checkDiagnosticStatus();
    setDiagnosticData(status);
    setShowDiagnosticModal(true);
  };

  useEffect(() => {
    localStorage.setItem('ssp_routine_notifications_enabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('ssp_weekly_routine_v3', JSON.stringify(weeklyRoutine));
    const timer = setTimeout(() => {
      try {
        const exams = JSON.parse(localStorage.getItem('ssp_exams') || '[]');
        const homework = JSON.parse(localStorage.getItem('ssp_homework') || '[]');
        deviceNotificationService.syncAllAlarms({
          weeklyRoutine,
          exams,
          homework,
          notificationsEnabled
        });
      } catch (e) {}
    }, 500);
    return () => clearTimeout(timer);
  }, [weeklyRoutine, notificationsEnabled]);

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
  const [targetScope, setTargetScope] = useState('current'); // 'current' | 'all'

  // Toggle Notification Feature (Enable / Disable)
  const handleToggleNotifications = () => {
    if (!notificationsEnabled) {
      setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
      setActiveToast(null);
    }
  };

  // Trigger Notification for a Routine Slot
  const triggerRoutineNotification = (slot, dayName) => {
    playChimeSound();

    const titleMessage = `⏰ ${dayName} Routine Alert: ${formatTimeAMPM(slot.startTime)}`;
    const bodyMessage = `It's ${formatTimeAMPM(slot.startTime)} on ${dayName}! Time to study ${slot.subjects}. ${slot.notes ? '(' + slot.notes + ')' : ''}`.trim();

    // 1. In-App Floating Toast Banner
    setActiveToast({
      id: slot.id,
      title: titleMessage,
      subjects: slot.subjects,
      time: formatTimeAMPM(slot.startTime),
      notes: slot.notes,
      day: dayName
    });

    // Add to Notification History (stored for 24 hours)
    if (addNotificationToHistory) {
      addNotificationToHistory(
        `⏰ ${dayName} Routine (${formatTimeAMPM(slot.startTime)})`,
        `Time to study ${slot.subjects}! Let's make it count.`,
        'routine'
      );
    }

    // 2. Real Native Device Notification (Status Bar Notification with Audio Sound & Tap to Open App)
    deviceNotificationService.sendDeviceNotification({
      title: `⏰ ${dayName} Routine: ${slot.subjects}`,
      body: bodyMessage,
      id: Math.floor(Math.random() * 1000000)
    });
  };

  // REAL-TIME DEVICE CLOCK & DAY MONITOR
  useEffect(() => {
    const interval = setInterval(() => {
      if (!notificationsEnabled) return;

      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime24 = `${hours}:${minutes}`;
      const todayDate = now.toDateString();
      const currentDayName = getTodayDayName();

      const todaySlots = weeklyRoutine[currentDayName] || [];

      // Check today's specific routine slots
      todaySlots.forEach((slot) => {
        if (slot.startTime === currentTime24) {
          const notifyKey = `${currentDayName}-${slot.id}-${todayDate}-${currentTime24}`;
          if (!notifiedKeysRef.current.has(notifyKey)) {
            notifiedKeysRef.current.add(notifyKey);
            triggerRoutineNotification(slot, currentDayName);
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [weeklyRoutine, notificationsEnabled]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingSlotId(null);
    setSubjectsInput('');
    setStartTimeInput('06:00');
    setEndTimeInput('08:00');
    setNotesInput('');
    setTargetScope('current');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (slot) => {
    setEditingSlotId(slot.id);
    setSubjectsInput(slot.subjects);
    setStartTimeInput(slot.startTime || '06:00');
    setEndTimeInput(slot.endTime || '08:00');
    setNotesInput(slot.notes || '');
    setTargetScope('current');
    setIsModalOpen(true);
  };

  // Delete Routine Slot from Selected Day
  const handleDeleteSlot = (id) => {
    setWeeklyRoutine(prev => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).filter(s => s.id !== id)
    }));
  };

  // Copy Current Day's Routine to All 7 Days
  const handleCopyRoutineToAllDays = () => {
    const currentSlots = weeklyRoutine[selectedDay] || [];
    if (window.confirm(`Copy ${selectedDay}'s routine schedule to ALL 7 days of the week?`)) {
      setWeeklyRoutine(prev => {
        const nextWeekly = {};
        DAYS_OF_WEEK.forEach(day => {
          nextWeekly[day.id] = currentSlots.map(s => ({ ...s, id: `${day.id}-${Date.now()}-${Math.random()}` }));
        });
        return nextWeekly;
      });
    }
  };

  // Save (Create or Update) Routine Slot
  const handleSaveRoutineSlot = (e) => {
    e.preventDefault();
    if (!subjectsInput.trim()) return;

    const formattedRange = `${formatTimeAMPM(startTimeInput)} - ${formatTimeAMPM(endTimeInput)}`;

    setWeeklyRoutine(prev => {
      const nextWeekly = { ...prev };

      const daysToApply = targetScope === 'all'
        ? DAYS_OF_WEEK.map(d => d.id)
        : [selectedDay];

      daysToApply.forEach(dayId => {
        const daySlots = nextWeekly[dayId] || [];

        if (editingSlotId && dayId === selectedDay) {
          nextWeekly[dayId] = daySlots.map(s => s.id === editingSlotId ? {
            ...s,
            subjects: subjectsInput.trim(),
            startTime: startTimeInput,
            endTime: endTimeInput,
            timeRange: formattedRange,
            notes: notesInput.trim()
          } : s);
        } else {
          const newSlot = {
            id: `r-${dayId}-${Date.now()}-${Math.random()}`,
            subjects: subjectsInput.trim(),
            startTime: startTimeInput,
            endTime: endTimeInput,
            timeRange: formattedRange,
            notes: notesInput.trim()
          };
          nextWeekly[dayId] = [...daySlots, newSlot];
        }
      });

      return nextWeekly;
    });

    setIsModalOpen(false);
  };

  // Sorted routine slots chronologically for the selected day
  const currentDaySlots = weeklyRoutine[selectedDay] || [];
  const sortedSlots = [...currentDaySlots].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-16 relative overflow-x-hidden">
      
      {/* IN-APP REAL-TIME TOAST NOTIFICATION POPUP */}
      {activeToast && notificationsEnabled && (
        <div className="fixed top-4 right-3 sm:right-6 z-50 max-w-md w-[calc(100vw-24px)] sm:w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 border-blue-600 shadow-2xl animate-in slide-in-from-top-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    ⏰ {activeToast.time}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{activeToast.day} Routine</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Time to study {activeToast.subjects}! 🚀
                </h4>
                {activeToast.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    📌 {activeToast.notes}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <button
              onClick={() => setActiveToast(null)}
              className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs cursor-pointer hover:bg-blue-700 shadow-xs"
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
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Weekly Routine Planner
            </h1>
            <span className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              7 Days Timetable
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Customize unique daily study routines for all 7 days of the week with real-device status bar alarms!
          </p>
        </div>

        {/* HEADER ACTION BUTTONS */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* NATIVE ALARM DIAGNOSTIC CONTROL BUTTON */}
          <button
            onClick={handleOpenDiagnostics}
            className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 font-bold text-xs transition-all cursor-pointer shadow-2xs"
            title="Check Native Notification Status & Test Alarm"
          >
            <BellRing className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Alarm Diagnostics & Test</span>
          </button>

          {/* INSTANT NOTIFICATION TOGGLE BUTTON */}
          <button
            onClick={handleToggleNotifications}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-2xs ${
              notificationsEnabled
                ? 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60'
                : 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
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
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Slot for {selectedDay}</span>
          </button>
        </div>
      </div>

      {/* 🗓️ 7 DAYS OF THE WEEK SELECTOR ROW */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl p-3 sm:p-4 border border-[#E5E7EB] dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-wider uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Select Day of Week</span>
          </span>

          <button
            onClick={handleCopyRoutineToAllDays}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            title="Copy this day's routine slots to all 7 days"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy to All Days</span>
          </button>
        </div>

        {/* 7 DAYS TAB PILLS */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day.id;
            const isToday = todayDayName === day.id;
            const slotCount = (weeklyRoutine[day.id] || []).length;

            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`flex flex-col items-center justify-center min-w-[76px] sm:min-w-[100px] px-2.5 py-2 rounded-xl transition-all cursor-pointer border text-center shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-extrabold">{day.short}</span>
                  {isToday && (
                    <span className={`text-[9px] font-black px-1 py-0.2 rounded uppercase ${
                      isSelected ? 'bg-white text-blue-600' : 'bg-amber-500 text-white'
                    }`}>
                      TODAY
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 font-medium ${
                  isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-400'
                }`}>
                  {slotCount} slots
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* OVERALL MASTER ROUTINE CONTAINER FOR SELECTED DAY */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E5E7EB] dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{selectedDay} Timetable Schedule</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {sortedSlots.length} Time Slots Scheduled
          </span>
        </div>

        {/* ROUTINE SLOTS LIST */}
        {sortedSlots.length > 0 ? (
          <div className="space-y-3">
            {sortedSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800/80">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot.timeRange}</span>
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {slot.subjects}
                    </h3>
                  </div>

                  {slot.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium pt-0.5">
                      📌 {slot.notes}
                    </p>
                  )}
                </div>

                {/* SLOT ACTIONS */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200 dark:border-slate-800 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleOpenEditModal(slot)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                No Routine Slots for {selectedDay}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tap below to add study time slots for {selectedDay}, or copy from another day!
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs cursor-pointer hover:bg-blue-700"
            >
              + Add Routine Slot for {selectedDay}
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ROUTINE SLOT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {editingSlotId ? `Edit Slot (${selectedDay})` : `Add Slot (${selectedDay})`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutineSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject(s) to Study *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Organic Chemistry, Physics"
                  value={subjectsInput}
                  onChange={(e) => setSubjectsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTimeInput}
                    onChange={(e) => setStartTimeInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTimeInput}
                    onChange={(e) => setEndTimeInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topic Notes / Study Goal
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on Chapter 5 CQ exercises"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Apply Schedule To
                </label>
                <select
                  value={targetScope}
                  onChange={(e) => setTargetScope(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="current">Only {selectedDay}</option>
                  <option value="all">Apply to All 7 Days of the Week</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Banner for Test Alarms */}
      {testMsg && (
        <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-5 max-w-md">
          <Sparkles className="w-5 h-5 shrink-0" />
          <span>{testMsg}</span>
        </div>
      )}

      {/* NATIVE NOTIFICATION DIAGNOSTIC CONTROL MODAL */}
      {showDiagnosticModal && diagnosticData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-[92vw] max-w-md p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowDiagnosticModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                <BellRing className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Native Notification System
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Android OS AlarmManager & Status Bar Diagnostics
                </p>
              </div>
            </div>

            {/* Diagnostic Items Checklist */}
            <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs font-bold">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Device Notification Permission</span>
                <span className={diagnosticData.notificationsPermission ? 'text-emerald-500' : 'text-red-500'}>
                  {diagnosticData.notificationsPermission ? '✓ Enabled' : '✕ Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Exact Alarm Timing (Android 12+)</span>
                <span className={diagnosticData.exactAlarmPermission ? 'text-emerald-500' : 'text-amber-500'}>
                  {diagnosticData.exactAlarmPermission ? '✓ Enabled' : '⚠️ Restricted'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Study Routine Channel</span>
                <span className="text-emerald-500">✓ High Importance</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Exam Reminders Channel</span>
                <span className="text-emerald-500">✓ High Importance</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Homework Reminders Channel</span>
                <span className="text-emerald-500">✓ High Importance</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-200">Active Scheduled System Alarms</span>
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">{diagnosticData.scheduledCount} Alarms</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => deviceNotificationService.openNotificationSettings()}
                className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Bell className="w-4 h-4" />
                <span>Open Android Notification Settings</span>
              </button>

              {!diagnosticData.exactAlarmPermission && (
                <button
                  onClick={() => deviceNotificationService.openExactAlarmSettings()}
                  className="w-full py-2.5 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Fix Exact Alarm Permission</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
