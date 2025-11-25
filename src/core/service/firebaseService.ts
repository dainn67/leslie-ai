// const app =
//   getApps().length === 0
//     ? await initializeApp({
//         apiKey: "AIzaSyDVhsCEEQbtepxO6CITtOYX1X9SCNe90lY",
//         authDomain: "leslie-project-ed8f6.firebaseapp.com",
//         projectId: "leslie-project-ed8f6",
//         storageBucket: "leslie-project-ed8f6.firebasestorage.app",
//         messagingSenderId: "461686398579",
//         appId: "1:461686398579:android:129bcdc78ebc01b3bb5406",
//       })
//     : getApp();

// const analytics = getAnalytics(app);
// const remoteConfigInstance = getRemoteConfig(app);

let _initialized = false;

export const FirebaseService = {
  logEvent: async (name: string, params?: Record<string, any>) => {
    // try {
    //   await firebaseLogEvent(analytics, name, params);
    // } catch (e) {
    //   console.error("Analytics event logging failed:", e);
    // }
  },

  logScreenView: async (screenName: string) => {
    // try {
    //   await firebaseLogScreenView(analytics, { screen_name: screenName });
    // } catch (e) {
    //   console.error("Screen view logging failed:", e);
    // }
  },

  isInitialized: () => _initialized,

  initializeRemoteConfig: async () => {
    // if (_initialized) return;
    // try {
    //   await setDefaults(remoteConfigInstance, {
    //     api_base_url: "https://default.example.com",
    //     feature_enabled: "false",
    //   });
    //   // This sets the minimum interval between Remote Config fetches to 1 hour (in milliseconds).
    //   // It means Remote Config will not fetch new values from the server more than once every 1 hour.
    //   await setConfigSettings(remoteConfigInstance, {
    //     minimumFetchIntervalMillis: 3600000,
    //   });
    //   // ⏱ Limit fetchAndActivate to 5s
    //   await withTimeout(fetchAndActivate(remoteConfigInstance), 3000);
    //   _initialized = true;
    //   return {
    //     dify_domain: getValue(remoteConfigInstance, "dify_domain").asString(),
    //     dify_domain_bak: getValue(remoteConfigInstance, "dify_domain_bak").asString(),
    //   };
    // } catch (e) {
    //   console.error("Remote Config init failed:", e);
    //   return { dify_domain: "", dify_domain_bak: "" };
    // }
  },
};
