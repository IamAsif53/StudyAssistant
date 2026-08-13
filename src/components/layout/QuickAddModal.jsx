import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckSquare, Clock, GraduationCap, FileText } from 'lucide-react';

export const QuickAddModal = () => {
  const { isQuickAddOpen, setIsQuickAddOpen, addHomework, addStudySession, addExam, addNote } = useApp();

  const [type, setType] = useState('homework');
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const sub = subjectName.trim() || 'General';

    if (type === 'homework') {
      addHomework({
        title,
        subjectName: sub,
        priority,
        dueDate: date || new Date().toISOString().split('T')[0],
        estimatedMinutes: 60,
        description: 'Quickly added task'
      });
    } else if (type === 'session') {
      addStudySession({
        subjectName: sub,
        topic: title,
        day: 'Monday',
        startTime: '17:00',
        endTime: '18:00',
        durationMinutes: 60,
        goal: 'Focus study'
      });
    } else if (type === 'exam') {
      addExam({
        title,
        subjectName: sub,
        date: date || new Date().toISOString().split('T')[0],
        time: '09:00 AM',
        importance: priority,
        syllabus: [{ id: `s-${Date.now()}`, text: 'General syllabus revision', completed: false }]
      });
    } else if (type === 'note') {
      addNote({
        title,
        subjectName: sub,
        content: `# ${title}\n\nQuick note content...`
      });
    }

    setTitle('');
    setSubjectName('');
    setIsQuickAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="saas-card w-[92vw] sm:w-full max-w-md p-5 sm:p-6 bg-white dark:bg-slate-900 space-y-4 shadow-xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsQuickAddOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Quick Add Shortcut
        </h3>

        {/* Type Selector Buttons */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {[
            { id: 'homework', label: 'Homework', icon: CheckSquare },
            { id: 'session', label: 'Session', icon: Clock },
            { id: 'exam', label: 'Exam', icon: GraduationCap },
            { id: 'note', label: 'Note', icon: FileText }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = type === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title / Topic</label>
            <input
              type="text"
              placeholder={`Enter ${type} title...`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Mathematics, Science..."
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="flex-1 h-10 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-blue-600 text-white font-semibold cursor-pointer hover:bg-blue-700 text-xs sm:text-sm shadow-xs"
            >
              Create {type}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
