import React, { useEffect, useState } from "react";
import TTSService from "../../../core/service/ttsService";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../../../components/AppBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import { AppConfig } from "../../../constants/appConfig";
import { clearUserProgress, setUserProgress, updateUserProgress } from "../../userProgress/userProgressSlice";
import { createQuestionTable, deleteAllTables, updateTables } from "../../../storage/database/tables";
import { createChatMessage, MessageStatus } from "../../../models/chatMessage";
import { MyDatePicker } from "../../../components/datePicker/MyDatePicker";
import { convertDateToDDMMYYYY, normalizeDate } from "../../../utils/utils";
import { loadFromAsyncStorage } from "../../../storage/asyncStorage/asyncStorage";
import { AsyncStorageConstants } from "../../../storage/asyncStorage/asyncStorateConstant";
import { setTheme } from "../../theme/themeSlice";
import { DrawerParamList, MainStackParamList } from "../../../app/DrawerNavigator";
import { createTmpUserProgress } from "../../../models/userProgress";
import {
  getMessagesByCID,
  getDifyConversationIdByCID,
  getConversationSummaryByCID,
  addLoading,
  addMessage,
  clearChat,
} from "../slice/chatbotSlice";
import { useDialog } from "../../../core/providers";
import { ChatMessageList, ChatInput } from "../components";
import { ChatbotService, FirebaseService, UserProgressService } from "../../../core/service";
import { parseLevelActionId, parseTargetActionId } from "../../../utils";
import { FirebaseConstants } from "../../../constants";

type ChatbotScreenNavigationProp = DrawerNavigationProp<DrawerParamList, "ChatbotScreen">;
type ChatbotScreenRouteProp = RouteProp<MainStackParamList, "ChatbotScreen">;

