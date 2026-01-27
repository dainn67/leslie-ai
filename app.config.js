export default {
  expo: {
    owner: "dainn283",
    name: "AIkaze",
    slug: "leslieai",
    icon: "./assets/images/app-logo.png",
    version: "1.5.2",
    android: {
      package: "com.leslie.app",
      googleServicesFile: "./google-services.json",
      versionCode: 50,
      adaptiveIcon: {
        foregroundImage: "./assets/images/app-logo.png",
        backgroundColor: "#ffffff",
      },
      config: {
        googleMobileAdsAppId: "ca-app-pub-6011704237608953~2270976120",
      },
      edgeToEdgeEnabled: true,
      useNextNotificationsApi: true,
    },
    ios: {
      icon: "./assets/images/app-logo-test.png",
      bundleIdentifier: "com.leslie.app",
      supportsTablet: true,
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
      },
      config: {
        googleMobileAdsAppId: "ca-app-pub-6011704237608953~2270976120",
      },
    },
    splash: {
      image: "./assets/images/app-logo.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    plugins: [
      "expo-sqlite",
      "react-native-localize",
      [
        "expo-notifications",
        {
          icon: "./assets/images/app-logo.png",
          color: "#ffffff",
        },
      ],
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: "ca-app-pub-6011704237608953~2270976120",
          iosAppId: "ca-app-pub-6011704237608953~2270976120",
        },
      ],
    ],
    extra: {
      CHAT_API_KEY: process.env.CHAT_API_KEY,
      ASSISTANT_API_KEY: process.env.ASSISTANT_API_KEY,
      ANALYZE_GAME_RESULT_API_KEY: process.env.ANALYZE_GAME_RESULT_API_KEY,
      EXTRACT_CONTEXT_API_KEY: process.env.EXTRACT_CONTEXT_API_KEY,
      ANALYZE_PROGRESS_API_KEY: process.env.ANALYZE_PROGRESS_API_KEY,
      DISCORD_ERROR_WEBHOOKS: process.env.DISCORD_ERROR_WEBHOOKS,
      DISCORD_FEEDBACK_WEBHOOKS: process.env.DISCORD_FEEDBACK_WEBHOOKS,
      eas: {
        projectId: "1999df9a-b268-4992-933a-54bf931d0952",
      },
    },
  },
};
