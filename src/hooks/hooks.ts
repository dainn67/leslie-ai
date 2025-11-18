import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { initializeDatabase, UserProgressService, AsyncStorageService } from "../core/service";
import { setTheme } from "../features/theme/themeSlice";
import { updateUserProgress } from "../features/userProgress/userProgressSlice";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppInitialization = () => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    "Inter-Black": require("../../assets/fonts/inter/Inter-Black.ttf"),
    "Inter-Bold": require("../../assets/fonts/inter/Inter-Bold.ttf"),
    "Inter-Regular": require("../../assets/fonts/inter/Inter-Regular.ttf"),
    "Inter-Italic": require("../../assets/fonts/inter/Inter-Italic.ttf"),
  });

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize database
        await initializeDatabase();

        // Load user progress
        const userProgress = await UserProgressService.getUserProgressFromStorage();
        dispatch(updateUserProgress(userProgress));

        // Load theme
        const theme = await AsyncStorageService.getTheme();
        dispatch(setTheme(theme));

        // Update open app count for analytics
        await AsyncStorageService.updateOpenAppCount();
      } catch (error) {
        console.error("App initialization error:", error);
      }
      setIsInitialized(true);
    }

    initializeApp();
  }, [dispatch]);

  const isReady = fontsLoaded && isInitialized && !fontError;

  return { isReady };
};
