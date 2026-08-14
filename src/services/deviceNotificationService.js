import { registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const NativeAlarm = registerPlugin('NativeAlarm');

const DAYS_MAP = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6
};

// Robust Helper: Parse 12-hour or 24-hour time strings (e.g. "11:07 AM", "11:07", "11:07 AM - 11:55 AM")
const parseTimeHHMM = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return { hours: 9, minutes: 0 };
  const cleanStr = timeStr.split('-')[0].trim();

  const match = cleanStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : null;

    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    return { hours: h, minutes: m };
  }

  return { hours: 9, minutes: 0 };
};

// Helper: Calculate target Date for next upcoming day of week & time
const getNextDateForDayAndTime = (dayName, timeStr) => {
  if (!dayName || !DAYS_MAP.hasOwnProperty(dayName)) return null;
  const targetDayIdx = DAYS_MAP[dayName];

  try {
    const now = new Date();
    const currentDayIdx = now.getDay();
    const { hours, minutes } = parseTimeHHMM(timeStr);

    let daysAhead = targetDayIdx - currentDayIdx;
    if (daysAhead < 0) {
      daysAhead += 7;
    } else if (daysAhead === 0) {
      const targetToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
      if (targetToday.getTime() <= now.getTime()) {
        daysAhead = 7;
      }
    }

    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead, hours, minutes, 0);
  } catch (e) {
    return null;
  }
};

// Helper: Parse Exam Date & Time string into Date object
const parseExamDateTime = (dateStr, timeStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  try {
    const parts = dateStr.split('-').map(Number);
    if (parts.length < 3 || parts.some(isNaN)) return null;
    const [year, month, day] = parts;
    
    let hours = 9;
    let minutes = 0;

    if (timeStr && typeof timeStr === 'string') {
      const { hours: h, minutes: m } = parseTimeHHMM(timeStr);
      hours = h;
      minutes = m;
    }

    return new Date(year, month - 1, day, hours, minutes, 0);
  } catch (e) {
    return null;
  }
};

// Helper: Create a deterministic 32-bit positive integer ID for Android Alarms
const generateAlarmId = (str) => {
  if (!str) return Math.floor(Math.random() * 1000000);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash % 2147483647);
};

