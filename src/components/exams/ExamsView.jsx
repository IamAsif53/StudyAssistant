import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap, Plus, Clock, Edit2, Trash2, X, Bell, BellOff, BellRing, Play
} from 'lucide-react';

// Web Audio Chime Sound Generator
const playChimeSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // High note G5 (783.99 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, ctx.currentTime);
    gain1.gain.setValueAtTime(0.35, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.7);

    // High note C6 (1046.50 Hz) played after 0.2s
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.2);
    gain2.gain.setValueAtTime(0.45, ctx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 1.1);
  } catch (e) {
    console.error('Audio playback error', e);
  }
};

export const ExamsView = () => {
  const { exams, subjects, addExam, updateExam, deleteExam, setActiveTab, addNotificationToHistory } = useApp();

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [date, setDate] = useState('');

  // Selection Mode Time Picker States (Hour / Minute / AM-PM)
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  // Live Timer Trigger (updates every 1s for accurate real-time countdown)
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Exam Notification Toggle State
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_exam_notifications_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_exam_notifications_enabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  // Persistent List of Notified Exam IDs (Guarantees notification fires ONLY ONCE, JUST ONE TIME!)
  const [notifiedExams, setNotifiedExams] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_notified_exams_once');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_notified_exams_once', JSON.stringify(notifiedExams));
  }, [notifiedExams]);

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

  // Accurate Live Countdown Calculation using Current Time & Exam Date + Time
  const calculateTimeRemaining = (examDateStr, examTimeStr) => {
    if (!examDateStr) return { days: 0, hours: 0, minutes: 0 };
    
    const [year, month, day] = examDateStr.split('-').map(Number);
    let h = 9;
    let m = 0;

    if (examTimeStr) {
      const match = examTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        h = parseInt(match[1], 10);
        m = parseInt(match[2], 10);
        const p = match[3].toUpperCase();
        if (p === 'PM' && h < 12) h += 12;
        if (p === 'AM' && h === 12) h = 0;
      }
    }

    const targetDate = new Date(year, month - 1, day, h, m, 0);
    const diff = targetDate.getTime() - new Date().getTime();

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return { days, hours, minutes };
  };

  // REAL-TIME 24-HOUR EXAM ALARM MONITOR (FIRES EXACTLY ONCE PER EXAM!)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!notificationsEnabled) return;

      const now = new Date();

      exams.forEach((exam) => {
        if (!exam.date) return;

        // Skip if this exam was ALREADY notified once!
        if (notifiedExams.includes(exam.id)) return;

        const [year, month, day] = exam.date.split('-').map(Number);
        let examHour = 9;
        let examMinute = 0;

        if (exam.time) {
          const timeParts = exam.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeParts) {
            let h = parseInt(timeParts[1], 10);
            const m = parseInt(timeParts[2], 10);
            const period = timeParts[3].toUpperCase();
            if (period === 'PM' && h < 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;
            examHour = h;
            examMinute = m;
          }
        }

        const examDateObj = new Date(year, month - 1, day, examHour, examMinute);
        const timeDiffMs = examDateObj.getTime() - now.getTime();
        const hoursRemaining = timeDiffMs / (1000 * 60 * 60);

        // Triggers EXACTLY ONCE at the 24-hour mark (when hours remaining <= 24 and > 0)
        if (hoursRemaining <= 24 && hoursRemaining > 0) {
          // Permanently mark exam as notified!
          setNotifiedExams(prev => [...prev, exam.id]);

          // Play Audio Chime
          playChimeSound();

          const displaySub = exam.subjectName || 'General';
          const displayTitle = exam.title;
          const timeStr = exam.time || '09:00 AM';

          // 1. Toast Notification
          setActiveToast({
            id: exam.id,
            title: `🎓 24-Hour Exam Alert!`,
            sub: displaySub,
            examTitle: displayTitle,
            date: exam.date,
            time: timeStr
          });

          // Add to Notification History (stored for 24 hours)
          if (addNotificationToHistory) {
            addNotificationToHistory(
              `🎓 24-Hour Exam Alert: ${displayTitle}`,
              `Your ${displaySub} exam is scheduled for tomorrow at ${timeStr} (${exam.date}).`,
              'exam'
            );
          }

          // 2. Native System Browser Notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`🎓 Exam Tomorrow: ${displayTitle}`, {
                body: `Your ${displaySub} exam (${displayTitle}) is tomorrow at ${timeStr}. Time for final review!`,
                icon: '/favicon.ico'
              });
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [exams, notificationsEnabled, notifiedExams]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingExamId(null);
    setTitle('');
    setSubjectName('');
    setDate('');
    setSelectedHour('09');
    setSelectedMinute('00');
    setSelectedPeriod('AM');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (exam) => {
    setEditingExamId(exam.id);
    setTitle(exam.title || '');
    setSubjectName(exam.subjectName || '');
    setDate(exam.date || '');

    if (exam.time) {
      const match = exam.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        setSelectedHour(match[1].padStart(2, '0'));
        setSelectedMinute(match[2].padStart(2, '0'));
        setSelectedPeriod(match[3].toUpperCase());
      }
    }
    setIsModalOpen(true);
  };

  // Save (Create or Edit) Exam Handler
  const handleSaveExam = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

    if (editingExamId) {
      updateExam(editingExamId, {
        title: title.trim(),
        subjectName: subjectName.trim() || 'General',
        date,
        time: formattedTime
      });
    } else {
      addExam({
        title: title.trim(),
        subjectName: subjectName.trim() || 'General',
        date,
        time: formattedTime
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-16 relative overflow-x-hidden">
      
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
                  <span className="text-xs font-bold text-white bg-[#2563EB] px-2 py-0.5 rounded">
                    🎓 Exam Tomorrow
                  </span>
                  <span className="text-xs font-semibold text-[#6B7280]">24 Hours Alert</span>
                </div>
                <h4 className="text-sm font-extrabold text-[#111827]">
                  {activeToast.examTitle} ({activeToast.sub})
                </h4>
                <p className="text-xs text-[#6B7280] font-medium">
                  Scheduled for tomorrow at <strong>{activeToast.time}</strong> ({activeToast.date}).
                </p>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E5E7EB] dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Exams
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track upcoming test schedules and get automatic 24-hour advance notifications.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* NOTIFICATION TOGGLE BUTTON */}
          <button
            onClick={handleToggleNotifications}
            className={`flex items-center gap-1.5 py-3 px-4 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
              notificationsEnabled
                ? 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-[#EF4444] dark:text-red-400 border border-red-200 dark:border-red-800/60'
                : 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
            }`}
            title={notificationsEnabled ? 'Disable 24-Hour Exam Notifications' : 'Enable 24-Hour Exam Notifications'}
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
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Schedule Exam
          </button>
        </div>
      </div>

      {/* Exam Cards */}
      <div className="space-y-4">
        {exams.length === 0 ? (
          <div className="saas-card p-12 text-center text-slate-400 text-xs space-y-3 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl">
            <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No upcoming exams scheduled.</p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#2563EB] text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Schedule First Exam
            </button>
          </div>
        ) : (
          exams.map((exam) => {
            const sub = subjects.find(s => s.id === exam.subjectId);
            const countdown = calculateTimeRemaining(exam.date, exam.time);
            const displaySubject = exam.subjectName || sub?.name || 'General';

            return (
              <div key={exam.id} className="saas-card p-5 space-y-4 relative bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl shadow-xs">
                
                {/* Header Info & Action Buttons */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-extrabold text-[10px] border border-blue-200 dark:border-blue-800/60">
                        {displaySubject}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-start">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {exam.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Scheduled: <span className="font-bold text-slate-700 dark:text-slate-300">{exam.date}</span> at <span className="font-bold text-[#2563EB] dark:text-blue-400">{exam.time}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    {/* Accurate Countdown Timer Block */}
                    <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
                      <div className="text-center px-2">
                        <span className="text-xl sm:text-2xl font-black text-[#2563EB] dark:text-blue-400">{countdown.days}</span>
                        <span className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-400">Days</span>
                      </div>
                      <span className="text-xl font-black text-slate-300 dark:text-slate-600">:</span>
                      <div className="text-center px-2">
                        <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">{countdown.hours}</span>
                        <span className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-400">Hrs</span>
                      </div>
                      <span className="text-xl font-black text-slate-300 dark:text-slate-600">:</span>
                      <div className="text-center px-2">
                        <span className="text-xl sm:text-2xl font-black text-pink-600 dark:text-pink-400">{countdown.minutes}</span>
                        <span className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-400">Mins</span>
                      </div>
                    </div>

                    {/* Edit Exam Button */}
                    <button
                      onClick={() => handleOpenEditModal(exam)}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#111827] dark:text-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                      title="Edit Exam"
                    >
                      <Edit2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                      <span>Edit</span>
                    </button>

                    {/* Red Delete Exam Button */}
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Schedule / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="saas-card w-[92vw] sm:w-full max-w-lg p-5 sm:p-6 bg-white dark:bg-slate-900 space-y-4 shadow-xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {editingExamId ? 'Edit Exam Schedule' : 'Schedule New Exam'}
            </h3>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Exam Title</label>
                <input
                  type="text"
                  placeholder="e.g. Physics Quantum Mechanics Final"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Physics, Mathematics..."
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                    required
                  />
                </div>

                {/* SELECTION MODE TIME PICKER (HOUR / MINUTE / AM-PM) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Time</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(e.target.value)}
                      className="h-10 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold cursor-pointer focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                    >
                      {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>

                    <select
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(e.target.value)}
                      className="h-10 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold cursor-pointer focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                    >
                      {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>

                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="h-10 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold cursor-pointer focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-md cursor-pointer hover:bg-blue-700"
                >
                  {editingExamId ? 'Save Changes' : 'Save Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
