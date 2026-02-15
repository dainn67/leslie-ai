import 'dotenv/config';

const APP = process.env.APP

const config = {
  aikaze: {
    name: "Main App",
    slug: "leslieai",
    package: "com.leslie.app",
    iosBundle: "com.company.main",
    androidPackage: "com.company.main",
    projectId: "1999df9a-b268-4992-933a-54bf931d0952",
    adMobAppId: "ca-app-pub-6011704237608953~2270976120"
  },
  linguaai: {
    name: "Lingua AI",
    slug: "linguaai",
    package: "com.leslie.linguaai",
    iosBundle: "com.company.new",
    androidPackage: "com.company.new",
    projectId: "deb1cfe6-9451-4104-9d76-14e69dc8d629",
    adMobAppId: "ca-app-pub-6011704237608953~2270976120"
  }
}

export default {
  expo: {
    owner: "dainn283",
    name: config[APP].name,
    slug: config[APP].slug,
    icon: "./assets/images/app-logo.png",
    version: "1.5.5",
    android: {
      package: config[APP].androidPackage,
      googleServicesFile: "./google-services.json",
      versionCode: 52,
      adaptiveIcon: {
        foregroundImage: "./assets/images/app-logo.png",
        backgroundColor: "#ffffff",
      },
      config: {
        googleMobileAdsAppId: "",
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
        googleMobileAdsAppId: config[APP].adMobAppId,
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
          androidAppId: config[APP].adMobAppId,
          iosAppId: config[APP].adMobAppId,
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
        projectId: config[APP].projectId,
      },
    },
  },
};
