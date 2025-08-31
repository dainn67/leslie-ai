import React from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import { useAppTheme } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "../components/text/customText";
import { Question, QuestionType } from "../models/question";
import { ChatbotScreen } from "../features/chatbot/screens/ChatbotScreen";
import { FeedbackScreen } from "../features/feedback/FeedbackScreen";
import { QuestionGameScreen } from "../features/game/screens/GameScreen";
import { ResultScreen } from "../features/game/screens/ResultScreen";
import { QuestionListScreen } from "../features/questions/screens/QuestionListScreen";
import { QuestionsScreen } from "../features/questions/screens/QuestionsScreen";
import { VersionText, ResetProgressButton, ThemeToggleButton } from "../features/drawer";

export type DrawerParamList = {
  ChatbotScreen: undefined;
  QuestionsScreen: undefined;
  FeedbackScreen: undefined;
};

export type RootStackParamList = {
  ChatbotScreen: { initialMessage: string };
  QuestionsMain: undefined;
  QuestionListScreen: { type: QuestionType };
  QuestionGameScreen: { questions: Question[] };
  ResultScreen: {
    questions: Question[];
    mapAnswerIds: { [key: number]: number };
  };
};

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

export const DrawerNavigator = () => {
  const { colors } = useAppTheme();

  return (
    <Drawer.Navigator
      initialRouteName={"ChatbotScreen"} // Default screen
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
      }}
      drawerContent={(props) => (
        <View style={{ flex: 1, marginBottom: 30 }}>
          {/* Screens */}
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>

          {/* Actions */}
          <ResetProgressButton navigation={props.navigation} />
          <ThemeToggleButton />
          <VersionText />
        </View>
      )}
    >
      <Drawer.Screen
        name={"ChatbotScreen"}
        component={ChatbotScreen}
        options={{
          drawerLabel: ({ color }) => (
            <CustomText weight="Regular" style={{ color }}>
              Chatbot
            </CustomText>
          ),
          drawerIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name={"QuestionsScreen"}
        component={QuestionStackScreen}
        options={{
          drawerLabel: ({ color }) => (
            <CustomText weight="Regular" style={{ color }}>
              Câu hỏi đã lưu
            </CustomText>
          ),
          drawerIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="FeedbackScreen"
        component={FeedbackScreen}
        options={{
          drawerLabel: ({ color }) => (
            <CustomText weight="Regular" style={{ color }}>
              Phản hồi & góp ý
            </CustomText>
          ),
          drawerIcon: ({ color, size }) => <Ionicons name="mail-outline" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
};

const QuestionStackScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="QuestionsMain" component={QuestionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="QuestionListScreen" component={QuestionListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="QuestionGameScreen" component={QuestionGameScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
