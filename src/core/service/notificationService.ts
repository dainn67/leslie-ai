import * as Notifications from "expo-notifications";
import { AsyncStorageService } from ".";

class NotificationService {
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
}

export const notificationService = new NotificationService();
