import React from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { View } from "react-native";
import { useAppTheme } from "../../theme";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "../../components/text/customText";
import { ChatbotScreen } from "../../features/chatbot/screens/ChatbotScreen";
import { FeedbackScreen } from "../../features/feedback/FeedbackScreen";
import { QuestionsScreen } from "../../features/questions/screens/QuestionsScreen";
import { VersionText, ResetProgressButton, ThemeToggleButton, SetExamDateButton } from "../../features/drawer";
import { FirebaseConstants } from "../../constants";
import { FirebaseService } from "../service";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "./RootNavigator";
import { Divider } from "../../components/dividers/Divider";
import { ShareAppButton } from "../../features/drawer/ShareAppButton";
import { FlashcardScreen } from "../../features/flashcard/FlashcardScreen";
import { useTranslation } from "react-i18next";
import { LanguageButton } from "../../features/drawer/LanguageButton";
import { SafeAreaView } from "react-native-safe-area-context";

// Define DrawerParamList for type safety
export type DrawerParamList = {
  ChatbotScreen: { initialMessage?: string };
  QuestionsScreen: undefined;
  FlashCardScreen: undefined;
  FeedbackScreen: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();
type ChatbotScreenRouteProp = RouteProp<RootStackParamList, "Main">;

export const DrawerNavigator = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

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
        <SafeAreaView style={{ flex: 1, marginBottom: 8 }}>
          {/* Screens */}
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>

          {/* Actions */}

          <Divider />

          <SetExamDateButton />
          <ThemeToggleButton />

          <Divider />

          <ShareAppButton />
          <ResetProgressButton navigation={props.navigation} />

          <Divider />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <VersionText />
            <LanguageButton />
          </View>
        </SafeAreaView>
      )}
    >
      <Drawer.Screen
        name={"ChatbotScreen"}
        component={ChatbotScreen}
        initialParams={{ initialMessage }}
        listeners={{
          drawerItemPress: (e) => {
            FirebaseService.logClickEvent(FirebaseConstants.OPEN_CHATBOT_SCREEN);
          },
        }}
        options={{
          drawerLabel: ({ color }) => (
            <CustomText weight="Regular" style={{ color }}>
              {t("drawer_chatbot_title")}
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
            FirebaseService.logClickEvent(FirebaseConstants.OPEN_SAVED_QUESTIONS_SCREEN);
          },
        }}
        options={{
          drawerLabel: ({ color }) => (
            <CustomText weight="Regular" style={{ color }}>
              {t("drawer_saved_question_title")}
            </CustomText>
          ),
          drawerIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="FlashCardScreen"
        component={FlashcardScreen}
        listeners={{
          drawerItemPress: (e) => {
            FirebaseService.logClickEvent(FirebaseConstants.OPEN_FLASH_CARD_SCREEN);
          },
        }}
        options={{
          drawerLabel: ({ color }) => (
            <CustomText weight="Regular" style={{ color }}>
              {t("drawer_flashcard_title")}
            </CustomText>
          ),
          drawerIcon: ({ color, size }) => <Ionicons name="flash-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="FeedbackScreen"
        component={FeedbackScreen}
        listeners={{
          drawerItemPress: (e) => {
            FirebaseService.logClickEvent(FirebaseConstants.OPEN_FEEDBACK_SCREEN);
          },
        }}
        options={{
          drawerLabel: ({ color }) => (
            <CustomText weight="Regular" style={{ color }}>
              {t("drawer_feedback_title")}
            </CustomText>
          ),
          drawerIcon: ({ color, size }) => <Ionicons name="mail-outline" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
};