export const ChatbotScreen = () => {
  // Params
  const route = useRoute<ChatbotScreenRouteProp>();
  const { initialMessage } = route.params ? route.params : { initialMessage: "" };

  // Drawer
  const navigation = useNavigation<ChatbotScreenNavigationProp>();
  const dialog = useDialog();

  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => getMessagesByCID(state.chatbot));
  const difyConversationId = useAppSelector((state) => getDifyConversationIdByCID(state.chatbot));
  const conversationSummary = useAppSelector((state) => getConversationSummaryByCID(state.chatbot));

  const userProgress = useAppSelector((state) => state.userProgress.userProgress);
  const isGenerating = ![MessageStatus.DONE, MessageStatus.ERROR].includes(messages[messages.length - 1]?.status);

  const [initialized, setInitialized] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Load user progress and add initial message when first open or clear
  useEffect(() => {
    if (initialMessage) {
      console.log("initialMessage: ", initialMessage);
    }

    if (!initialized) {
      createQuestionTable();
      updateTables();
      TTSService.init();
      UserProgressService.getUserProgressFromStorage().then((userProgress) => {
        // Set user progress
        dispatch(setUserProgress(userProgress));
        setInitialized(true);

        // Add loading message
        dispatch(addLoading({}));
        ChatbotService.sendStreamMessage({
          messages: messages,
          userProgress: userProgress,
          conversationSummary,
          conversationId: difyConversationId,
          dispatch,
        });
      });

      loadFromAsyncStorage(AsyncStorageConstants.THEME_MODE).then((scheme) => {
        dispatch(setTheme(scheme));
      });
    } else if (messages.length === 0) {
      // Add loading message when clear
      dispatch(addLoading({}));
      ChatbotService.sendStreamMessage({
        messages: messages,
        userProgress: userProgress,
        conversationSummary,
        conversationId: difyConversationId,
        dispatch,
      });
    }
  }, [initialized, messages.length]);

  useEffect(() => {
    if (initialMessage) handleSend(initialMessage);
  }, [initialMessage]);

  const handleSend = (message: string) => {
    const data = message.trim();
    const userMessage = createChatMessage({ fullText: data });

    dispatch(addMessage({ message: userMessage }));
    dispatch(addLoading({}));

    ChatbotService.sendStreamMessage({
      message: data,
      messages: messages,
      conversationSummary,
      conversationId: difyConversationId,
      userProgress: userProgress,
      dispatch,
    });
  };

  const handleClickAction = async (title: string, actionId?: string) => {
    let userLevel = userProgress.level;
    let userTarget = userProgress.target;

    if (actionId) {
      const setExamDateActionId = "ed1";
      const unknownExamDateActionId = "ed2";
      const setLevelActionId = "l";
      const setTargetActionId = "t";

      if (actionId.startsWith(setExamDateActionId)) {
        setDatePickerVisible(true);
        return;
      } else if (actionId.startsWith(unknownExamDateActionId)) {
        dispatch(updateUserProgress({ examDate: 0 }));
        const userMessage = createChatMessage({ fullText: title });
        dispatch(addMessage({ message: userMessage }));
        dispatch(addLoading({}));

        ChatbotService.sendStreamMessage({
          messages: messages,
          actionId: actionId,
          userProgress: createTmpUserProgress(userProgress, { level: userLevel, target: userTarget, examDate: 0 }),
          conversationSummary,
          conversationId: difyConversationId,
          dispatch,
        });

        return;
      } else if (actionId.startsWith(setLevelActionId)) {
        userLevel = parseLevelActionId(actionId);
        dispatch(updateUserProgress({ level: userLevel }));
      } else if (actionId.startsWith(setTargetActionId)) {
        userTarget = parseTargetActionId(actionId);
        dispatch(updateUserProgress({ target: userTarget }));
      }
    }

    const userMessage = createChatMessage({ fullText: title });

    dispatch(addMessage({ message: userMessage }));
    dispatch(addLoading({}));

    ChatbotService.sendStreamMessage({
      message: title,
      messages: messages,
      actionId: actionId,
      userProgress: createTmpUserProgress(userProgress, {
        level: userLevel.length > 0 ? userLevel : userProgress.level,
        target: userTarget.length > 0 ? userTarget : userProgress.target,
      }),
      conversationSummary,
      conversationId: difyConversationId,
      dispatch,
    });
  };

  const handleSelectExamDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    const dateString = convertDateToDDMMYYYY(selectedDate, "vi");

    dispatch(updateUserProgress({ examDate: selectedDate.getTime() }));

    const userMessage = createChatMessage({ fullText: dateString });
    dispatch(addMessage({ message: userMessage }));
    dispatch(addLoading({}));

    ChatbotService.sendStreamMessage({
      messages: messages,
      userProgress: createTmpUserProgress(userProgress, { examDate: selectedDate.getTime() }),
      conversationSummary,
      conversationId: difyConversationId,
      dispatch,
    });
  };

  const handleAnalyze = (summary: string) => {
    setTimeout(() => {
      dispatch(addLoading({}));

      // Analyze chat game
      ChatbotService.sendStreamMessage({
        message: summary,
        messages: messages,
        userProgress: userProgress,
        analyzeChatGame: true,
        conversationSummary,
        conversationId: difyConversationId,
        dispatch,
      });

      // Analyze overtime progress
      ChatbotService.sendMessage({
        message: summary,
        type: "analyze_progress",
        data: {
          level: userProgress.level,
          target: userProgress.target,
          exam_date: userProgress.examDate ? convertDateToDDMMYYYY(userProgress.examDate) : "",
          prev_analytic: userProgress.analytic[normalizeDate(new Date())],
          current_date: convertDateToDDMMYYYY(new Date()),
        },
      }).then((result) => {
        dispatch(updateUserProgress({ analytic: result }));
      });
    }, 1000);
  };

  const handleClearChat = () => {
    dialog.showConfirm("Xoá hội thoại?", () => dispatch(clearChat({})));
  };

  const handleDevClick = () => {
    // deleteAllTables();
    // dispatch(clearUserProgress());

    FirebaseService.logEvent(FirebaseConstants.test);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Main chatbot screen */}
      <View style={{ flex: 1 }}>
        <AppBar
          title={AppConfig.name}
          leftIcon={<Ionicons name="menu" size={24} color="white" />}
          rightIcon={<Ionicons name="trash" size={24} color="white" />}
          onLeftPress={() => navigation.openDrawer()}
          onRightPress={handleClearChat}
          onDevClick={handleDevClick}
        />
        <ChatMessageList messages={messages} onClickAction={handleClickAction} onAnalyze={handleAnalyze} />
        <ChatInput disable={isGenerating} onSend={handleSend} />
      </View>

      {/* Date picker to set exam date if not set */}
      <MyDatePicker
        visible={datePickerVisible}
        setVisible={setDatePickerVisible}
        date={userProgress.examDate ? new Date(userProgress.examDate) : new Date()}
        handleChange={handleSelectExamDate}
      />
    </GestureHandlerRootView>
  );
};
