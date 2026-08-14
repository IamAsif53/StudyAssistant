package com.smartstudy.planner;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONObject;

public class NativeAlarmScheduler {
    private static final String TAG = "NativeAlarmScheduler";
    private static final String PREF_NAME = "ssp_native_alarms_store";
    private static final String KEY_ALARMS = "alarms_list";

    public static final String CHANNEL_STUDY = "study_reminders";
    public static final String CHANNEL_EXAM = "exam_reminders";
    public static final String CHANNEL_HOMEWORK = "homework_reminders";

    public static void createNotificationChannels(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = context.getSystemService(NotificationManager.class);
            if (manager == null) return;

            // 1. Study Reminders Channel
            NotificationChannel studyChannel = new NotificationChannel(
                    CHANNEL_STUDY,
                    "Study Routine Reminders",
                    NotificationManager.IMPORTANCE_HIGH
            );
            studyChannel.setDescription("High-priority status bar notifications for daily study routine sessions");
            studyChannel.enableVibration(true);
            studyChannel.enableLights(true);
            studyChannel.setShowBadge(true);
            studyChannel.setLockscreenVisibility(NotificationChannel.LOCKSCREEN_VISIBILITY_PUBLIC);
            manager.createNotificationChannel(studyChannel);

            // 2. Exam Reminders Channel
            NotificationChannel examChannel = new NotificationChannel(
                    CHANNEL_EXAM,
                    "Exam Reminders & Syllabus",
                    NotificationManager.IMPORTANCE_HIGH
            );
            examChannel.setDescription("Important notifications for upcoming exams and syllabus prep");
            examChannel.enableVibration(true);
            examChannel.enableLights(true);
            examChannel.setShowBadge(true);
            examChannel.setLockscreenVisibility(NotificationChannel.LOCKSCREEN_VISIBILITY_PUBLIC);
            manager.createNotificationChannel(examChannel);

            // 3. Homework Reminders Channel
            NotificationChannel hwChannel = new NotificationChannel(
                    CHANNEL_HOMEWORK,
                    "Homework & Task Deadlines",
                    NotificationManager.IMPORTANCE_HIGH
            );
            hwChannel.setDescription("Notifications for homework deadlines and pending assignments");
            hwChannel.enableVibration(true);
            hwChannel.enableLights(true);
            hwChannel.setShowBadge(true);
            hwChannel.setLockscreenVisibility(NotificationChannel.LOCKSCREEN_VISIBILITY_PUBLIC);
            manager.createNotificationChannel(hwChannel);
        }
    }

    public static boolean canScheduleExactAlarms(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            return alarmManager != null && alarmManager.canScheduleExactAlarms();
        }
        return true;
    }

    public static boolean scheduleAlarm(Context context, int id, String type, String title, String body, long triggerAtMillis, String channelId, String route) {
        if (triggerAtMillis <= System.currentTimeMillis()) {
            Log.w(TAG, "Cannot schedule alarm in the past. Trigger time: " + triggerAtMillis);
            return false;
        }

        createNotificationChannels(context);

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return false;

        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.putExtra("id", id);
        intent.putExtra("type", type);
        intent.putExtra("title", title);
        intent.putExtra("body", body);
        intent.putExtra("channelId", channelId);
        intent.putExtra("route", route);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                id,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            } else {
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            }

            saveAlarmToPref(context, id, type, title, body, triggerAtMillis, channelId, route);
            Log.d(TAG, "Successfully scheduled AlarmManager exact alarm ID: " + id + " for " + triggerAtMillis);
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule exact alarm: " + e.getMessage());
            return false;
        }
    }

    public static void cancelAlarm(Context context, int id) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            Intent intent = new Intent(context, AlarmReceiver.class);
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    id,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
            );
            alarmManager.cancel(pendingIntent);
        }
        removeAlarmFromPref(context, id);
    }

    public static void cancelAllAlarms(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            String jsonStr = prefs.getString(KEY_ALARMS, "[]");
            JSONArray array = new JSONArray(jsonStr);

            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager != null) {
                for (int i = 0; i < array.length(); i++) {
                    JSONObject obj = array.getJSONObject(i);
                    int id = obj.optInt("id");
                    Intent intent = new Intent(context, AlarmReceiver.class);
                    PendingIntent pendingIntent = PendingIntent.getBroadcast(
                            context,
                            id,
                            intent,
                            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
                    );
                    alarmManager.cancel(pendingIntent);
                }
            }
            prefs.edit().putString(KEY_ALARMS, "[]").apply();
        } catch (Exception e) {
            Log.e(TAG, "Error cancelling all alarms: " + e.getMessage());
        }
    }

    public static void rescheduleAllSavedAlarms(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            String jsonStr = prefs.getString(KEY_ALARMS, "[]");
            JSONArray array = new JSONArray(jsonStr);
            JSONArray updatedArray = new JSONArray();

            long now = System.currentTimeMillis();
            int restoredCount = 0;

            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                int id = obj.optInt("id");
                String type = obj.optString("type");
                String title = obj.optString("title");
                String body = obj.optString("body");
                long triggerAtMillis = obj.optLong("triggerAtMillis");
                String channelId = obj.optString("channelId");
                String route = obj.optString("route");

                if (triggerAtMillis > now) {
                    boolean success = scheduleAlarm(context, id, type, title, body, triggerAtMillis, channelId, route);
                    if (success) {
                        updatedArray.put(obj);
                        restoredCount++;
                    }
                }
            }

            prefs.edit().putString(KEY_ALARMS, updatedArray.toString()).apply();
            Log.d(TAG, "Rescheduled " + restoredCount + " alarms after boot/time change!");
        } catch (Exception e) {
            Log.e(TAG, "Error rescheduling alarms: " + e.getMessage());
        }
    }

    public static int getScheduledCount(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            String jsonStr = prefs.getString(KEY_ALARMS, "[]");
            JSONArray array = new JSONArray(jsonStr);
            long now = System.currentTimeMillis();
            int count = 0;
            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                if (obj.optLong("triggerAtMillis") > now) count++;
            }
            return count;
        } catch (Exception e) {
            return 0;
        }
    }

    private static synchronized void saveAlarmToPref(Context context, int id, String type, String title, String body, long triggerAtMillis, String channelId, String route) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            String jsonStr = prefs.getString(KEY_ALARMS, "[]");
            JSONArray array = new JSONArray(jsonStr);
            JSONArray newArray = new JSONArray();

            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                if (obj.optInt("id") != id && obj.optLong("triggerAtMillis") > System.currentTimeMillis()) {
                    newArray.put(obj);
                }
            }

            JSONObject newObj = new JSONObject();
            newObj.put("id", id);
            newObj.put("type", type);
            newObj.put("title", title);
            newObj.put("body", body);
            newObj.put("triggerAtMillis", triggerAtMillis);
            newObj.put("channelId", channelId);
            newObj.put("route", route);
            newArray.put(newObj);

            prefs.edit().putString(KEY_ALARMS, newArray.toString()).apply();
        } catch (Exception e) {
            Log.e(TAG, "Error saving alarm pref: " + e.getMessage());
        }
    }

    private static synchronized void removeAlarmFromPref(Context context, int id) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            String jsonStr = prefs.getString(KEY_ALARMS, "[]");
            JSONArray array = new JSONArray(jsonStr);
            JSONArray newArray = new JSONArray();

            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                if (obj.optInt("id") != id) {
                    newArray.put(obj);
                }
            }
            prefs.edit().putString(KEY_ALARMS, newArray.toString()).apply();
        } catch (Exception e) {}
    }
}
