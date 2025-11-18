import React, { useEffect, useState } from "react";
import OnboardingScreen from "../features/onboarding/screen/OnboardingScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerNavigator } from "./DrawerNavigator";
import { AsyncStorageService } from "../core/service";
import { QuestionType } from "../models/question";
import { GameScreen, GameProps } from "../features/game/screens/GameScreen";
import { ResultScreen } from "../features/game/screens/ResultScreen";
import { QuestionListScreen } from "../features/questions/screens/QuestionListScreen";

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

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await AsyncStorageService.getOnboardingCompleted();
      setInitialRoute(completed ? "Main" : "Onboarding");
    };

    checkOnboarding();
  }, []);

  // Prevent rendering until we know the route
  if (!initialRoute) return null;

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
