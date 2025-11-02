import React, { useEffect, useState } from "react";
import OnboardingScreen from "../features/onboarding/screen/OnboardingScreen";
import ApiServiceInstance from "../core/service/api/apiService";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerNavigator } from "./DrawerNavigator";
import { AsyncStorageService, FirebaseService } from "../core/service";
import { QuestionType } from "../models/question";
import { GameScreen, GameProps } from "../features/game/screens/GameScreen";
import { ResultScreen } from "../features/game/screens/ResultScreen";
import { QuestionListScreen } from "../features/questions/screens/QuestionListScreen";
import { ApiClient } from "../api/apiClient";
import i18n from "../locales";

const { DIFY_CHAT_API_KEY, DIFY_CHAT_NGINROK_API_KEY } = Constants.expoConfig?.extra ?? {};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: { initialMessage?: string };
  GameScreen: { props: GameProps };
  ResultScreen: {
    props: GameProps;
    mapAnswerIds: { [key: number]: number };
  };
  QuestionListScreen: { type: QuestionType };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [remoteConfig, setRemoteConfig] = useState<any>(null);
  const [language, setLanguage] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await AsyncStorageService.getOnboardingCompleted();
      setInitialRoute(completed ? "Main" : "Onboarding");
    };

    const loadRemoteConfigs = async () => {
      const cfg = await FirebaseService.initializeRemoteConfig();

      if (!FirebaseService.isInitialized()) {
        console.log("Firebase not initialized");
        return;
      }

      if (!cfg) return;

      // Check domains available
      let selectedDomain = "";
      if (await checkDomainAvailable(cfg.dify_domain)) {
        selectedDomain = cfg.dify_domain;
      } else if (await checkDomainAvailable(cfg.dify_domain_bak)) {
        selectedDomain = cfg.dify_domain_bak;
      }

      // Set API base URL if domain is available
      if (selectedDomain) {
        ApiServiceInstance.setApiBaseUrl(selectedDomain);
        AsyncStorageService.setIsUsingNginrok(selectedDomain.includes("ngrok"));
        console.log("Selected domain:", selectedDomain);
      }

      setRemoteConfig(cfg);
    };

    const loadLanguage = async () => {
      const language = await AsyncStorageService.getLanguage();
      setLanguage(language);
      i18n.changeLanguage(language);
    };

    const checkDomainAvailable = async (domain: string) => {
      const token = domain.includes("ngrok") ? DIFY_CHAT_NGINROK_API_KEY : DIFY_CHAT_API_KEY;
      const result = await ApiClient.getData({ url: `${domain}/v1/info`, token });
      return result && result.author_name !== undefined && result.name !== undefined;
    };

    loadLanguage();
    checkOnboarding();
    loadRemoteConfigs();
  }, []);

  // Prevent rendering until we know the route
  if (!initialRoute || !remoteConfig || !language) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={DrawerNavigator} />
        <Stack.Screen name="QuestionListScreen" component={QuestionListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GameScreen" component={GameScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
