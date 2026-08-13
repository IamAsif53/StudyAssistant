import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, GraduationCap, CheckSquare } from 'lucide-react';

export const CalendarView = () => {
  const { homework, exams } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (dayNum) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const hwList = homework.filter(h => h.dueDate === dStr);
    const examList = exams.filter(e => e.date === dStr);
    return { hwList, examList, dStr };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in duration-300 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly schedule for homework deadlines and exams.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 saas-card px-3 py-1.5 self-start sm:self-auto">
          <button
            onClick={prevMonth}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-xs sm:text-sm px-2 text-slate-900 dark:text-slate-100">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="saas-card p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] sm:text-xs text-slate-400 uppercase mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-24 rounded-xl bg-slate-50/50 dark:bg-slate-800/20" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const { hwList, examList, dStr } = getEventsForDate(dayNum);
            const isToday = dayNum === 7 && month === 7 && year === 2026;

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDay({ dayNum, hwList, examList, dStr })}
                className={`h-16 sm:h-24 p-1 sm:p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isToday
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 bg-white dark:bg-slate-900'
                }`}
              >
                <span className={`text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  {dayNum}
                </span>

                <div className="space-y-0.5 overflow-hidden">
                  {examList.map(exam => (
                    <div key={exam.id} className="px-1 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-semibold text-[8px] sm:text-[9px] truncate">
                      {exam.title}
                    </div>
                  ))}

                  {hwList.map(hw => (
                    <div key={hw.id} className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold text-[8px] sm:text-[9px] truncate">
                      {hw.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="saas-card w-full max-w-sm p-5 bg-white dark:bg-slate-900 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Events for {monthNames[month]} {selectedDay.dayNum}, {year}
            </h3>

            <div className="space-y-2 text-xs">
              {selectedDay.examList.map(exam => (
                <div key={exam.id} className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-medium">
                  <div className="font-semibold">{exam.title}</div>
                  <div className="text-[11px] opacity-80">Exam at {exam.time}</div>
                </div>
              ))}

              {selectedDay.hwList.map(hw => (
                <div key={hw.id} className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  <div className="font-semibold">{hw.title}</div>
                  <div className="text-[11px] opacity-80">Homework Deadline</div>
                </div>
              ))}

              {selectedDay.examList.length === 0 && selectedDay.hwList.length === 0 && (
                <p className="text-slate-400 py-4 text-center">No events for this date.</p>
              )}
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full py-2 rounded-xl bg-blue-600 text-white font-medium text-xs cursor-pointer hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
