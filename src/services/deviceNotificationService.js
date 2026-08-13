import { LocalNotifications } from '@capacitor/local-notifications';

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
      // Check if running in Capacitor Native Environment (Android/iOS)
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        this.isNative = true;
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
          const req = await LocalNotifications.requestPermissions();
          this.hasPermission = req.display === 'granted';
        } else {
          this.hasPermission = true;
        }

        // Register default high-priority Android channel with sound and vibration
        if (this.hasPermission) {
          await LocalNotifications.createChannel({
            id: 'study_planner_alarms',
            name: 'Study Routine & Exam Alarms',
            description: 'Real-time device notifications for study routines, exams, and homework',
            importance: 5, // High Importance (Shows banner, plays device audio sound, vibrates)
            sound: 'res://platform_default',
            vibration: true,
            visibility: 1
          });

          // Handle Notification Click (Opens app immediately)
          LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
            console.log('Notification tapped by user:', notificationAction);
            if (window.focus) {
              window.focus();
            }
          });
        }
      } else if ('Notification' in window) {
        // Fallback for Web / Desktop Browser Notifications
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

  // Send an immediate Real Device Notification
  async sendDeviceNotification({ title, body, id, extra = {} }) {
    await this.init();

    const notifId = id || Math.floor(Math.random() * 1000000);

    // 1. Capacitor Native Android Device Notification
    if (this.isNative && this.hasPermission) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: title,
              body: body,
              id: notifId,
              schedule: { at: new Date(Date.now() + 100) },
              sound: 'res://platform_default',
              channelId: 'study_planner_alarms',
              actionTypeId: '',
              extra: extra
            }
          ]
        });
        return true;
      } catch (err) {
        console.warn('Capacitor LocalNotification schedule error:', err);
      }
    }

    // 2. Web Browser Native Notification Fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: body,
          icon: '/favicon.ico',
          tag: `ssp_notif_${notifId}`,
          renotify: true
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      } catch (err) {
        console.warn('Web Notification error:', err);
      }
    }

    return false;
  }
}

export const deviceNotificationService = new DeviceNotificationService();
