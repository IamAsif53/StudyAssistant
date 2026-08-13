import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Target, Plus, CheckCircle2, Award, Calendar, Sparkles } from 'lucide-react';

export const GoalsView = () => {
  const { goals, addGoal, toggleGoalCompleted } = useApp();

  const [activeType, setActiveType] = useState('Daily'); // 'Daily', 'Weekly', 'Monthly'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Daily');
  const [target, setTarget] = useState(5);
  const [unit, setUnit] = useState('tasks');

  const filtered = goals.filter(g => g.type === activeType);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({ title, type, target: Number(target), unit });
    setTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
            Goal Tracker & Milestones
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set daily, weekly, and monthly targets to build sustainable academic discipline.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Set New Goal
        </button>
      </div>

      {/* Goal Type Tabs */}
      <div className="flex items-center gap-2">
        {['Daily', 'Weekly', 'Monthly'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
              activeType === t
                ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-md shadow-amber-500/25 scale-105'
                : 'glass-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t} Goals ({goals.filter(g => g.type === t).length})
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((goal) => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));

          return (
            <div key={goal.id} className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleGoalCompleted(goal.id)}
                    className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      goal.completed ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-400'
                    }`}
                  >
                    {goal.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <h3 className={`font-extrabold text-base ${goal.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                    {goal.title}
                  </h3>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500">
                  {goal.type}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Target Progress</span>
                  <span>{goal.current} / {goal.target} {goal.unit} ({pct}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4">
              Set New Goal Target
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Study 3 Hours or Solve 30 Math Questions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Goal Horizon</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-semibold"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Target Number</label>
                  <input
                    type="number"
                    min="1"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="hours / tasks"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-md cursor-pointer hover:bg-amber-600"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
