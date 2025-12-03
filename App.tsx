import React from "react";
import Toast from "react-native-toast-message";
import i18n from "./src/locales";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import { store } from "./src/core/app/store";
import { RootNavigator } from "./src/core/app/RootNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DialogProvider } from "./src/core/providers";
import { useAppInitialization } from "./src/hooks/hooks";
import { SplashScreen } from "./src/features/splash/screen/SplashScreen";
import { StatusBar } from "react-native";
import { useAppTheme } from "./src/theme";

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
  const { isReady } = useAppInitialization();
  const { isDarkMode } = useAppTheme();

  if (!isReady) return <SplashScreen />;

  return (
    <DialogProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <RootNavigator />
      </SafeAreaProvider>
      <Toast />
    </DialogProvider>
  );
};
