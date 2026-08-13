import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Plus, Clock, User, CheckSquare, Trash2 } from 'lucide-react';

export const SubjectsView = () => {
  const { subjects, addSubject, deleteSubject, homework, logStudyTime } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [logMinutes, setLogMinutes] = useState(45);

  // Form
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState(6);
  const [color, setColor] = useState('#2563EB');

  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addSubject({ name, teacher, weeklyTarget: Number(weeklyTarget), color, icon: 'BookOpen' });
    setName('');
    setTeacher('');
    setIsAddModalOpen(false);
  };

  const handleLogTime = (e) => {
    e.preventDefault();
    if (!selectedSubject) return;
    logStudyTime(selectedSubject.id, Number(logMinutes));
    setSelectedSubject(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in duration-300 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Subjects & Courses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your weekly target study hours and course teachers.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Empty State or Subjects Grid */}
      {subjects.length === 0 ? (
        <div className="saas-card p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Subjects Added Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by adding your courses and setting your target weekly study hours!
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Your First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const hwCount = homework.filter(h => h.subjectId === sub.id && h.status !== 'Completed').length;
            const pct = Math.min(100, Math.round((sub.completedHours / sub.weeklyTarget) * 100));

            return (
              <div key={sub.id} className="saas-card p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{sub.name}</span>
                    </div>

                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {hwCount} Tasks Pending
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Teacher: {sub.teacher || 'Unassigned'}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span>Weekly Study Hours</span>
                      <span>{sub.completedHours} / {sub.weeklyTarget} hrs ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: sub.color }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedSubject(sub)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Log Study Hours
                  </button>

                  <button
                    onClick={() => deleteSubject(sub.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Log Time Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="saas-card w-full max-w-sm p-5 bg-white dark:bg-slate-900 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Log Study Time for {selectedSubject.name}
            </h3>

            <form onSubmit={handleLogTime} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={logMinutes}
                  onChange={(e) => setLogMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubject(null)}
                  className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white font-medium cursor-pointer hover:bg-blue-700"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="saas-card w-full max-w-md p-6 bg-white dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add New Subject</h3>

            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Teacher</label>
                  <input
                    type="text"
                    placeholder="Teacher name"
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Weekly Target (Hrs)</label>
                  <input
                    type="number"
                    min="1"
                    value={weeklyTarget}
                    onChange={(e) => setWeeklyTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium cursor-pointer hover:bg-blue-700"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
