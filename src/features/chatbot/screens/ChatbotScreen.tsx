import React, { useEffect, useRef, useState } from "react";

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
import { createTmpUserProgress, UserProgress } from "../../../models/userProgress";
import {
  getMessagesByCID,
  getDifyConversationIdByCID,
  getConversationSummaryByCID,
  addMessage,
  clearChat,
} from "../slice/chatbotSlice";
import { useDialog } from "../../../core/providers";
import { ChatMessageList, ChatInput } from "../components";
import { AsyncStorageService, ChatbotService, FirebaseService, logDatabasePath, ToastService } from "../../../core/service";
import { DifyConfig, FirebaseConstants } from "../../../constants";
import { NameDialog } from "../../common/dialogs";
import { RootStackParamList } from "../../../app/RootNavigator";

type ChatbotScreenNavigationProp = DrawerNavigationProp<RootStackParamList, "Main">;
type ChatbotScreenRouteProp = RouteProp<RootStackParamList, "Main">;

export const ChatbotScreen = () => {
  // Params
  const route = useRoute<ChatbotScreenRouteProp>();
  const initialMessage = route.params?.initialMessage || "";

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

  const initilized = useRef(false);

  // Initial message when first open / clear chat
  useEffect(() => {
    if (initialMessage) return;

    if (!initilized.current) {
      if (userProgress.userName.length === 0) {
        setNameDialogVisible(true);
      } else {
        const actionId = userProgress.level ? DifyConfig.initChatActionId : DifyConfig.askLevelActionId;
        handleSend({ noUserMessage: true, actionId });
        initilized.current = true;
      }
    } else if (messages.length === 0) {
      const actionId = userProgress.level ? DifyConfig.initChatActionId : DifyConfig.askLevelActionId;
      handleSend({ noUserMessage: true, actionId });
    }
  }, [messages.length]);

  // If open chatbot screen from another screen
  useEffect(() => {
    if (initialMessage) handleSend({ text: initialMessage });
  }, [initialMessage]);

  const handleManuallySend = (text: string) => {
    FirebaseService.logEvent(FirebaseConstants.MESSAGE_SENT, { message: text });

    // Use actionId if user haven't set level yet
    const actionId = userProgress.level ? undefined : DifyConfig.askLevelActionId;
    handleSend({ text, actionId });
  };

  const handleSend = ({
    text,
    noUserMessage = false,
    analyzeChatGame = false,
    actionId,
    newUserProgress,
  }: {
    text?: string;
    noUserMessage?: boolean;
    analyzeChatGame?: boolean;
    actionId?: string;
    newUserProgress?: UserProgress;
  }) => {
    const message = text;
    const userMessage = createChatMessage({ fullText: message });

    // noUserMessage is for initial messages, analyze messages
    if (!noUserMessage) dispatch(addMessage({ message: userMessage }));

    ChatbotService.sendStreamMessage({
      message,
      messages,
      conversationSummary,
      difyConversationId,
      userProgress: newUserProgress ?? userProgress,
      analyzeChatGame,
      actionId,
      dispatch,
    });
  };

  const handleClickAction = async (title: string, actionId?: string) => {
    FirebaseService.logEvent(FirebaseConstants.ACTION_CLICKED, { actionId, title });

    const result = ChatbotService.handleClickAction({ actionId });

    if (result?.ui === "openDatePicker") {
      setDatePickerVisible(true);
    } else if (result?.ui === "doDiagnostic") {
      const questions = result?.questions;
      if (!questions) {
        ToastService.show({ message: "Không thể tải câu hỏi", type: "error" });
      } else {
        navigation.navigate("GameScreen", { questions: questions });
      }
    } else {
      const updatedData = result?.sendMessage;
      if (updatedData) dispatch(updateUserProgress(updatedData));

      handleSend({
        text: title,
        actionId,
        newUserProgress: updatedData ? createTmpUserProgress(userProgress, updatedData) : undefined,
      });
    }
  };

  const handleSelectExamDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    FirebaseService.logEvent(FirebaseConstants.EXAM_DATE_SELECTED, {
      date: selectedDate.getTime(),
    });

    const dateString = convertDateToDDMMYYYY(selectedDate, "vi");

    dispatch(updateUserProgress({ examDate: selectedDate.getTime() }));

    handleSend({
      text: dateString,
      newUserProgress: createTmpUserProgress(userProgress, { examDate: selectedDate.getTime() }),
    });
  };

  const handleAnalyze = (summary: string) => {
    setTimeout(() => {
      // Analyze chat game
      handleSend({ text: summary, noUserMessage: true, analyzeChatGame: true });

      // Analyze overtime progress
      ChatbotService.sendMessage({
        message: summary,
        type: "progress",
        data: {
          level: userProgress.level,
          target: userProgress.target,
          exam_date: userProgress.examDate ? convertDateToDDMMYYYY(userProgress.examDate) : "",
          prev_analytic: userProgress.analytic[normalizeDate(new Date())].toString(),
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
    FirebaseService.logEvent(FirebaseConstants.ENTER_NAME, { name: name });

    dispatch(updateUserProgress({ userName: name }));
    setNameDialogVisible(false);
    handleSend({ noUserMessage: true, actionId: DifyConfig.askLevelActionId });
    initilized.current = true;
  };

  const handleDevClick = () => {
    // handleClickAction("Điều chỉnh", DifyConfig.setDoDiagnostic);
    // logDatabasePath();
    AsyncStorageService.resetFirstTimeLoadDatabase();
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