class DeviceNotificationService {
  constructor() {
    this.isNative = false;
    this.hasPermission = false;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        this.isNative = true;
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
          const req = await LocalNotifications.requestPermissions();
          this.hasPermission = req.display === 'granted';
        } else {
          this.hasPermission = true;
        }
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          this.hasPermission = true;
        } else if (Notification.permission !== 'denied') {
          const perm = await Notification.requestPermission();
          this.hasPermission = perm === 'granted';
        }
      }
    } catch (err) {
      console.warn('DeviceNotificationService init warning:', err);
    }
  }

  // Diagnostic Check Method
  async checkDiagnosticStatus() {
    await this.init();
    if (this.isNative) {
      try {
        const res = await NativeAlarm.checkDiagnosticStatus();
        return res;
      } catch (e) {
        console.warn('checkDiagnosticStatus error:', e);
      }
    }
    return {
      notificationsPermission: this.hasPermission,
      exactAlarmPermission: true,
      studyChannel: true,
      examChannel: true,
      homeworkChannel: true,
      scheduledCount: 0
    };
  }

  // Open System Settings Handlers
  async openNotificationSettings() {
    if (this.isNative) {
      try {
        await NativeAlarm.openNotificationSettings();
      } catch (e) {}
    }
  }

  async openExactAlarmSettings() {
    if (this.isNative) {
      try {
        await NativeAlarm.openExactAlarmSettings();
      } catch (e) {}
    }
  }

  // CENTRALIZED ALARM SYNCHRONIZER FOR ROUTINES, EXAMS & HOMEWORK
  async syncAllAlarms({ weeklyRoutine, exams = [], homework = [], notificationsEnabled = true }) {
    try {
      await this.init();

      if (!this.isNative) {
        return;
      }

      // 1. Clear previous native alarms
      try {
        await NativeAlarm.cancelAllAlarms();
      } catch (e) {
        console.warn('cancelAllAlarms warning:', e);
      }

      if (!notificationsEnabled) {
        console.log('[NOTIFICATION SYNC] Notifications disabled by user.');
        return;
      }

      let count = 0;

      // 2. Schedule Weekly Routine Alarms (For all 7 Days)
      if (weeklyRoutine && typeof weeklyRoutine === 'object' && !Array.isArray(weeklyRoutine) && weeklyRoutine !== null) {
        for (const dayName of Object.keys(weeklyRoutine)) {
          const slots = weeklyRoutine[dayName];
          if (!Array.isArray(slots)) continue;

          for (const slot of slots) {
            if (!slot || !slot.startTime || !slot.subjects) continue;

            const targetDate = getNextDateForDayAndTime(dayName, slot.startTime);
            if (targetDate && targetDate.getTime() > Date.now()) {
              // Exact Routine Start Alarm
              const routineId = generateAlarmId(`routine_${dayName}_${slot.id}_${slot.startTime}`);
              await NativeAlarm.scheduleAlarm({
                id: routineId,
                type: 'study',
                title: `📚 Study Time (${dayName})`,
                body: `${slot.subjects} — session starts now (${slot.startTime}). ${slot.notes ? '(' + slot.notes + ')' : ''}`,
                triggerAtMillis: targetDate.getTime(),
                channelId: 'study_reminders',
                route: 'planner'
              });
              count++;

              // 5-minute Reminder Alarm
              const date5MinBefore = new Date(targetDate.getTime() - 5 * 60 * 1000);
              if (date5MinBefore.getTime() > Date.now()) {
                const reminderId = generateAlarmId(`routine5m_${dayName}_${slot.id}_${slot.startTime}`);
                await NativeAlarm.scheduleAlarm({
                  id: reminderId,
                  type: 'study_reminder',
                  title: `⏰ Upcoming Study Routine: ${slot.subjects}`,
                  body: `Get ready! ${slot.subjects} study session starts in 5 minutes (${slot.startTime}).`,
                  triggerAtMillis: date5MinBefore.getTime(),
                  channelId: 'study_reminders',
                  route: 'planner'
                });
                count++;
              }
            }
          }
        }
      }

      // 3. Schedule Exam Alarms (Exam Day + 1 Day Before + 30 Mins Before)
      if (Array.isArray(exams)) {
        for (const exam of exams) {
          if (!exam || !exam.date) continue;
          const examDate = parseExamDateTime(exam.date, exam.time);
          if (examDate && examDate.getTime() > Date.now()) {
            // 1. Exact Exam Time Alarm
            const examId = generateAlarmId(`exam_${exam.id}`);
            await NativeAlarm.scheduleAlarm({
              id: examId,
              type: 'exam',
              title: `📝 Exam Starting Now: ${exam.title}`,
              body: `Good luck! Your ${exam.title} is starting now (${exam.time || 'Today'}).`,
              triggerAtMillis: examDate.getTime(),
              channelId: 'exam_reminders',
              route: 'exams'
            });
            count++;

            // 2. 1-DAY BEFORE EXAM ALARM
            const date1DayBeforeExam = new Date(examDate.getTime() - 24 * 60 * 60 * 1000);
            if (date1DayBeforeExam.getTime() > Date.now()) {
              const exam1DayId = generateAlarmId(`exam1d_${exam.id}`);
              await NativeAlarm.scheduleAlarm({
                id: exam1DayId,
                type: 'exam_reminder',
                title: `⚠️ Exam Tomorrow: ${exam.title}`,
                body: `Get ready! Your ${exam.title} exam is scheduled for tomorrow at ${exam.time || '09:00 AM'}.`,
                triggerAtMillis: date1DayBeforeExam.getTime(),
                channelId: 'exam_reminders',
                route: 'exams'
              });
              count++;
            }

            // 3. 30-Min Before Exam Alarm
            const date30MinBefore = new Date(examDate.getTime() - 30 * 60 * 1000);
            if (date30MinBefore.getTime() > Date.now()) {
              const examRemId = generateAlarmId(`exam30m_${exam.id}`);
              await NativeAlarm.scheduleAlarm({
                id: examRemId,
                type: 'exam_reminder',
                title: `⚠️ Exam Reminder: ${exam.title} in 30 mins`,
                body: `Your ${exam.title} starts in 30 minutes (${exam.time || '09:00 AM'}). Double check your supplies!`,
                triggerAtMillis: date30MinBefore.getTime(),
                channelId: 'exam_reminders',
                route: 'exams'
              });
              count++;
            }
          }
        }
      }

      // 4. Schedule Homework Due Date Alarms (Due Date + 1 Day Before)
      if (Array.isArray(homework)) {
        for (const hw of homework) {
          if (!hw || hw.status === 'Completed' || !hw.dueDate) continue;
          const hwDate = parseExamDateTime(hw.dueDate, '09:00 AM');
          if (hwDate && hwDate.getTime() > Date.now()) {
            // 1. Exact Due Date Alarm (9:00 AM on Due Date)
            const hwId = generateAlarmId(`hw_${hw.id}`);
            await NativeAlarm.scheduleAlarm({
              id: hwId,
              type: 'homework',
              title: `📌 Homework Due Today: ${hw.title}`,
              body: `Priority: ${hw.priority || 'Medium'}. Don't forget to submit your ${hw.title}!`,
              triggerAtMillis: hwDate.getTime(),
              channelId: 'homework_reminders',
              route: 'homework'
            });
            count++;

            // 2. 1-DAY BEFORE HOMEWORK ALARM (9:00 AM on Day Before Due Date)
            const date1DayBeforeHw = new Date(hwDate.getTime() - 24 * 60 * 60 * 1000);
            if (date1DayBeforeHw.getTime() > Date.now()) {
              const hw1DayId = generateAlarmId(`hw1d_${hw.id}`);
              await NativeAlarm.scheduleAlarm({
                id: hw1DayId,
                type: 'homework_reminder',
                title: `📌 Homework Due Tomorrow: ${hw.title}`,
                body: `Reminder: Complete your ${hw.title} (${hw.subject || 'Assignment'}) before tomorrow!`,
                triggerAtMillis: date1DayBeforeHw.getTime(),
                channelId: 'homework_reminders',
                route: 'homework'
              });
              count++;
            }
          }
        }
      }

      console.log(`[NATIVE ALARM SYNC] Successfully scheduled ${count} native Android AlarmManager alarms!`);
    } catch (err) {
      console.error('[NATIVE ALARM SYNC ERROR]:', err);
    }
  }
}

export const deviceNotificationService = new DeviceNotificationService();
