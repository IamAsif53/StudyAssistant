import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck, Users, Megaphone, FolderOpen, BarChart3, Plus, Trash2, CheckCircle2
} from 'lucide-react';

export const AdminPortalView = () => {
  const { subjects, homework, userProfile } = useApp();

  const [announcements, setAnnouncements] = useState([
    { id: 'ann-1', title: 'Midterm Exam Schedule Released', date: '2026-08-07', author: 'System Admin' },
    { id: 'ann-2', title: 'New Physics Lab Worksheets Uploaded', date: '2026-08-05', author: 'Dr. Feynman' }
  ]);

  const [annTitle, setAnnTitle] = useState('');

  const handleAddAnn = (e) => {
    e.preventDefault();
    if (!annTitle.trim()) return;
    setAnnouncements([{ id: `ann-${Date.now()}`, title: annTitle, date: new Date().toISOString().split('T')[0], author: 'System Admin' }, ...announcements]);
    setAnnTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-200 font-extrabold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> System Administrator Panel
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Platform Operations & User Management
          </h1>
        </div>
      </div>

      {/* System Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl text-center">
          <span className="text-xs font-bold text-slate-400 uppercase">Active Students</span>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">1,248</div>
        </div>
        <div className="glass-card p-5 rounded-2xl text-center">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Subjects</span>
          <div className="text-2xl font-black text-indigo-500 mt-1">{subjects.length}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl text-center">
          <span className="text-xs font-bold text-slate-400 uppercase">Assignments Created</span>
          <div className="text-2xl font-black text-purple-500 mt-1">{homework.length}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl text-center">
          <span className="text-xs font-bold text-slate-400 uppercase">System Status</span>
          <div className="text-2xl font-black text-emerald-500 mt-1">99.9% Healthy</div>
        </div>
      </div>

      {/* Platform Announcement Manager */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-500" /> Broadcast System Announcements
        </h3>

        <form onSubmit={handleAddAnn} className="flex gap-2">
          <input
            type="text"
            placeholder="Type platform announcement..."
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer"
          >
            Post Announcement
          </button>
        </form>

        <div className="space-y-2 pt-2">
          {announcements.map(ann => (
            <div key={ann.id} className="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-800/40 border flex justify-between items-center text-xs">
              <div>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{ann.title}</span>
                <span className="block text-[10px] text-slate-400">Posted on {ann.date} by {ann.author}</span>
              </div>
              <button
                onClick={() => setAnnouncements(announcements.filter(a => a.id !== ann.id))}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
