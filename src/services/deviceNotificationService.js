import { LocalNotifications } from '@capacitor/local-notifications';

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

        if (this.hasPermission) {
          await LocalNotifications.createChannel({
            id: 'study_planner_alarms',
            name: 'Study Routine & Exam Alarms',
            description: 'Real-time background status bar alarms for routines, exams, and homework',
            importance: 5,
            sound: 'res://platform_default',
            vibration: true,
            visibility: 1
          });

          LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
            console.log('[NOTIFICATION] Tapped by user:', action);
            if (window.focus) window.focus();
          });
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

  // Send an immediate notification (when inside app or testing)
  async sendDeviceNotification({ title, body, id, extra = {} }) {
    try {
      await this.init();
      const notifId = id || Math.floor(Math.random() * 1000000);

      if (this.isNative && this.hasPermission) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: title,
              body: body,
              id: notifId,
              schedule: { at: new Date(Date.now() + 100), allowWhileIdle: true },
              sound: 'res://platform_default',
              channelId: 'study_planner_alarms',
              actionTypeId: '',
              extra: extra
            }
          ]
        });
        return true;
      }

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: '/favicon.ico',
          tag: `ssp_notif_${notifId}`
        });
        return true;
      }
    } catch (e) {
      console.warn('sendDeviceNotification error:', e);
    }

    return false;
  }

  // CENTRALIZED ALARM SYNCHRONIZER FOR ROUTINES, EXAMS & HOMEWORK
  async syncAllAlarms({ weeklyRoutine, exams = [], homework = [], notificationsEnabled = true }) {
    try {
      await this.init();

      if (!this.isNative || !this.hasPermission) {
        return;
      }

      // 1. Cancel all existing pending alarms
      try {
        const pending = await LocalNotifications.getPending();
        if (pending && Array.isArray(pending.notifications) && pending.notifications.length > 0) {
          await LocalNotifications.cancel({
            notifications: pending.notifications.map(n => ({ id: n.id }))
          });
        }
      } catch (e) {
        console.warn('Cancel pending notifications warning:', e);
      }

      if (!notificationsEnabled) {
        console.log('[NOTIFICATION SYNC] Notifications disabled by user.');
        return;
      }

      const notificationsToSchedule = [];

      // 2. Schedule Weekly Routine Alarms (For all 7 Days)
      // SAFE CHECK: Ensure weeklyRoutine is non-null object and not array!
      if (weeklyRoutine && typeof weeklyRoutine === 'object' && !Array.isArray(weeklyRoutine) && weeklyRoutine !== null) {
        Object.keys(weeklyRoutine).forEach((dayName) => {
          const slots = weeklyRoutine[dayName];
          if (!Array.isArray(slots)) return;

          slots.forEach((slot) => {
            if (!slot || !slot.startTime || !slot.subjects) return;

            const targetDate = getNextDateForDayAndTime(dayName, slot.startTime);
            if (targetDate && targetDate.getTime() > Date.now()) {
              // Exact Start Alarm
              notificationsToSchedule.push({
                id: generateAlarmId(`routine_${dayName}_${slot.id}_${slot.startTime}`),
                title: `⏰ ${dayName} Routine: ${slot.subjects}`,
                body: `It is ${slot.startTime}. Time to start studying ${slot.subjects}! ${slot.notes ? '(' + slot.notes + ')' : ''}`,
                schedule: { at: targetDate, allowWhileIdle: true },
                sound: 'res://platform_default',
                channelId: 'study_planner_alarms',
                extra: { type: 'routine', day: dayName, slotId: slot.id }
              });

              // 5-minute Reminder Alarm
              const date5MinBefore = new Date(targetDate.getTime() - 5 * 60 * 1000);
              if (date5MinBefore.getTime() > Date.now()) {
                notificationsToSchedule.push({
                  id: generateAlarmId(`routine5m_${dayName}_${slot.id}_${slot.startTime}`),
                  title: `🔔 Upcoming Routine: ${slot.subjects}`,
                  body: `Get ready! Your ${slot.subjects} study session starts in 5 minutes.`,
                  schedule: { at: date5MinBefore, allowWhileIdle: true },
                  sound: 'res://platform_default',
                  channelId: 'study_planner_alarms',
                  extra: { type: 'routine_reminder', day: dayName, slotId: slot.id }
                });
              }
            }
          });
        });
      }

      // 3. Schedule Exam Alarms
      if (Array.isArray(exams)) {
        exams.forEach((exam) => {
          if (!exam || !exam.date) return;
          const examDate = parseExamDateTime(exam.date, exam.time);
          if (examDate && examDate.getTime() > Date.now()) {
            notificationsToSchedule.push({
              id: generateAlarmId(`exam_${exam.id}`),
              title: `🎯 Exam Starting Now: ${exam.title}`,
              body: `Good luck! Your ${exam.title} is starting now (${exam.time || 'Today'}).`,
              schedule: { at: examDate, allowWhileIdle: true },
              sound: 'res://platform_default',
              channelId: 'study_planner_alarms',
              extra: { type: 'exam', examId: exam.id }
            });

            const date30MinBefore = new Date(examDate.getTime() - 30 * 60 * 1000);
            if (date30MinBefore.getTime() > Date.now()) {
              notificationsToSchedule.push({
                id: generateAlarmId(`exam30m_${exam.id}`),
                title: `⚠️ Exam Reminder: ${exam.title} in 30 mins`,
                body: `Your ${exam.title} starts in 30 minutes (${exam.time}). Double check your supplies!`,
                schedule: { at: date30MinBefore, allowWhileIdle: true },
                sound: 'res://platform_default',
                channelId: 'study_planner_alarms',
                extra: { type: 'exam_reminder', examId: exam.id }
              });
            }
          }
        });
      }

      // 4. Schedule Homework Due Date Alarms
      if (Array.isArray(homework)) {
        homework.forEach((hw) => {
          if (!hw || hw.status === 'Completed' || !hw.dueDate) return;
          const hwDate = parseExamDateTime(hw.dueDate, '09:00 AM');
          if (hwDate && hwDate.getTime() > Date.now()) {
            notificationsToSchedule.push({
              id: generateAlarmId(`hw_${hw.id}`),
              title: `📝 Homework Due Today: ${hw.title}`,
              body: `Priority: ${hw.priority || 'Medium'}. Don't forget to submit your ${hw.title}!`,
              schedule: { at: hwDate, allowWhileIdle: true },
              sound: 'res://platform_default',
              channelId: 'study_planner_alarms',
              extra: { type: 'homework', hwId: hw.id }
            });
          }
        });
      }

      // 5. Register all system alarms with Capacitor LocalNotifications
      if (notificationsToSchedule.length > 0) {
        const chunkSize = 40;
        for (let i = 0; i < notificationsToSchedule.length; i += chunkSize) {
          const chunk = notificationsToSchedule.slice(i, i + chunkSize);
          await LocalNotifications.schedule({ notifications: chunk });
        }
        console.log(`[NOTIFICATION SYNC] Successfully registered ${notificationsToSchedule.length} native Android system alarms!`);
      }
    } catch (err) {
      console.error('[NOTIFICATION SYNC ERROR]:', err);
    }
  }
}

export const deviceNotificationService = new DeviceNotificationService();
