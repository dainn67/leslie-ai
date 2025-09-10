import React, { useEffect, useState } from "react";

import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../../../components/AppBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import { AppConfig } from "../../../constants/appConfig";
import { updateUserProgress } from "../../userProgress/userProgressSlice";
import { createChatMessage, MessageStatus } from "../../../models/chatMessage";
import { MyDatePicker } from "../../../components/datePicker/MyDatePicker";
import { convertDateToDDMMYYYY, normalizeDate } from "../../../utils/utils";
import { DrawerParamList, MainStackParamList } from "../../../app/DrawerNavigator";
import { createTmpUserProgress } from "../../../models/userProgress";
import {
  getMessagesByCID,
  getDifyConversationIdByCID,
  getConversationSummaryByCID,
  addMessage,
  clearChat,
} from "../slice/chatbotSlice";
import { useDialog } from "../../../core/providers";
import { ChatMessageList, ChatInput } from "../components";
import { ChatbotService, FirebaseService } from "../../../core/service";
import { parseLevelActionId, parseTargetActionId } from "../../../utils";
import { DifyConfig, FirebaseConstants } from "../../../constants";
import { AsyncStorageService } from "../../../core/service/asyncStorageService";
import { NameDialog } from "../../common/dialogs";

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

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [nameDialogVisible, setNameDialogVisible] = useState(false);

  // Load user progress and add initial message when first open or clear
  useEffect(() => {
    if (userProgress.userName.length === 0) {
      // Get username
      setNameDialogVisible(true);
    } else {
      // Add initial message
      ChatbotService.sendStreamMessage({
        messages: messages,
        userProgress: userProgress,
        conversationSummary,
        difyConversationId,
        dispatch,
      });
    }
  }, []);

  // If open chatbot screen from another screen
  useEffect(() => {
    if (initialMessage) handleSend(initialMessage);
  }, [initialMessage]);

  const handleManuallySend = (message: string) => {
    FirebaseService.logEvent(FirebaseConstants.MESSAGE_SENT, {
      message: message,
    });

    handleSend(message);
  };

  const handleSend = (message: string) => {
    const data = message.trim();
    const userMessage = createChatMessage({ fullText: data });

    dispatch(addMessage({ message: userMessage }));

    ChatbotService.sendStreamMessage({
      message: data,
      messages: messages,
      conversationSummary,
      difyConversationId,
      userProgress: userProgress,
      dispatch,
    });
  };

  const handleClickAction = async (title: string, actionId?: string) => {
    FirebaseService.logEvent(FirebaseConstants.ACTION_CLICKED, {
      actionId: actionId,
      title: title,
    });

    let userLevel = userProgress.level;
    let userTarget = userProgress.target;

    if (actionId) {
      if (actionId.startsWith(DifyConfig.setExamDateActionId)) {
        FirebaseService.logEvent(FirebaseConstants.OPEN_EXAM_DATE_PICKER);
        setDatePickerVisible(true);
        return;
      } else if (actionId.startsWith(DifyConfig.unknownExamDateActionId)) {
        FirebaseService.logEvent(FirebaseConstants.SKIP_EXAM_DATE);
        dispatch(updateUserProgress({ examDate: 0 }));
        const userMessage = createChatMessage({ fullText: title });
        dispatch(addMessage({ message: userMessage }));

        ChatbotService.sendStreamMessage({
          messages: messages,
          actionId: actionId,
          userProgress: createTmpUserProgress(userProgress, { level: userLevel, target: userTarget, examDate: 0 }),
          conversationSummary,
          difyConversationId,
          dispatch,
        });

        return;
      } else if (actionId.startsWith(DifyConfig.setLevelActionId)) {
        userLevel = parseLevelActionId(actionId);
        dispatch(updateUserProgress({ level: userLevel }));
      } else if (actionId.startsWith(DifyConfig.setTargetActionId)) {
        userTarget = parseTargetActionId(actionId);
        dispatch(updateUserProgress({ target: userTarget }));
      }
    }

    const userMessage = createChatMessage({ fullText: title });

    dispatch(addMessage({ message: userMessage }));

    ChatbotService.sendStreamMessage({
      message: title,
      messages: messages,
      actionId: actionId,
      userProgress: createTmpUserProgress(userProgress, {
        level: userLevel.length > 0 ? userLevel : userProgress.level,
        target: userTarget.length > 0 ? userTarget : userProgress.target,
      }),
      conversationSummary,
      difyConversationId,
      dispatch,
    });
  };

  const handleSelectExamDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    FirebaseService.logEvent(FirebaseConstants.EXAM_DATE_SELECTED, {
      date: selectedDate.getTime(),
    });

    const dateString = convertDateToDDMMYYYY(selectedDate, "vi");

    dispatch(updateUserProgress({ examDate: selectedDate.getTime() }));

    const userMessage = createChatMessage({ fullText: dateString });
    dispatch(addMessage({ message: userMessage }));

    ChatbotService.sendStreamMessage({
      messages: messages,
      userProgress: createTmpUserProgress(userProgress, { examDate: selectedDate.getTime() }),
      conversationSummary,
      difyConversationId,
      dispatch,
    });
  };

  const handleAnalyze = (summary: string) => {
    setTimeout(() => {
      // Analyze chat game
      ChatbotService.sendStreamMessage({
        message: summary,
        messages: messages,
        userProgress: userProgress,
        analyzeChatGame: true,
        conversationSummary,
        difyConversationId,
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
    FirebaseService.logEvent(FirebaseConstants.CLEAR_CHAT);
    dialog.showConfirm("Xoá hội thoại?", () => dispatch(clearChat({})));
  };

  const handleOpenMenu = () => {
    FirebaseService.logEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  const handleSetName = (name: string) => {
    dispatch(updateUserProgress({ userName: name }));
    setNameDialogVisible(false);
  };

  const handleDevClick = () => {
    // deleteAllTables();
    // dispatch(clearUserProgress());

    AsyncStorageService.resetOnboardingCompleted();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Main chatbot screen */}
      <View style={{ flex: 1 }}>
        <AppBar
          title={AppConfig.name}
          leftIcon={<Ionicons name="menu" size={24} color="white" />}
          rightIcon={<Ionicons name="trash" size={24} color="white" />}
          onLeftPress={handleOpenMenu}
          onRightPress={handleClearChat}
          onDevClick={handleDevClick}
        />
        <ChatMessageList messages={messages} onClickAction={handleClickAction} onAnalyze={handleAnalyze} />
        <ChatInput disable={isGenerating} onSend={handleManuallySend} />
      </View>

      {/* Date picker to set exam date if not set */}
      <MyDatePicker
        visible={datePickerVisible}
        setVisible={setDatePickerVisible}
        date={userProgress.examDate ? new Date(userProgress.examDate) : new Date()}
        handleChange={handleSelectExamDate}
      />

      <NameDialog visible={nameDialogVisible} onConfirm={handleSetName} />
    </GestureHandlerRootView>
  );
};
