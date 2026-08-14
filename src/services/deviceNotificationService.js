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

// Helper: Calculate target Date for next upcoming day of week & time (HH:mm)
const getNextDateForDayAndTime = (dayName, time24) => {
  if (!dayName || !DAYS_MAP.hasOwnProperty(dayName)) return null;
  const targetDayIdx = DAYS_MAP[dayName];

  try {
    const now = new Date();
    const currentDayIdx = now.getDay();
    const [hours, minutes] = (time24 || '09:00').split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) return null;

    let daysAhead = targetDayIdx - currentDayIdx;
    if (daysAhead < 0) {
      daysAhead += 7;
    } else if (daysAhead === 0) {
      const targetToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
      if (targetToday.getTime() <= now.getTime() + 60000) {
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
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const period = match[3].toUpperCase();
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        hours = h;
        minutes = m;
      }
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

  // 10-Second Test Notification Scheduler
  async scheduleTestNotification(seconds = 10) {
    await this.init();
    const triggerAt = Date.now() + seconds * 1000;
    const testId = generateAlarmId(`test_notif_${Date.now()}`);

    if (this.isNative) {
      try {
        await NativeAlarm.scheduleAlarm({
          id: testId,
          type: 'study',
          title: '📚 Study Planner Test Alarm',
          body: `Test notification triggered! (App closed/Screen locked test - ${seconds}s)`,
          triggerAtMillis: triggerAt,
          channelId: 'study_reminders',
          route: 'planner'
        });
        return { success: true, triggerAt, testId };
      } catch (err) {
        console.error('[TEST ALARM ERROR]:', err);
        throw err;
      }
    } else {
      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('📚 Study Planner Test Alarm', {
            body: `Test notification triggered! (${seconds}s)`,
            icon: '/favicon.ico'
          });
        }
      }, seconds * 1000);
      return { success: true, triggerAt, testId };
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
                title: `📚 Study Time`,
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

      // 3. Schedule Exam Alarms
      if (Array.isArray(exams)) {
        for (const exam of exams) {
          if (!exam || !exam.date) continue;
          const examDate = parseExamDateTime(exam.date, exam.time);
          if (examDate && examDate.getTime() > Date.now()) {
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

            const date30MinBefore = new Date(examDate.getTime() - 30 * 60 * 1000);
            if (date30MinBefore.getTime() > Date.now()) {
              const examRemId = generateAlarmId(`exam30m_${exam.id}`);
              await NativeAlarm.scheduleAlarm({
                id: examRemId,
                type: 'exam_reminder',
                title: `⚠️ Exam Reminder: ${exam.title} in 30 mins`,
                body: `Your ${exam.title} starts in 30 minutes (${exam.time}). Double check your supplies!`,
                triggerAtMillis: date30MinBefore.getTime(),
                channelId: 'exam_reminders',
                route: 'exams'
              });
              count++;
            }
          }
        }
      }

      // 4. Schedule Homework Due Date Alarms
      if (Array.isArray(homework)) {
        for (const hw of homework) {
          if (!hw || hw.status === 'Completed' || !hw.dueDate) continue;
          const hwDate = parseExamDateTime(hw.dueDate, '09:00 AM');
          if (hwDate && hwDate.getTime() > Date.now()) {
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
