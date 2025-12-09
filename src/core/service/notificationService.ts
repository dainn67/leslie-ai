import * as Notifications from "expo-notifications";
import { AsyncStorageService } from ".";

class NotificationService {
  isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    await this.getPushToken();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowAlert: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    this.isInitialized = true;
  }

  async requestPermission() {
    const settings = await Notifications.requestPermissionsAsync();
    return settings.granted;
  }

  async getPushToken() {
    const { status } = await Notifications.getPermissionsAsync();
    const skipNotificationTime = await AsyncStorageService.getSkipNotificationTime();

    const now = new Date().getTime();
    const oneDayInMilliseconds = 1000 * 60 * 60 * 24;
    if (status !== "granted" && now - skipNotificationTime > oneDayInMilliseconds) {
      const ok = await this.requestPermission();
      if (!ok) {
        AsyncStorageService.setSkipNotificationTime(new Date());
        return null;
      }
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  }

  async scheduleNotification(type: "now" | "schedule", date?: Date, title?: string, body?: string) {
    let trigger: Notifications.NotificationTriggerInput | null = null;

    if (type === "schedule" && date instanceof Date) {
      trigger = { type: Notifications.SchedulableTriggerInputTypes.DATE, date: date };
    }

    const notificationTitle = title ?? (type === "now" ? "🔥 Instant message" : "⏰ Scheduled reminder");
    const notificationBody = body ?? (type === "now" ? "This notification appears now" : "This is your scheduled notification");

    const notification = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationTitle,
        body: notificationBody,
      },
      trigger: trigger,
    });

    console.log("Notification scheduled:", notification);
  }

  async cancelNotification() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();
