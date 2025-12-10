import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../../../components/AppBar";
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import { BaseAppConfig } from "../../../constants/baseAppConfig";
import { updateUserProgress } from "../../userProgress/userProgressSlice";
import { createChatMessage, MessageStatus } from "../../../models/chatMessage";
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
import {
  AsyncStorageService,
  ChatbotService,
  firebaseService,
  adService,
  ToastService,
  reviewService,
  AppService,
} from "../../../core/service";
import { DifyConfig, FirebaseConstants } from "../../../constants";
import { NameDialog } from "../../../components/dialogs";
import { RootStackParamList } from "../../../core/app/RootNavigator";
import { DrawerParamList } from "../../../core/app/DrawerNavigator";
import { GameType } from "../../game/screens/GameScreen";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { Flashcard } from "../../../models";
import { BannerAds } from "../../ads/BannerAds";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../../theme";
import { KeyboardAvoidingView, Linking, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Keyboard } from "react-native";

// Composite navigation type to handle both drawer and stack navigation
type ChatbotScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, "ChatbotScreen">,
  NativeStackNavigationProp<RootStackParamList>
>;
type ChatbotScreenRouteProp = RouteProp<DrawerParamList, "ChatbotScreen">;

export const ChatbotScreen = () => {
  // Params
  const route = useRoute<ChatbotScreenRouteProp>();
  const initialMessage = route.params?.initialMessage || "";

  // Theme
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const navigation = useNavigation<ChatbotScreenNavigationProp>();
  const dialog = useDialog();

  const dispatch = useAppDispatch();

  // Data
  const messages = useAppSelector((state) => getMessagesByCID(state.chatbot));
  const difyConversationId = useAppSelector((state) => getDifyConversationIdByCID(state.chatbot));
  const conversationSummary = useAppSelector((state) => getConversationSummaryByCID(state.chatbot));

  const userProgress = useAppSelector((state) => state.userProgress.userProgress);
  const isGenerating = ![MessageStatus.DONE, MessageStatus.ERROR].includes(messages[messages.length - 1]?.status);

  const [nameDialogVisible, setNameDialogVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const initilized = useRef(false);

  useEffect(() => {
    const init = async () => {
      if (initialMessage) return;

      if (!initilized.current) {
        const { requireUpdate, internetConnection } = await AppService.init();

        if (!internetConnection) {
          dialog.showConfirm({
            message: t("chatbot_screen_no_internet"),
            onConfirm: () => {},
          });
        } else if (requireUpdate) {
          dialog.showConfirm({
            message: t("chatbot_screen_update_app"),
            canCancel: false,
            onConfirm: () => Linking.openURL(`${BaseAppConfig.playStoreBaseUrl}?id=${BaseAppConfig.androidPackageName}`),
          });
        }

        if (userProgress.userName.length === 0) {
          setNameDialogVisible(true);
        } else {
          const shouldAskExamDate = (await AsyncStorageService.getOpenAppCount()) == 3;
          const actionId = shouldAskExamDate
            ? DifyConfig.askExamDateActionId
            : userProgress.level
              ? DifyConfig.initChatActionId
              : DifyConfig.askLevelActionId;
          handleSend({ noUserMessage: true, actionId });
          initilized.current = true;
        }

        // Keyboard listener
        const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
        const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

        return () => {
          show.remove();
          hide.remove();
        };
      } else if (messages.length === 0) {
        const actionId = userProgress.level ? DifyConfig.initChatActionId : DifyConfig.askLevelActionId;
        handleSend({ noUserMessage: true, actionId });
      }
    };

    init();
  }, [messages.length]);

  // If open chatbot screen from another screen
  useEffect(() => {
    if (initialMessage) handleSend({ text: initialMessage });
  }, [initialMessage]);

  const handleManuallySend = (text: string) => {
    firebaseService.logClickEvent(FirebaseConstants.MESSAGE_SENT, { message: text });

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
    flashcards,
    shouldRequestRating,
  }: {
    text?: string;
    noUserMessage?: boolean;
    analyzeChatGame?: boolean;
    actionId?: string;
    newUserProgress?: UserProgress;
    flashcards?: Flashcard[];
    shouldRequestRating?: boolean;
  }) => {
    const message = text;
    const userMessage = createChatMessage({ fullText: message });

    // noUserMessage is for initial messages, analyze messages
    if (!noUserMessage) dispatch(addMessage({ message: userMessage }));

    const onRequestRating =
      shouldRequestRating && reviewService.canRequestAppReview()
        ? () => {
            dialog.showConfirm({
              message: t("chatbot_screen_request_rating"),
              confirmText: t("chatbot_screen_request_rating_confirm"),
              onConfirm: () => reviewService.requestAppReview(),
              onCancel: () => reviewService.ignoreAppReview(),
            });
          }
        : undefined;

    ChatbotService.sendStreamMessage({
      message,
      messages,
      conversationSummary,
      difyConversationId,
      userProgress: newUserProgress ?? userProgress,
      analyzeChatGame,
      actionId,
      flashcards,
      onRequestRating,
      dispatch,
    });
  };

  const handleClickAction = async (title: string, actionId?: string) => {
    firebaseService.logClickEvent(FirebaseConstants.ACTION_CLICKED, { actionId, title });

    const result = ChatbotService.handleClickAction({ actionId });

    if (result?.ui === "openDatePicker") {
      dialog.showDatePicker({ onSelect: handleSelectExamDate });
    } else if (result?.ui === "doDiagnostic") {
      const questions = result?.questions;
      if (!questions) {
        ToastService.show({ message: t("chatbot_cannot_load_question"), type: "error" });
      } else {
        navigation.navigate("GameScreen", { questions, gameType: GameType.Diagnostic });
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

    firebaseService.logClickEvent(FirebaseConstants.EXAM_DATE_SELECTED, { date: selectedDate.getTime() });

    const dateString = convertDateToDDMMYYYY(selectedDate, "vi");

    dispatch(updateUserProgress({ examDate: selectedDate.getTime() }));

    handleSend({
      text: dateString,
      newUserProgress: createTmpUserProgress(userProgress, { examDate: selectedDate.getTime() }),
    });
  };

  const handleAnalyze = (summary: string) => {
    setTimeout(() => {
      firebaseService.logClickEvent(FirebaseConstants.FINISH_ALL_GENERATED_QUESTIONS);

      // Analyze chat game
      handleSend({ text: summary, noUserMessage: true, analyzeChatGame: true, shouldRequestRating: true });

      // Analyze overtime progress
      ChatbotService.sendMessage({
        message: summary,
        type: "progress",
        data: {
          level: userProgress.level,
          target: userProgress.target,
          exam_date: userProgress.examDate ? convertDateToDDMMYYYY(userProgress.examDate) : "",
          prev_analytic: userProgress.analytic[normalizeDate(new Date())]?.toString() ?? "",
          current_date: convertDateToDDMMYYYY(new Date()),
        },
      }).then((result) => {
        dispatch(updateUserProgress({ newAnalytic: result }));
      });
    }, 1000);
  };

  const handleCreateQuestionFromFlashcard = (flashcards: Flashcard[]) => {
    const text = t("chatbot_create_question_from_flashcard");
    handleSend({ text, flashcards });
  };

  const handleClearChat = () => {
    dialog.showConfirm({
      message: t("chatbot_screen_delete_conversation"),
      onConfirm: () => {
        firebaseService.logClickEvent(FirebaseConstants.CLEAR_CHAT);
        dispatch(clearChat({}));
      },
    });
  };

  const handleOpenMenu = () => {
    firebaseService.logClickEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  const handleSetName = (name: string) => {
    firebaseService.logClickEvent(FirebaseConstants.ENTER_NAME, { name: name });

    dispatch(updateUserProgress({ userName: name }));
    setNameDialogVisible(false);

    handleSend({
      noUserMessage: true,
      actionId: DifyConfig.askLevelActionId,
      newUserProgress: createTmpUserProgress(userProgress, { userName: name }),
    });
    initilized.current = true;
  };

  const handleDevClick = async () => {
    // logDatabasePath();

    dialog.showConfirm({ message: "View rewarded Ad to support us ?", onConfirm: () => adService.showRewaredAd() });
    // adService.showInterstitialAd();
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppBar
            title={BaseAppConfig.name}
            leftIcon={<Ionicons name="menu" size={24} color="white" />}
            rightIcon={<Ionicons name="trash" size={24} color="white" />}
            onLeftPress={handleOpenMenu}
            onRightPress={handleClearChat}
            onDevClick={handleDevClick}
          />
          <View style={{ flex: 1 }}>
            <ChatMessageList
              messages={messages}
              onClickAction={handleClickAction}
              onAnalyze={handleAnalyze}
              onCreateQuestionFromFlashcard={handleCreateQuestionFromFlashcard}
            />
          </View>
          <BannerAds />
          <KeyboardAvoidingView behavior={"padding"} keyboardVerticalOffset={keyboardVisible ? 50 : 0}>
            <ChatInput disable={isGenerating} onSend={handleManuallySend} />
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
      </SafeAreaView>

      <NameDialog visible={nameDialogVisible} onConfirm={handleSetName} />
    </>
  );
};
