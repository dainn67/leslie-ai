import { getApp } from "@react-native-firebase/app";
import { getAnalytics, logEvent, logScreenView } from "@react-native-firebase/analytics";
import remoteConfig from "@react-native-firebase/remote-config";
import firebase from "@react-native-firebase/app";

const analytics = getAnalytics(getApp());

export const FirebaseService = {
  logEvent: async (name: string, params?: Record<string, any>) => {
    try {
      await logEvent(analytics, name, params);
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

  initializeRemoteConfig: async () => {
    if (!firebase.apps.length) {
      await firebase.initializeApp({
        apiKey: "AIzaSyDVhsCEEQbtepxO6CITtOYX1X9SCNe90lY",
        authDomain: "leslie-project-ed8f6.firebaseapp.com",
        projectId: "leslie-project-ed8f6",
        storageBucket: "leslie-project-ed8f6.firebasestorage.app",
        messagingSenderId: "461686398579",
        appId: "1:461686398579:android:129bcdc78ebc01b3bb5406",
      });
    }

    await remoteConfig().setDefaults({
      api_base_url: "https://default.example.com",
      feature_enabled: "false",
    });

    await remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: 7200000, // 2 hour
    });

    await remoteConfig().fetchAndActivate();

    return {
      dify_domain: remoteConfig().getValue("dify_domain").asString(),
      dify_domain_bak: remoteConfig().getValue("dify_domain_bak").asString(),
    };
  },
};
