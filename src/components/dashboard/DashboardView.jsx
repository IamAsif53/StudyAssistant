import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon, Clock, CheckSquare, GraduationCap,
  Target, BookOpen, CheckCircle2, ArrowRight, Flame, FileText, Plus
} from 'lucide-react';

export const DashboardView = () => {
  const {
    userProfile,
    subjects,
    homework,
    exams,
    studySessions,
    goals,
    notes,
    toggleHomeworkStatus,
    setActiveTab,
    setIsQuickAddOpen
  } = useApp();

  const pendingHomework = homework.filter(h => h.status !== 'Completed');
  const completedHomework = homework.filter(h => h.status === 'Completed');
  const completedCount = completedHomework.length;
  const totalHomework = homework.length;
  const completionPct = totalHomework > 0 ? Math.round((completedCount / totalHomework) * 100) : 0;

  const totalTargetHours = subjects.reduce((acc, s) => acc + (s.weeklyTarget || 0), 0);
  const totalCompletedHours = subjects.reduce((acc, s) => acc + (s.completedHours || 0), 0);

  const upcomingExamsList = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 animate-in fade-in duration-200 pb-12">
      
      {/* TOP ROW: Welcome Banner & Today's Goal Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Welcome Card - Soft Blue Tint */}
        <div className="lg:col-span-2 saas-card bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40 border border-blue-100/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Student Dashboard</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Good Morning, {userProfile.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              You have a great day to learn something new.
            </p>
          </div>

          <div className="hidden sm:block w-px h-12 bg-blue-100" />

          {/* Quote Block */}
          <div className="text-left sm:text-right space-y-0.5">
            <p className="text-xs italic text-slate-600 font-medium max-w-xs">
              “ The expert in anything was once a beginner. ”
            </p>
            <span className="text-[11px] text-blue-600 font-bold block">— Helen Hayes</span>
          </div>
        </div>

        {/* Today's Goal Card - Soft Emerald Tint */}
        <div className="saas-card bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/40 border border-emerald-100/80 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Today's Goal</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Active Target</span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="text-lg font-extrabold text-slate-800">
              Study 3.5 hours
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-emerald-100">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '71%' }} />
            </div>
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600">
              <span>2.5 / 3.5 hrs</span>
              <span className="text-emerald-600 font-bold">71% Reached</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECOND ROW: 4 METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Study Hours Today */}
        <div className="saas-card p-5 space-y-3 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Study Hours Today</span>
              <div className="text-2xl font-black text-slate-800 mt-0.5">{totalCompletedHours} hrs</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium">Goal: {totalTargetHours || 3.5} hrs weekly</p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, Math.round((totalCompletedHours / (totalTargetHours || 1)) * 100))}%` }} />
          </div>
        </div>

        {/* Card 2: Tasks Completed */}
        <div className="saas-card p-5 space-y-3 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tasks Completed</span>
              <div className="text-2xl font-black text-slate-800 mt-0.5">{completedCount} / {totalHomework}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-semibold">{completionPct}% Completed</p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {/* Card 3: Homework Due */}
        <div className="saas-card p-5 space-y-3 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Homework Due</span>
              <div className="text-2xl font-black text-slate-800 mt-0.5">{pendingHomework.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-amber-600 font-semibold">
            {pendingHomework.filter(h => h.priority === 'High').length} High Priority
          </p>
        </div>

        {/* Card 4: Upcoming Exams */}
        <div className="saas-card p-5 space-y-3 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Upcoming Exams</span>
              <div className="text-2xl font-black text-slate-800 mt-0.5">{exams.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-purple-600 font-semibold">
            {upcomingExamsList[0] ? `Next: ${upcomingExamsList[0].date}` : 'No exams scheduled'}
          </p>
        </div>

      </div>

      {/* THIRD ROW: Today's Schedule & Homework / Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Schedule & Subject Overview */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Today's Schedule Card */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-base">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <span>Today's Schedule</span>
              </div>
              <button onClick={() => setActiveTab('planner')} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                View Planner <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Timeline List */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-100">
              {studySessions.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2">No study sessions scheduled for today.</div>
              ) : (
                studySessions.slice(0, 5).map((session, idx) => {
                  const sub = subjects.find(s => s.id === session.subjectId);
                  const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-slate-400', 'bg-purple-600', 'bg-amber-500'];
                  const dotColor = colors[idx % colors.length];

                  return (
                    <div key={session.id} className="relative flex items-center justify-between">
                      <span className={`absolute -left-[21px] w-3 h-3 rounded-full ${dotColor} ring-4 ring-white`} />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">{session.topic}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{sub?.name || 'General'} • Goal: {session.goal}</p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                        {session.startTime} - {session.endTime}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Subject Overview Card */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-800 text-base">Subject Overview</span>
              <button onClick={() => setActiveTab('subjects')} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {subjects.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs space-y-2">
                <p>No subjects added yet.</p>
                <button onClick={() => setActiveTab('subjects')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs">
                  + Add Subject
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {subjects.slice(0, 4).map((sub) => {
                  const pct = Math.min(100, Math.round((sub.completedHours / (sub.weeklyTarget || 1)) * 100));
                  return (
                    <div key={sub.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <span className="text-xs font-bold text-slate-800 block truncate">{sub.name}</span>
                      <div className="text-lg font-black text-blue-600">{pct}%</div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Homework & Exams */}
        <div className="space-y-5">
          
          {/* Homework Due Card */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-800 text-base">Homework Due</span>
              <button onClick={() => setActiveTab('homework')} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingHomework.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">No pending homework due! 🎉</div>
              ) : (
                pendingHomework.slice(0, 4).map((hw) => {
                  const sub = subjects.find(s => s.id === hw.subjectId);
                  return (
                    <div key={hw.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                          onChange={() => toggleHomeworkStatus(hw.id)}
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 truncate max-w-[160px]">{hw.title}</h4>
                          <p className="text-[11px] text-slate-500">{sub?.name || 'General'} • Due: {hw.dueDate}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hw.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {hw.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Exams Card */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-800 text-base">Upcoming Exams</span>
              <button onClick={() => setActiveTab('exams')} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingExamsList.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">No upcoming exams.</div>
              ) : (
                upcomingExamsList.slice(0, 3).map((exam) => {
                  const diff = new Date(exam.date) - new Date();
                  const dLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                  return (
                    <div key={exam.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{exam.title}</h4>
                        <p className="text-[11px] text-slate-500">
                          {exam.date} • <span className="font-semibold text-emerald-600">{dLeft} Days Left</span>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
