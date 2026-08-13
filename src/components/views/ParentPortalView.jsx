import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users, CheckCircle2, Clock, Award, FileText, Download, TrendingUp, AlertTriangle
} from 'lucide-react';

export const ParentPortalView = () => {
  const { userProfile, subjects, homework } = useApp();

  const totalHours = subjects.reduce((acc, s) => acc + s.completedHours, 0);
  const totalTarget = subjects.reduce((acc, s) => acc + s.weeklyTarget, 0);
  const completedHw = homework.filter(h => h.status === 'Completed').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Parent Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Parent Monitoring Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Student Report: {userProfile.name}
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            {userProfile.school} • {userProfile.grade}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-emerald-800 font-bold text-xs shadow-md cursor-pointer hover:bg-slate-100 transition-all"
        >
          <Download className="w-4 h-4" /> Download Academic Summary (PDF)
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl text-center">
          <span className="text-xs font-extrabold text-slate-400 uppercase">Weekly Focus Hours</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalHours} / {totalTarget} hrs
          </div>
          <p className="text-xs text-slate-500 mt-1">Target progress</p>
        </div>

        <div className="glass-card p-6 rounded-3xl text-center">
          <span className="text-xs font-extrabold text-slate-400 uppercase">Homework Completion Rate</span>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {Math.round((completedHw / (homework.length || 1)) * 100)}%
          </div>
          <p className="text-xs text-slate-500 mt-1">{completedHw} of {homework.length} completed</p>
        </div>

        <div className="glass-card p-6 rounded-3xl text-center">
          <span className="text-xs font-extrabold text-slate-400 uppercase">Current Study Streak</span>
          <div className="text-3xl font-black text-amber-500 mt-1">
            {userProfile.streak} Days
          </div>
          <p className="text-xs text-slate-500 mt-1">Consistent daily habits</p>
        </div>
      </div>

      {/* Subject Performance Breakdown Table */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Subject Weekly Report</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 font-extrabold text-slate-400 uppercase">
                <th className="pb-3">Subject Name</th>
                <th className="pb-3">Teacher</th>
                <th className="pb-3">Logged Hours</th>
                <th className="pb-3">Target Hours</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/80 font-medium">
              {subjects.map(s => {
                const isMet = s.completedHours >= s.weeklyTarget;
                return (
                  <tr key={s.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-100">{s.name}</td>
                    <td className="py-3 text-slate-500">{s.teacher}</td>
                    <td className="py-3 font-bold text-indigo-500">{s.completedHours} hrs</td>
                    <td className="py-3 text-slate-500">{s.weeklyTarget} hrs</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isMet ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {isMet ? 'On Track' : 'Needs Focus'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
