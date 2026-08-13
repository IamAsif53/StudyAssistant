import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SSC_SUBJECTS_SYLLABUS, SYLLABUS_MILESTONES } from '../../data/sscSyllabusData';
import {
  BookCheck, CheckCircle2, RotateCcw,
  Sparkles, Award, Target, BookOpen, Layers, CheckSquare, Search
} from 'lucide-react';

export const SyllabusView = () => {
  const {
    syllabusProgress = {},
    toggleSyllabusMilestone,
    toggleAllChapterMilestones,
    resetSubjectProgress
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState(SSC_SUBJECTS_SYLLABUS[0].id);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [chapterSearch, setChapterSearch] = useState('');

  // Selected Subject Data
  const currentSubject = useMemo(() => {
    return SSC_SUBJECTS_SYLLABUS.find(s => s.id === selectedSubjectId) || SSC_SUBJECTS_SYLLABUS[0];
  }, [selectedSubjectId]);

  // Categories list
  const categories = ['All', 'Science', 'Compulsory'];

  // Filtered Subjects based on Category
  const filteredSubjects = useMemo(() => {
    if (selectedCategory === 'All') return SSC_SUBJECTS_SYLLABUS;
    return SSC_SUBJECTS_SYLLABUS.filter(s => s.category === selectedCategory);
  }, [selectedCategory]);

  // Calculate stats for a specific subject
  const getSubjectStats = (subject) => {
    let totalMilestones = subject.chapters.length * 4;
    let completedMilestones = 0;
    let chaptersCompleted = 0;

    subject.chapters.forEach(ch => {
      const prog = syllabusProgress[ch.id] || { read: false, cq: false, mcq: false, board: false };
      const count = (prog.read ? 1 : 0) + (prog.cq ? 1 : 0) + (prog.mcq ? 1 : 0) + (prog.board ? 1 : 0);
      completedMilestones += count;
      if (count === 4) chaptersCompleted++;
    });

    const percentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    return { totalMilestones, completedMilestones, chaptersCompleted, percentage };
  };

  // Overall SSC Readiness Stats Across ALL Subjects
  const overallStats = useMemo(() => {
    let totalMilestones = 0;
    let completedMilestones = 0;
    let totalChapters = 0;
    let chaptersCompleted = 0;
    let totalRead = 0, totalCQ = 0, totalMCQ = 0, totalBoard = 0;

    SSC_SUBJECTS_SYLLABUS.forEach(sub => {
      sub.chapters.forEach(ch => {
        totalChapters++;
        totalMilestones += 4;
        const prog = syllabusProgress[ch.id] || { read: false, cq: false, mcq: false, board: false };
        if (prog.read) { totalRead++; completedMilestones++; }
        if (prog.cq) { totalCQ++; completedMilestones++; }
        if (prog.mcq) { totalMCQ++; completedMilestones++; }
        if (prog.board) { totalBoard++; completedMilestones++; }
        if (prog.read && prog.cq && prog.mcq && prog.board) chaptersCompleted++;
      });
    });

    const percentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    return {
      totalChapters, chaptersCompleted,
      totalMilestones, completedMilestones,
      percentage,
      totalRead, totalCQ, totalMCQ, totalBoard
    };
  }, [syllabusProgress]);

  // Current Subject Stats
  const currentSubjectStats = useMemo(() => {
    return getSubjectStats(currentSubject);
  }, [currentSubject, syllabusProgress]);

  // Filtered Chapters for Current Subject
  const filteredChapters = useMemo(() => {
    if (!chapterSearch.trim()) return currentSubject.chapters;
    const query = chapterSearch.toLowerCase();
    return currentSubject.chapters.filter(ch =>
      ch.name.toLowerCase().includes(query) || ch.num.toString().includes(query)
    );
  }, [currentSubject, chapterSearch]);

  // Check if all chapters in current subject are checked
  const isAllCurrentSubjectChecked = useMemo(() => {
    return currentSubject.chapters.every(ch => {
      const prog = syllabusProgress[ch.id];
      return prog && prog.read && prog.cq && prog.mcq && prog.board;
    });
  }, [currentSubject, syllabusProgress]);

  const handleToggleCheckAllSubject = () => {
    const nextState = !isAllCurrentSubjectChecked;
    currentSubject.chapters.forEach(ch => {
      toggleAllChapterMilestones(ch.id, nextState);
    });
  };

  const handleResetSubject = () => {
    const ids = currentSubject.chapters.map(ch => ch.id);
    resetSubjectProgress(ids);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-20 overflow-x-hidden">
      
      {/* 🏆 TOP OVERVIEW DASHBOARD HEADER */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 sm:p-6 border border-[#E5E7EB] dark:border-slate-800 shadow-xs space-y-4 sm:space-y-5 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
          
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-extrabold text-xs border border-blue-200 dark:border-blue-800/60 inline-flex items-center gap-1.5">
                <BookCheck className="w-4 h-4" /> SSC Board Exam Tracker
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800/60">
                Official NCTB Curriculum
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-[#111827] dark:text-white tracking-tight break-words">
              SSC Syllabus & Chapter Readiness Tracker
            </h1>
          </div>

          {/* Overall Completion Circle Badge */}
          <div className="flex items-center gap-3 sm:gap-4 bg-[#F8FAFC] dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shrink-0 min-w-0">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
              <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="5" className="text-slate-200 dark:text-slate-700 fill-none sm:hidden" />
                <circle
                  cx="28" cy="28" r="22"
                  stroke="currentColor" strokeWidth="5"
                  strokeDasharray={138}
                  strokeDashoffset={138 - (138 * overallStats.percentage) / 100}
                  strokeLinecap="round"
                  className="text-[#2563EB] dark:text-blue-400 fill-none transition-all duration-700 sm:hidden"
                />

                <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-slate-700 fill-none hidden sm:block" />
                <circle
                  cx="32" cy="32" r="26"
                  stroke="currentColor" strokeWidth="6"
                  strokeDasharray={163}
                  strokeDashoffset={163 - (163 * overallStats.percentage) / 100}
                  strokeLinecap="round"
                  className="text-[#2563EB] dark:text-blue-400 fill-none transition-all duration-700 hidden sm:block"
                />
              </svg>
              <span className="absolute font-black text-xs sm:text-sm text-[#111827] dark:text-white">
                {overallStats.percentage}%
              </span>
            </div>

            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-wider block">
                Overall Board Readiness
              </span>
              <h4 className="text-sm sm:text-lg font-black text-[#111827] dark:text-white mt-0.5">
                {overallStats.chaptersCompleted} of {overallStats.totalChapters} <span className="text-xs font-normal text-[#6B7280] dark:text-slate-400">Chapters Mastered</span>
              </h4>
              <p className="text-[10px] sm:text-[11px] text-[#2563EB] dark:text-blue-400 font-bold mt-0.5">
                {overallStats.completedMilestones} of {overallStats.totalMilestones} Milestones Checked
              </p>
            </div>
          </div>

        </div>

        {/* Overall Milestone Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2">
          
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shrink-0 text-xs sm:text-base">
              📖
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 dark:text-blue-300 block truncate">Book Read</span>
              <strong className="text-xs sm:text-base font-black text-blue-900 dark:text-blue-100 truncate block">
                {overallStats.totalRead} <span className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">/ {overallStats.totalChapters}</span>
              </strong>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold shrink-0 text-xs sm:text-base">
              ✍️
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-purple-700 dark:text-purple-300 block truncate">CQ Solved</span>
              <strong className="text-xs sm:text-base font-black text-purple-900 dark:text-purple-100 truncate block">
                {overallStats.totalCQ} <span className="text-[10px] sm:text-xs font-medium text-purple-600 dark:text-purple-400">/ {overallStats.totalChapters}</span>
              </strong>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 text-xs sm:text-base">
              🔘
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 dark:text-amber-300 block truncate">MCQ Done</span>
              <strong className="text-xs sm:text-base font-black text-amber-900 dark:text-amber-100 truncate block">
                {overallStats.totalMCQ} <span className="text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400">/ {overallStats.totalChapters}</span>
              </strong>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 text-xs sm:text-base">
              🔄
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block truncate">Board Qs (5Y)</span>
              <strong className="text-xs sm:text-base font-black text-emerald-900 dark:text-emerald-100 truncate block">
                {overallStats.totalBoard} <span className="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400">/ {overallStats.totalChapters}</span>
              </strong>
            </div>
          </div>

        </div>
      </div>

      {/* 📌 CATEGORY FILTER & SUBJECT SELECTION CAROUSEL / PILLS */}
      <div className="space-y-3 max-w-full overflow-hidden">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 text-[#6B7280] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'All' ? 'All Subjects' : cat}
            </button>
          ))}
        </div>

        {/* Built-in Subjects Horizontal Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 max-w-full">
          {filteredSubjects.map(sub => {
            const isSelected = selectedSubjectId === sub.id;
            const stats = getSubjectStats(sub);

            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`p-2.5 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden min-w-0 max-w-full ${
                  isSelected
                    ? 'bg-blue-50/90 dark:bg-blue-950/70 border-[#2563EB] dark:border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-[#0F172A] border-[#E5E7EB] dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Top Subject Info */}
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap" style={{ backgroundColor: `${sub.color}20`, color: sub.color }}>
                    {sub.chapters.length} Ch
                  </span>

                  <span className="text-[10px] sm:text-[11px] font-black shrink-0 px-1.5 py-0.5 rounded-lg" style={{ backgroundColor: `${sub.color}15`, color: sub.color }}>
                    {stats.percentage}%
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#111827] dark:text-white leading-tight break-words line-clamp-2">
                    {sub.name}
                  </h3>
                </div>

                {/* Mini Subject Progress Bar */}
                <div className="space-y-1 pt-1 min-w-0">
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.percentage}%`, backgroundColor: sub.color }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-[#6B7280] dark:text-slate-400 font-medium">
                    <span>{stats.chaptersCompleted}/{sub.chapters.length} Done</span>
                    <span className="font-bold">{stats.completedMilestones}/{sub.chapters.length * 4}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📚 SELECTED SUBJECT DETAILED CHAPTER CHECKLIST */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-3.5 sm:p-6 border border-[#E5E7EB] dark:border-slate-800 shadow-xs space-y-4 sm:space-y-5 overflow-hidden">
        
        {/* Subject Detail Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-slate-800 pb-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: currentSubject.color }} />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">
                {currentSubject.category} Subject
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-[#111827] dark:text-white break-words">
              {currentSubject.name}
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium">
              {currentSubjectStats.chaptersCompleted} of {currentSubject.chapters.length} chapters completed • {currentSubjectStats.percentage}% Board Ready
            </p>
          </div>

          {/* Subject Batch Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleToggleCheckAllSubject}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border ${
                isAllCurrentSubjectChecked
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isAllCurrentSubjectChecked ? 'Uncheck All' : 'Check All'}</span>
            </button>

            <button
              onClick={handleResetSubject}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#6B7280] dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-[#E5E7EB] dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Reset All Progress for this Subject"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Chapter Search Filter Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-slate-400" />
          <input
            type="text"
            value={chapterSearch}
            onChange={(e) => setChapterSearch(e.target.value)}
            placeholder={`Search chapter in ${currentSubject.name}...`}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-xs sm:text-sm font-medium text-[#111827] dark:text-white placeholder:text-[#6B7280] dark:placeholder:text-slate-400 focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
          />
        </div>

        {/* Chapter Checklist Grid */}
        <div className="space-y-3 max-w-full">
          {filteredChapters.length === 0 ? (
            <div className="py-10 text-center text-[#6B7280] dark:text-slate-400 text-xs space-y-2">
              <p className="font-semibold">No chapter matches "{chapterSearch}" in this subject.</p>
            </div>
          ) : (
            filteredChapters.map((ch) => {
              const chProg = syllabusProgress[ch.id] || { read: false, cq: false, mcq: false, board: false };
              const chMilestonesChecked = (chProg.read ? 1 : 0) + (chProg.cq ? 1 : 0) + (chProg.mcq ? 1 : 0) + (chProg.board ? 1 : 0);
              const chPct = chMilestonesChecked * 25;
              const isFullMastered = chMilestonesChecked === 4;

              return (
                <div
                  key={ch.id}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all space-y-2.5 overflow-hidden ${
                    isFullMastered
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                      : 'bg-[#F8FAFC] dark:bg-slate-800/60 border-[#E5E7EB] dark:border-slate-700/80'
                  }`}
                >
                  {/* Chapter Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                        isFullMastered
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 text-[#111827] dark:text-white shadow-2xs'
                      }`}>
                        {ch.num}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-extrabold text-[#111827] dark:text-white leading-tight break-words">
                          {ch.name}
                        </h4>
                        <span className="text-[10px] sm:text-[11px] font-semibold text-[#6B7280] dark:text-slate-400 block mt-0.5">
                          Chapter {ch.num} • {chMilestonesChecked}/4 Done
                        </span>
                      </div>
                    </div>

                    {/* Progress Badge */}
                    <div className="shrink-0">
                      <span className={`px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-black whitespace-nowrap ${
                        chPct === 100
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : chPct >= 50
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {chPct}%
                      </span>
                    </div>
                  </div>

                  {/* 4 Interactive Milestone Toggle Buttons (Mobile-Optimized Grid) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-1 max-w-full">
                    {SYLLABUS_MILESTONES.map((m) => {
                      const isChecked = !!chProg[m.key];

                      return (
                        <button
                          key={m.key}
                          onClick={() => toggleSyllabusMilestone(ch.id, m.key)}
                          className={`py-1.5 px-1.5 sm:py-2 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-between gap-1 cursor-pointer transition-all border min-w-0 ${
                            isChecked
                              ? m.color === 'blue'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : m.color === 'purple'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : m.color === 'amber'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <span className="flex items-center gap-1 min-w-0 overflow-hidden">
                            <span className="text-[10px] sm:text-xs shrink-0">{m.emoji}</span>
                            <span className="truncate font-semibold">{m.label}</span>
                          </span>

                          <span className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded flex items-center justify-center shrink-0 text-[9px] sm:text-[10px] ${
                            isChecked ? 'bg-white/20 text-white font-black' : 'border border-slate-300 dark:border-slate-600'
                          }`}>
                            {isChecked ? '✓' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
