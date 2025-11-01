import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import i18n from "./src/locales";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import { store } from "./src/app/store";
import { RootNavigator } from "./src/app/RootNavigator";
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DialogProvider } from "./src/core/providers";
import { AsyncStorageService, initializeDatabase, UserProgressService } from "./src/core/service";
import { useAppDispatch } from "./src/hooks/hooks";
import { updateUserProgress } from "./src/features/userProgress/userProgressSlice";
import { setTheme } from "./src/features/theme/themeSlice";

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Provider store={store}>
            <AppContent />
          </Provider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  );
}

const AppContent = () => {
  const [fontsLoaded] = useFonts({
    "Inter-Black": require("./assets/fonts/inter/Inter-Black.ttf"),
    "Inter-Bold": require("./assets/fonts/inter/Inter-Bold.ttf"),
    "Inter-Regular": require("./assets/fonts/inter/Inter-Regular.ttf"),
    "Inter-Italic": require("./assets/fonts/inter/Inter-Italic.ttf"),
  });

  const [userProgressLoaded, setUserProgressLoaded] = useState(false);
  const dispatch = useAppDispatch();

  // Init data
  useEffect(() => {
    async function init() {
      initializeDatabase();
      AsyncStorageService.getTheme().then((scheme) => dispatch(setTheme(scheme)));
      AsyncStorageService.updateOpenAppCount();
      const userProgress = await UserProgressService.getUserProgressFromStorage();
      dispatch(updateUserProgress(userProgress));
      setUserProgressLoaded(true);
    }

    init();
  }, []);

  const ready = fontsLoaded && userProgressLoaded;

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <DialogProvider>
      <RootNavigator />
      <Toast />
    </DialogProvider>
  );
};
