import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../core/app/store";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { initializeDatabase, UserProgressService, AsyncStorageService, FirebaseService } from "../core/service";
import { setTheme } from "../features/theme/themeSlice";
import { updateUserProgress } from "../features/userProgress/userProgressSlice";
import { loadLanguage } from "../core/service/locale_service";
import { setDevMode, setShowAds } from "../core/app/AppConfig";
import { ApiClient } from "../api/apiClient";
import { env } from "../constants";
import { apiService } from "../core/service/apiService";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppInitialization = () => {
  const dispatch = useAppDispatch();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const [isRemoteConfigLoaded, setIsRemoteConfigLoaded] = useState(false);

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
      const cfg = await FirebaseService.initializeRemoteConfig();

      if (!cfg) {
        console.log("Firebase not initialized");
        return;
      }

      // Set show ads
      if (cfg.show_ads) dispatch(setShowAds(cfg.show_ads));

      const checkDomainAvailable = async (domain: string) => {
        const token = env.getDifyChatApiKey(domain.includes("ngrok"));
        const result = await ApiClient.getData({ url: `${domain}/v1/info`, token });
        return result && result.author_name !== undefined && result.name !== undefined;
      };

      // Check domains available
      let selectedDomain = "";
      if (await checkDomainAvailable(cfg.dify_domain)) {
        selectedDomain = cfg.dify_domain;
      } else if (await checkDomainAvailable(cfg.dify_domain_bak)) {
        selectedDomain = cfg.dify_domain_bak;
      }

      // Set API base URL if domain is available
      if (selectedDomain) {
        apiService.setApiBaseUrl(selectedDomain);
        AsyncStorageService.setIsUsingNginrok(selectedDomain.includes("ngrok"));
        console.log("Selected domain:", selectedDomain);
        setIsRemoteConfigLoaded(true);
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
