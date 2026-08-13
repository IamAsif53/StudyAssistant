import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Pause, RotateCcw, CheckCircle2, Edit3, ArrowRight, Lightbulb, Check, Plus, Trash2, X } from 'lucide-react';

const STUDY_TIPS = [
  "Keep your phone away or in another room while studying.",
  "Take a 5-minute break for every 25 minutes of deep focus.",
  "Drink water regularly to stay hydrated and maintain cognitive focus.",
  "Write down quick distracting thoughts on paper to review after your study session.",
  "Review your notes within 24 hours of learning to maximize retention."
];

export const PomodoroView = () => {
  const { addXP, logStudyTime } = useApp();

  // User-created Focus Tasks queue (Persisted in localStorage)
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_focus_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_focus_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Modal State for Adding a New Task
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newEstimatedTime, setNewEstimatedTime] = useState(45);
  const [newPriority, setNewPriority] = useState('Medium');

  // Edit Task State
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editEstimatedTime, setEditEstimatedTime] = useState(45);
  const [editPriority, setEditPriority] = useState('Medium');

  // Task Queue: First task is Current Task; Remaining tasks are Next Tasks
  const currentTask = tasks.length > 0 ? tasks[0] : null;
  const nextTasks = tasks.length > 1 ? tasks.slice(1) : [];

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const initialMins = currentTask ? (currentTask.estimatedTime || 25) : 25;
    return initialMins * 60;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  // Synchronize Timer with Current Task's Estimated Time
  useEffect(() => {
    if (!isRunning && !isPaused) {
      const initialMins = currentTask ? (currentTask.estimatedTime || 25) : 25;
      setSecondsLeft(initialMins * 60);
    }
  }, [currentTask?.id, currentTask?.estimatedTime]);

  // Today's Progress State
  const [todayFocusMins, setTodayFocusMins] = useState(150);
  const [todayGoalMins] = useState(180);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(4);

  // Daily Study Tip Index
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    setTipIndex(dayOfYear % STUDY_TIPS.length);
  }, []);

  // Timer Ticking Logic
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      handleSessionCompleted();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const getStatusText = () => {
    if (isBreak) return 'Break';
    if (isRunning) return 'Studying';
    if (isPaused) return 'Paused';
    return 'Ready';
  };

  const statusText = getStatusText();

  // Handler: Add New Task
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: `ft-${Date.now()}`,
      subject: newSubject.trim() || 'General',
      title: newTitle.trim(),
      estimatedTime: Number(newEstimatedTime) || 45,
      priority: newPriority,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, newTask]);

    setNewSubject('');
    setNewTitle('');
    setNewEstimatedTime(45);
    setNewPriority('Medium');
    setIsAddModalOpen(false);

    addXP(25, 'Created Focus Task');
  };

  // Handler: Delete Task by ID
  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Handler: Mark Current Task as Completed
  const handleMarkCompleted = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    addXP(75, 'Completed Focus Task');
  };

  // Handler: Promote a Next Task to Current Task
  const handlePromoteToCurrent = (taskId) => {
    setTasks(prev => {
      const targetIdx = prev.findIndex(t => t.id === taskId);
      if (targetIdx <= 0) return prev;
      const targetTask = prev[targetIdx];
      const remaining = prev.filter(t => t.id !== taskId);
      return [targetTask, ...remaining];
    });
    setIsRunning(false);
    setIsPaused(false);
  };

  // Handler: Edit Task
  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditSubject(task.subject);
    setEditTitle(task.title);
    setEditEstimatedTime(task.estimatedTime);
    setEditPriority(task.priority);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setTasks(prev => prev.map(t => t.id === editingTaskId ? {
      ...t,
      subject: editSubject.trim() || 'General',
      title: editTitle.trim(),
      estimatedTime: Number(editEstimatedTime) || 45,
      priority: editPriority
    } : t));
    setEditingTaskId(null);
  };

  // Timer Controls
  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsBreak(false);
    const targetMins = currentTask ? (currentTask.estimatedTime || 25) : 25;
    setSecondsLeft(targetMins * 60);
  };

  const handleFinishSession = () => {
    setIsRunning(false);
    handleSessionCompleted();
  };

  const handleSessionCompleted = () => {
    setIsRunning(false);
    setIsPaused(false);
    const addedMins = currentTask ? currentTask.estimatedTime : 25;
    setTodayFocusMins(prev => prev + addedMins);
    setCompletedSessionsCount(prev => prev + 1);
    addXP(50, 'Completed Focus Session');
    setShowCompletionPopup(true);
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatHoursMins = (mins) => {
    const h = (mins / 60).toFixed(1).replace('.0', '');
    return `${h} Hours`;
  };

  const progressPct = Math.min(100, Math.round((todayFocusMins / todayGoalMins) * 100));

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-300 pb-16">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Focus Session
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] font-medium mt-1">
            Stay focused on one task at a time.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* 1. CURRENT TASK CARD */}
      <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            Current Task
          </span>

          {currentTask && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              currentTask.priority === 'High'
                ? 'bg-red-50 text-[#EF4444] border border-red-100'
                : currentTask.priority === 'Medium'
                ? 'bg-amber-50 text-[#F59E0B] border border-amber-100'
                : 'bg-slate-100 text-[#6B7280]'
            }`}>
              {currentTask.priority} Priority
            </span>
          )}
        </div>

        {!currentTask ? (
          /* Empty Current Task State */
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-[#6B7280] font-medium">
              No task scheduled right now. Create your first task to start focusing!
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Task</span>
            </button>
          </div>
        ) : editingTaskId === currentTask.id ? (
          /* Edit Current Task Form */
          <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#111827] mb-1">Subject Name</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-medium text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#111827] mb-1">Est. Time (Mins)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={editEstimatedTime}
                  onChange={(e) => setEditEstimatedTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-medium text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#111827] mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-medium text-xs"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#111827] mb-1">Task Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] font-medium text-xs"
                required
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingTaskId(null)}
                className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] text-[#6B7280] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#2563EB] text-white font-semibold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* Render Active Current Task */
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                {currentTask.subject}
              </span>
              <span className="text-xs text-[#6B7280] font-medium">
                Estimated Time: <strong className="text-[#111827]">{currentTask.estimatedTime} minutes</strong>
              </span>
            </div>

            <h2 className={`text-lg sm:text-xl font-extrabold text-[#111827] ${currentTask.completed ? 'line-through text-[#6B7280]' : ''}`}>
              {currentTask.title}
            </h2>

            {/* Current Task Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={() => handleStartEdit(currentTask)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC] font-semibold text-xs cursor-pointer transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Edit Task</span>
              </button>

              <button
                onClick={() => handleMarkCompleted(currentTask.id)}
                disabled={currentTask.completed}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs cursor-pointer transition-colors ${
                  currentTask.completed
                    ? 'bg-emerald-100 text-[#22C55E] cursor-not-allowed'
                    : 'bg-[#22C55E] hover:bg-emerald-600 text-white shadow-xs'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{currentTask.completed ? 'Completed ✓' : 'Mark as Completed'}</span>
              </button>

              {/* DELETE TASK BUTTON */}
              <button
                onClick={() => handleDeleteTask(currentTask.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#EF4444] border border-red-200 font-semibold text-xs cursor-pointer transition-colors ml-auto"
                title="Delete Current Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. FOCUS TIMER CARD (Synchronized with Current Task Heading & Estimated Time) */}
      <div className="bg-white rounded-xl p-6 sm:p-8 text-center border border-[#E5E7EB] shadow-xs space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
          Focus Timer
        </span>

        {/* Heading of Current Task Displayed Above Digital Clock */}
        {currentTask ? (
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block">
              {currentTask.subject}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#111827]">
              {currentTask.title}
            </h3>
          </div>
        ) : (
          <p className="text-xs text-[#6B7280] italic">No active task selected</p>
        )}

        {/* Large Digital Timer synced to Task Estimated Time */}
        <div className="py-2">
          <div className="text-6xl sm:text-8xl font-extrabold font-mono text-[#111827] tracking-tight">
            {formatTime(secondsLeft)}
          </div>

          {/* Current Status Pill */}
          <div className="mt-4">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold ${
              statusText === 'Studying'
                ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                : statusText === 'Paused'
                ? 'bg-amber-50 text-[#F59E0B] border border-amber-200'
                : statusText === 'Break'
                ? 'bg-emerald-50 text-[#22C55E] border border-emerald-200'
                : 'bg-slate-100 text-[#6B7280]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                statusText === 'Studying' ? 'bg-[#2563EB] animate-pulse' : statusText === 'Break' ? 'bg-[#22C55E]' : 'bg-[#6B7280]'
              }`} />
              Current Status: {statusText}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-amber-600 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC] font-semibold text-sm cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-[#6B7280]" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleFinishSession}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-white font-semibold text-sm shadow-xs cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Finish Session</span>
          </button>
        </div>
      </div>

      {/* 3. TODAY'S PROGRESS CARD */}
      <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Today's Progress
          </span>
          <span className="text-xs font-semibold text-[#6B7280]">
            Goal: <strong className="text-[#111827]">3 Hours</strong>
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div className="text-xl font-bold text-[#111827]">
            {(todayFocusMins / 60).toFixed(1).replace('.0', '')} / 3 Hours
          </div>
          <span className="text-xs font-bold text-[#2563EB]">
            {progressPct}%
          </span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-3 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#E5E7EB]">
          <div
            className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-[#6B7280] font-medium pt-1">
          <span>Completed Sessions</span>
          <strong className="text-[#111827] font-bold text-sm">{completedSessionsCount}</strong>
        </div>
      </div>

      {/* 4. NEXT TASKS QUEUE CARD */}
      <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Next Tasks ({nextTasks.length})
          </span>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Next Task
          </button>
        </div>

        {nextTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#6B7280] italic">
            No upcoming tasks in queue. Click "+ Add Task" to schedule your next task.
          </div>
        ) : (
          <div className="space-y-3">
            {nextTasks.map((t, idx) => (
              <div key={t.id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {t.subject}
                    </span>
                    <span className="text-[11px] font-semibold text-[#6B7280]">
                      #{idx + 1} in Queue
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#111827]">{t.title}</h3>
                  <p className="text-xs text-[#6B7280]">
                    Estimated Time: <strong className="text-[#111827]">{t.estimatedTime} Minutes</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePromoteToCurrent(t.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Start Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#EF4444] border border-red-200 cursor-pointer transition-colors"
                    title="Delete Next Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. STUDY TIP CARD */}
      <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-xs flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-[#111827] block">💡 Study Tip</span>
          <p className="text-xs text-[#6B7280] font-medium leading-relaxed">
            {STUDY_TIPS[tipIndex]}
          </p>
        </div>
      </div>

      {/* MODAL: CREATE NEW FOCUS TASK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-[92vw] sm:w-full max-w-md p-5 sm:p-6 border border-[#E5E7EB] shadow-xl space-y-4 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-[#6B7280] hover:text-[#111827] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#111827]">
              Create Focus Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-[#111827] mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Physics, English..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#111827] mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Solve Integration Exercise 4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Est. Time (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={newEstimatedTime}
                    onChange={(e) => setNewEstimatedTime(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#111827] mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm font-medium"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-[#E5E7EB] text-[#6B7280] font-semibold cursor-pointer text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#2563EB] text-white font-semibold cursor-pointer hover:bg-blue-700 text-xs sm:text-sm shadow-xs"
                >
                  {tasks.length === 0 ? 'Set Current Task' : 'Add to Next Tasks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SESSION END COMPLETION POPUP */}
      {showCompletionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-[#E5E7EB] shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#22C55E] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-[#111827]">Great Job!</h3>
              <p className="text-xs text-[#6B7280]">You completed <strong className="text-[#111827]">{currentTask ? currentTask.estimatedTime : 25} minutes</strong></p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1 text-xs text-[#6B7280]">
              <div>Today's Focus: <strong className="text-[#111827]">{formatHoursMins(todayFocusMins)}</strong></div>
              <div className="text-[#22C55E] font-semibold flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" /> Task Progress Updated
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowCompletionPopup(false);
                  setIsBreak(true);
                  setSecondsLeft(5 * 60);
                  handleStart();
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-[#111827] font-semibold text-xs cursor-pointer hover:bg-[#F8FAFC]"
              >
                Start Break
              </button>
              <button
                onClick={() => {
                  setShowCompletionPopup(false);
                  handleReset();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-xs cursor-pointer hover:bg-blue-700 shadow-xs"
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
