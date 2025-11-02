export default {
  expo: {
    owner: "dainn283",
    name: "AIkaze",
    slug: "leslieai",
    icon: "./assets/images/app-logo.png",
    version: "1.2.0",
    android: {
      package: "com.leslie.app",
      googleServicesFile: "./android/app/google-services.json",
      versionCode: 26,
      adaptiveIcon: {
        foregroundImage: "./assets/images/app-logo.png",
        backgroundColor: "#ffffff",
      },
    },
    ios: {
      icon: "./assets/images/app-logo.png",
      bundleIdentifier: "com.leslie.app",
    },
    splash: {
      image: "./assets/images/app-logo.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    plugins: ["expo-sqlite", "react-native-localize"],
    extra: {
      DIFY_CHAT_API_KEY: process.env.DIFY_CHAT_API_KEY,
      DIFY_CHAT_NGINROK_API_KEY: process.env.DIFY_CHAT_NGINROK_API_KEY,
      DIFY_ASSISTANT_API_KEY: process.env.DIFY_ASSISTANT_API_KEY,
      DIFY_ASSISTANT_NGINROK_API_KEY: process.env.DIFY_ASSISTANT_NGINROK_API_KEY,
      DIFY_ANALYZE_GAME_RESULT_API_KEY: process.env.DIFY_ANALYZE_GAME_RESULT_API_KEY,
      DIFY_ANALYZE_GAME_RESULT_NGINROK_API_KEY: process.env.DIFY_ANALYZE_GAME_RESULT_NGINROK_API_KEY,
      DIFY_EXTRACT_CONTEXT_API_KEY: process.env.DIFY_EXTRACT_CONTEXT_API_KEY,
      DIFY_EXTRACT_CONTEXT_NGINROK_API_KEY: process.env.DIFY_EXTRACT_CONTEXT_NGINROK_API_KEY,
      DIFY_ANALYZE_PROGRESS_API_KEY: process.env.DIFY_ANALYZE_PROGRESS_API_KEY,
      DIFY_ANALYZE_PROGRESS_NGINROK_API_KEY: process.env.DIFY_ANALYZE_PROGRESS_NGINROK_API_KEY,
      DISCORD_ERROR_WEBHOOKS: process.env.DISCORD_ERROR_WEBHOOKS,
      DISCORD_FEEDBACK_WEBHOOKS: process.env.DISCORD_FEEDBACK_WEBHOOKS,
      eas: {
        projectId: "1999df9a-b268-4992-933a-54bf931d0952",
      },
    },
  },
};
