package com.smartstudy.planner;

import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeAlarm")
public class NativeAlarmPlugin extends Plugin {

    @PluginMethod
    public void scheduleAlarm(PluginCall call) {
        Integer id = call.getInt("id");
        if (id == null) {
            call.reject("id is required.");
            return;
        }

        String type = call.getString("type", "routine");
        String title = call.getString("title", "📚 Study Planner");
        String body = call.getString("body", "You have an upcoming study session!");
        Long triggerAtMillis = call.getLong("triggerAtMillis");
        String channelId = call.getString("channelId", NativeAlarmScheduler.CHANNEL_STUDY);
        String route = call.getString("route", "planner");

        if (triggerAtMillis == null) {
            call.reject("triggerAtMillis is required.");
            return;
        }

        boolean success = NativeAlarmScheduler.scheduleAlarm(
                getContext(),
                id,
                type,
                title,
                body,
                triggerAtMillis,
                channelId,
                route
        );

        if (success) {
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("id", id);
            ret.put("triggerAtMillis", triggerAtMillis);
            call.resolve(ret);
        } else {
            call.reject("Failed to schedule native alarm. Trigger time may be in the past or permission missing.");
        }
    }

    @PluginMethod
    public void cancelAlarm(PluginCall call) {
        Integer id = call.getInt("id");
        if (id != null) {
            NativeAlarmScheduler.cancelAlarm(getContext(), id);
        }
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void cancelAllAlarms(PluginCall call) {
        NativeAlarmScheduler.cancelAllAlarms(getContext());
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void checkDiagnosticStatus(PluginCall call) {
        Context context = getContext();
        JSObject ret = new JSObject();

        boolean notifPerm = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            notifPerm = manager != null && manager.areNotificationsEnabled();
        }
        ret.put("notificationsPermission", notifPerm);

        boolean exactPerm = NativeAlarmScheduler.canScheduleExactAlarms(context);
        ret.put("exactAlarmPermission", exactPerm);

        NativeAlarmScheduler.createNotificationChannels(context);
        ret.put("studyChannel", true);
        ret.put("examChannel", true);
        ret.put("homeworkChannel", true);

        int count = NativeAlarmScheduler.getScheduledCount(context);
        ret.put("scheduledCount", count);

        call.resolve(ret);
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            intent.setAction(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
            intent.putExtra(Settings.EXTRA_APP_PACKAGE, context.getPackageName());
        } else {
            intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.fromParts("package", context.getPackageName(), null));
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openExactAlarmSettings(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            intent.setAction(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
            intent.setData(Uri.fromParts("package", context.getPackageName(), null));
        } else {
            intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.fromParts("package", context.getPackageName(), null));
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}
