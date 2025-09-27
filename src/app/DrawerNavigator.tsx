import React from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { View } from "react-native";
import { useAppTheme } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "../components/text/customText";
import { ChatbotScreen } from "../features/chatbot/screens/ChatbotScreen";
import { FeedbackScreen } from "../features/feedback/FeedbackScreen";
import { QuestionsScreen } from "../features/questions/screens/QuestionsScreen";
import { VersionText, ResetProgressButton, ThemeToggleButton, SetExamDateButton } from "../features/drawer";
import { FirebaseConstants } from "../constants";
import { FirebaseService } from "../core/service";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "./RootNavigator";

const Drawer = createDrawerNavigator();
type ChatbotScreenRouteProp = RouteProp<RootStackParamList, "Main">;

export const DrawerNavigator = () => {
  const { colors } = useAppTheme();

  // Params
  const route = useRoute<ChatbotScreenRouteProp>();
  const initialMessage = route.params?.initialMessage || "";

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
          <SetExamDateButton />
          <ResetProgressButton navigation={props.navigation} />
          <ThemeToggleButton />
          <VersionText />
        </View>
      )}
    >
      <Drawer.Screen
        name={"ChatbotScreen"}
        component={ChatbotScreen}
        initialParams={{ initialMessage }}
        listeners={{
          drawerItemPress: (e) => {
            FirebaseService.logEvent(FirebaseConstants.OPEN_CHATBOT_SCREEN);
          },
        }}
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
        component={QuestionsScreen}
        listeners={{
          drawerItemPress: (e) => {
            FirebaseService.logEvent(FirebaseConstants.OPEN_SAVED_QUESTIONS_SCREEN);
          },
        }}
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
        listeners={{
          drawerItemPress: (e) => {
            FirebaseService.logEvent(FirebaseConstants.OPEN_FEEDBACK_SCREEN);
          },
        }}
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
