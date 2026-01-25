import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../core/app/store";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import {
  initializeDatabase,
  UserProgressService,
  AsyncStorageService,
  firebaseService,
  DiscordService,
  DiscordWebhookType,
} from "../core/service";
import { setTheme } from "../features/theme/themeSlice";
import { updateUserProgress } from "../features/userProgress/userProgressSlice";
import { loadLanguage } from "../core/service/locale_service";
import { setDevMode, setShowAds } from "../core/app/AppConfig";
import { ApiClient } from "../api/apiClient";
import { apiService } from "../core/service/apiService";
import { BaseAppConfig } from "../constants";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppInitialization = () => {
  const dispatch = useAppDispatch();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const [isRemoteConfigLoaded, setRemoteConfigLoaded] = useState(false);

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    "Inter-Black": require("../../assets/fonts/inter/Inter-Black.ttf"),
    "Inter-Bold": require("../../assets/fonts/inter/Inter-Bold.ttf"),
    "Inter-Regular": require("../../assets/fonts/inter/Inter-Regular.ttf"),
    "Inter-Italic": require("../../assets/fonts/inter/Inter-Italic.ttf"),
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await initializeDatabase();

        // Load user progress
        const userProgress = await UserProgressService.getUserProgressFromStorage();
        dispatch(updateUserProgress(userProgress));

        // Load theme
        const theme = await AsyncStorageService.getTheme();
        dispatch(setTheme(theme));

        // Load dev mode
        const devMode = await AsyncStorageService.getDevMode();
        dispatch(setDevMode(devMode));

        // Update open app count for analytics
        await AsyncStorageService.updateOpenAppCount();
      } catch (error) {
        console.error("App initialization error:", error);
      }
      setIsInitialized(true);
    };

    const loadRemoteConfigs = async () => {
      const cfg = await firebaseService.initializeRemoteConfig();

      if (!cfg) {
        console.log("No remote config found");
        setRemoteConfigLoaded(true);
        return;
      }

      // Set show ads
      if (cfg.show_ads) dispatch(setShowAds(cfg.show_ads));

      const checkDomainAvailable = async (domain: string) => {
        let timer: NodeJS.Timeout | undefined;
        try {
          return await Promise.race([
            ApiClient.getData({ url: `${domain}/health` }).then((result) => {
              const status = result?.status;
              const gemini_configured = result?.gemini_configured;
              const openai_configured = result?.openai_configured;
              return status && (gemini_configured || openai_configured);
            }),
            new Promise<boolean>((resolve) => {
              timer = setTimeout(() => resolve(false), 3000);
            }),
          ]);
        } finally {
          if (timer) clearTimeout(timer);
        }
      };

      let selectedDomain = "";
      const localDomain = "http://192.168.30.136:8000";
      if (BaseAppConfig.devMode && (await checkDomainAvailable(localDomain))) {
        selectedDomain = localDomain;
      } else if (await checkDomainAvailable(cfg.chatbot_domain)) {
        selectedDomain = cfg.chatbot_domain;
      } else {
        DiscordService.sendDiscordMessage({ message: "No domain available", type: DiscordWebhookType.ERROR });
      }

      // Set API base URL if domain is available
      if (selectedDomain) {
        apiService.setApiBaseUrl(selectedDomain);
        console.log("Selected domain:", apiService.apiBaseUrl);
        setRemoteConfigLoaded(true);
      }
    };

    const initLanguage = async () => {
      await loadLanguage();
      setIsLanguageLoaded(true);
    };

    initializeApp();
    loadRemoteConfigs();
    initLanguage();
  }, [dispatch]);

  const isReady = fontsLoaded && isInitialized && !fontError && isLanguageLoaded && isRemoteConfigLoaded;

  return { isReady };
};
