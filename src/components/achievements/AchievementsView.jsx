import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award, Flame, CheckCircle2, Trophy, Timer, Sun, Moon, Clock, Sparkles, Zap
} from 'lucide-react';

export const AchievementsView = () => {
  const { achievements, userProfile } = useApp();

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const unlockPct = Math.round((unlockedCount / achievements.length) * 100);

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-8 h-8" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-8 h-8" />;
      case 'Trophy': return <Trophy className="w-8 h-8" />;
      case 'Timer': return <Timer className="w-8 h-8" />;
      case 'Sun': return <Sun className="w-8 h-8" />;
      case 'Moon': return <Moon className="w-8 h-8" />;
      default: return <Clock className="w-8 h-8" />;
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-16 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
            Badges & Trophies Gallery
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Unlock achievements by completing homework, maintaining streaks, and logging study sessions.
          </p>
        </div>

        {/* Level Banner */}
        <div className="glass-card px-5 py-2.5 rounded-2xl flex items-center gap-3">
          <Award className="w-8 h-8 text-amber-500" />
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Current Level</div>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100">Level {userProfile.level} ({userProfile.xp} XP)</div>
          </div>
        </div>
      </div>

      {/* Progress Summary Card */}
      <div className="glass-card p-6 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase text-indigo-500">Trophy Unlocked Progress</span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{unlockedCount} / {achievements.length} Badges ({unlockPct}%)</span>
        </div>
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${unlockPct}%` }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((badge) => {
          return (
            <div
              key={badge.id}
              className={`glass-card p-6 rounded-3xl border transition-all flex items-start gap-4 ${
                badge.unlocked
                  ? 'border-indigo-500/40 hover:scale-105 shadow-xl shadow-indigo-500/10'
                  : 'opacity-50 grayscale border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${badge.color} text-white flex items-center justify-center shrink-0 shadow-lg`}>
                {getBadgeIcon(badge.icon)}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                    {badge.title}
                  </h3>
                  {badge.unlocked && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-extrabold text-[9px] uppercase">
                      Unlocked
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {badge.desc}
                </p>

                {badge.unlocked && badge.date && (
                  <span className="block text-[10px] font-bold text-slate-400 mt-2">
                    Unlocked on: {badge.date}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
