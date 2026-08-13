import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, Clock, CheckSquare, Target, BookOpen } from 'lucide-react';

export const AnalyticsView = () => {
  const { subjects, homework } = useApp();

  const totalCompletedHours = subjects.reduce((acc, s) => acc + s.completedHours, 0);
  const totalTargetHours = subjects.reduce((acc, s) => acc + s.weeklyTarget, 0);
  const completedHwCount = homework.filter(h => h.status === 'Completed').length;
  const hwPct = Math.round((completedHwCount / (homework.length || 1)) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-300 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Study Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Simple overview of your study time, homework completion, and subject breakdown.
        </p>
      </div>

      {/* 4 Clean Minimal Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Weekly Study Hours */}
        <div className="card-minimal p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Weekly Study Hours</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalCompletedHours} <span className="text-xs font-normal text-slate-400">/ {totalTargetHours} hrs</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, Math.round((totalCompletedHours / totalTargetHours) * 100))}%` }} />
          </div>
        </div>

        {/* 2. Homework Completion */}
        <div className="card-minimal p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Homework Completed</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {completedHwCount} <span className="text-xs font-normal text-slate-400">/ {homework.length} tasks</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${hwPct}%` }} />
          </div>
        </div>

        {/* 3. Focus Sessions */}
        <div className="card-minimal p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Focus Time Today</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            1.5 <span className="text-xs font-normal text-slate-400">hours</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">3 sessions finished</p>
        </div>

        {/* 4. Active Subjects */}
        <div className="card-minimal p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Subjects</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {subjects.length} <span className="text-xs font-normal text-slate-400">courses</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">All targets configured</p>
        </div>

      </div>

      {/* Subject Progress Chart Breakdown */}
      <div className="card-minimal p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" /> Subject Progress Breakdown
        </h2>

        <div className="space-y-3">
          {subjects.map((sub) => {
            const pct = Math.min(100, Math.round((sub.completedHours / sub.weeklyTarget) * 100));
            return (
              <div key={sub.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                    {sub.name}
                  </span>
                  <span>{sub.completedHours} / {sub.weeklyTarget} hrs ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
