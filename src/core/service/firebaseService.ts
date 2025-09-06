import { getApp } from "@react-native-firebase/app";
import { getAnalytics, logEvent, logScreenView } from "@react-native-firebase/analytics";

const analytics = getAnalytics(getApp());

export const FirebaseService = {
  logEvent: async (name: string, params?: Record<string, any>) => {
    try {
      await logEvent(analytics, name, params);
      console.log("Analytics event:", name, params);
    } catch (e) {
      console.error("Analytics event logging failed:", e);
    }
  },

  logScreenView: async (screenName: string) => {
    try {
      await logScreenView(analytics, {
        screen_name: screenName,
      });
    } catch (e) {
      console.error("Screen view logging failed:", e);
    }
  },
};
