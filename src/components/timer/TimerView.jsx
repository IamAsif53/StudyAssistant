import React, { useState, useEffect, useRef } from 'react';
import { Timer as TimerIcon, Play, Pause, RotateCcw, Clock, Sparkles, CheckCircle2, Bell, Zap } from 'lucide-react';
import { deviceNotificationService } from '../../services/deviceNotificationService';

const PRESETS = [
  { label: '15 Mins', minutes: 15 },
  { label: '25 Mins (Pomodoro)', minutes: 25 },
  { label: '45 Mins', minutes: 45 },
  { label: '60 Mins', minutes: 60 }
];

export const TimerView = () => {
  const [sessionTitle, setSessionTitle] = useState('Study Session');
  const [mode, setMode] = useState('preset'); // 'preset' | 'endtime' | 'custom'

  // Input states
  const [selectedPreset, setSelectedPreset] = useState(25);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(30);
  
  // End Time Input state (default HH:mm string for today)
  const [endTimeInput, setEndTimeInput] = useState(() => {
    const d = new Date(Date.now() + 25 * 60 * 1000);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });

  // Timer Running State
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [targetTimestamp, setTargetTimestamp] = useState(null);
  const [initialTotalSeconds, setInitialTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef(null);

  // Restore Active Timer from LocalStorage on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ssp_active_timer_v1');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.targetTimestamp && data.targetTimestamp > Date.now()) {
          setSessionTitle(data.sessionTitle || 'Study Session');
          setTargetTimestamp(data.targetTimestamp);
          setInitialTotalSeconds(data.initialTotalSeconds);
          const rem = Math.max(0, Math.floor((data.targetTimestamp - Date.now()) / 1000));
          setRemainingSeconds(rem);
          setIsRunning(true);
          setIsPaused(data.isPaused || false);
        } else if (data.targetTimestamp && data.targetTimestamp <= Date.now()) {
          localStorage.removeItem('ssp_active_timer_v1');
        }
      }
    } catch (e) {}
  }, []);

  // Main Live Countdown Ticker
  useEffect(() => {
    if (isRunning && !isPaused && targetTimestamp) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((targetTimestamp - now) / 1000);

        if (diff <= 0) {
          clearInterval(timerRef.current);
          setRemainingSeconds(0);
          setIsRunning(false);
          setIsFinished(true);
          localStorage.removeItem('ssp_active_timer_v1');
        } else {
          setRemainingSeconds(diff);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, isPaused, targetTimestamp]);

  // Helper: Calculate Target Timestamp based on current selection mode
  const calculateTargetEndTime = () => {
    const now = Date.now();
    let totalSecs = 0;
    let targetTime = now;

    if (mode === 'preset') {
      totalSecs = selectedPreset * 60;
      targetTime = now + totalSecs * 1000;
    } else if (mode === 'custom') {
      totalSecs = customHours * 3600 + customMinutes * 60;
      if (totalSecs <= 0) totalSecs = 60;
      targetTime = now + totalSecs * 1000;
    } else if (mode === 'endtime') {
      const [h, m] = endTimeInput.split(':').map(Number);
      const targetDate = new Date();
      targetDate.setHours(h, m, 0, 0);

      // If selected end time is earlier than current time today, assume tomorrow
      if (targetDate.getTime() <= now) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      targetTime = targetDate.getTime();
      totalSecs = Math.max(1, Math.floor((targetTime - now) / 1000));
    }

    return { totalSecs, targetTime };
  };

  // Start Timer Action
  const handleStartTimer = async () => {
    const { totalSecs, targetTime } = calculateTargetEndTime();

    setInitialTotalSeconds(totalSecs);
    setRemainingSeconds(totalSecs);
    setTargetTimestamp(targetTime);
    setIsRunning(true);
    setIsPaused(false);
    setIsFinished(false);

    // Save timer state to localStorage
    const timerData = {
      sessionTitle,
      targetTimestamp: targetTime,
      initialTotalSeconds: totalSecs,
      isPaused: false
    };
    localStorage.setItem('ssp_active_timer_v1', JSON.stringify(timerData));

    // Schedule Native Android OS Status Bar Alarm for exact end time
    const timerAlarmId = 999100 + (Date.now() % 10000);
    await deviceNotificationService.scheduleTimerAlarm({
      id: timerAlarmId,
      title: `⏱️ Study Timer Complete!`,
      body: `Time is up for ${sessionTitle || 'your study session'}! Great job focusing. Take a break!`,
      triggerAtMillis: targetTime
    });
  };

  // Pause / Resume Action
  const handleTogglePause = () => {
    if (isPaused) {
      // Resuming
      const newTarget = Date.now() + remainingSeconds * 1000;
      setTargetTimestamp(newTarget);
      setIsPaused(false);

      const timerData = {
        sessionTitle,
        targetTimestamp: newTarget,
        initialTotalSeconds,
        isPaused: false
      };
      localStorage.setItem('ssp_active_timer_v1', JSON.stringify(timerData));

      // Reschedule Native Alarm
      deviceNotificationService.scheduleTimerAlarm({
        id: 999100 + (Date.now() % 10000),
        title: `⏱️ Study Timer Complete!`,
        body: `Time is up for ${sessionTitle || 'your study session'}! Great job focusing!`,
        triggerAtMillis: newTarget
      });
    } else {
      // Pausing
      setIsPaused(true);
      const timerData = {
        sessionTitle,
        targetTimestamp,
        initialTotalSeconds,
        isPaused: true
      };
      localStorage.setItem('ssp_active_timer_v1', JSON.stringify(timerData));
    }
  };

  // Reset / Cancel Action
  const handleResetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    setTargetTimestamp(null);
    localStorage.removeItem('ssp_active_timer_v1');
  };

  // Time Formatter (HH:MM:SS)
  const formatSeconds = (totalSecs) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // End Time String Formatter
  const formatEndTimeDisplay = () => {
    if (!targetTimestamp) return '';
    const d = new Date(targetTimestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Circular Progress Calculation
  const progressPercent = initialTotalSeconds > 0
    ? Math.max(0, Math.min(100, (remainingSeconds / initialTotalSeconds) * 100))
    : 0;

  const strokeDashoffset = 565.48 - (565.48 * progressPercent) / 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* HEADER CARD */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <TimerIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Focus Study Timer
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Set target end time or duration with background Android OS alarms!
            </p>
          </div>
        </div>

        {/* System Notification Status Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
          <Bell className="w-4 h-4" />
          <span>Status Bar Alarms Active</span>
        </div>
      </div>

      {/* FINISHED NOTIFICATION BANNER */}
      {isFinished && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-xl flex items-center justify-between gap-4 animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 shrink-0 text-emerald-100" />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                🎉 Timer Complete! Great Job!
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                You finished your study session ({sessionTitle}). Take a well-deserved break!
              </p>
            </div>
          </div>
          <button
            onClick={handleResetTimer}
            className="px-4 py-2 bg-white text-emerald-700 font-extrabold text-xs rounded-xl hover:bg-emerald-50 transition-all cursor-pointer shadow-xs shrink-0"
          >
            Start New Session
          </button>
        </div>
      )}

      {/* MAIN TIMER CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: SETUP & CONTROLS */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Timer Setup</span>
          </h2>

          {/* Session Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Session / Subject Name
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              disabled={isRunning}
              placeholder="e.g. Mathematics Chapter 4"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Mode Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Selection Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setMode('preset')}
                disabled={isRunning}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'preset'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setMode('endtime')}
                disabled={isRunning}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'endtime'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                End Time
              </button>
              <button
                onClick={() => setMode('custom')}
                disabled={isRunning}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'custom'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* MODE 1: PRESETS */}
          {mode === 'preset' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {PRESETS.map((p) => (
                <button
                  key={p.minutes}
                  onClick={() => setSelectedPreset(p.minutes)}
                  disabled={isRunning}
                  className={`py-3 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                    selectedPreset === p.minutes
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* MODE 2: SET TARGET END TIME */}
          {mode === 'endtime' && (
            <div className="space-y-2 pt-1 bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <label className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Select Target End Time</span>
              </label>
              <input
                type="time"
                value={endTimeInput}
                onChange={(e) => setEndTimeInput(e.target.value)}
                disabled={isRunning}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-extrabold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                The timer will countdown until this exact time and trigger a status bar alarm!
              </p>
            </div>
          )}

          {/* MODE 3: CUSTOM DURATION */}
          {mode === 'custom' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={customHours}
                  onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isRunning}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Minutes
                </label>
                <input
                  type="number"
                  min="1"
                  max="59"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isRunning}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-2 space-y-2">
            {!isRunning ? (
              <button
                onClick={handleStartTimer}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.98]"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Focus Timer</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTogglePause}
                  className="py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={handleResetTimer}
                  className="py-3 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Cancel / Reset</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: CLOCK DISPLAY & PROGRESS RING */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[380px]">
          
          {/* Circular Countdown SVG Ring */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background Track Circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                className="text-slate-100 dark:text-slate-800 stroke-current"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Foreground Animated Ring */}
              <circle
                cx="100"
                cy="100"
                r="90"
                className="text-blue-600 dark:text-blue-400 stroke-current transition-all duration-1000 ease-linear"
                strokeWidth="12"
                strokeDasharray="565.48"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Clock Text Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <span className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-slate-900 dark:text-white">
                {formatSeconds(remainingSeconds)}
              </span>

              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-widest">
                {isRunning ? (isPaused ? 'PAUSED' : 'FOCUSING...') : 'READY'}
              </span>

              {targetTimestamp && isRunning && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span>Target: {formatEndTimeDisplay()}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm">
            {isRunning
              ? `Session "${sessionTitle}" is active. Status bar notification will alert you when time is up!`
              : 'Configure your end time or duration on the left and tap Start Focus Timer.'}
          </p>
        </div>

      </div>

    </div>
  );
};
