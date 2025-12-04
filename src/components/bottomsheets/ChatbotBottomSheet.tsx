import React, { useEffect } from "react";
import { View, StyleSheet, Modal, TouchableWithoutFeedback, Dimensions, TouchableOpacity } from "react-native";
import { BaseAppConfig } from "../../constants/baseAppConfig";
import { CustomText } from "../text/customText";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { createChatMessage, MessageStatus } from "../../models/chatMessage";
import {
  addMessage,
  clearChat,
  getDifyConversationIdByCID,
  getConversationSummaryByCID,
  getLatestMessageByCID,
  getMessagesByCID,
} from "../../features/chatbot/slice/chatbotSlice";
import { ChatbotService } from "../../core/service";
import { Question } from "../../models/question";
import { ChatInput } from "../../features/chatbot/components/ChatInput";
import { ChatMessageList } from "../../features/chatbot/components/ChatMessageList";
import { useDialog } from "../../core/providers";
import { useTranslation } from "react-i18next";

interface ChatbotBottomSheetProps {
  visible: boolean;
  question: Question;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const ChatbotBottomSheet: React.FC<ChatbotBottomSheetProps> = ({ visible, question, onClose }) => {
  const questionId = question.questionId.toString();
  const { t } = useTranslation();

  const messages = useAppSelector((state) => getMessagesByCID(state.chatbot, questionId));
  const latestMessage = useAppSelector((state) => getLatestMessageByCID(state.chatbot, questionId));
  const difyConversationId = useAppSelector((state) => getDifyConversationIdByCID(state.chatbot, questionId));
  const conversationSummary = useAppSelector((state) => getConversationSummaryByCID(state.chatbot, questionId));

  const userProgress = useAppSelector((state) => state.userProgress.userProgress);

  const isGenerating = latestMessage ? ![MessageStatus.DONE, MessageStatus.ERROR].includes(latestMessage.status) : false;

  const dispatch = useAppDispatch();
  const dialog = useDialog();

  useEffect(() => {
    if (visible && messages.length === 0) {
      ChatbotService.sendStreamMessage({
        message: "Give a hint",
        messages,
        question,
        questionId,
        difyConversationId,
        conversationSummary,
        dispatch,
      });
    }
  }, [visible, messages.length]);

  const onClickAction = (title: string) => {
    const userMessage = createChatMessage({ fullText: title });

    dispatch(addMessage({ cid: questionId, message: userMessage }));

    ChatbotService.sendStreamMessage({
      message: title,
      messages,
      question,
      questionId,
      difyConversationId,
      conversationSummary,
      userProgress,
      dispatch,
    });
  };

  const handleSend = (message: string) => {
    const data = message.trim();
    const userMessage = createChatMessage({ fullText: data });

    dispatch(addMessage({ cid: questionId, message: userMessage }));

    ChatbotService.sendStreamMessage({
      message: data,
      messages,
      question,
      questionId,
      difyConversationId,
      conversationSummary,
      userProgress,
      dispatch,
    });
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Main Content */}
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.closeButton}>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color="black" />
                  </TouchableOpacity>
                </View>
                <View style={styles.titleContainer}>
                  <CustomText style={styles.headerText}>Trợ lý {BaseAppConfig.name}</CustomText>
                </View>
                <View style={styles.closeButton}>
                  <TouchableOpacity
                    onPress={() =>
                      dialog.showConfirm(t("chatbot_screen_delete_conversation"), () => {
                        dispatch(clearChat({ cid: questionId }));
                      })
                    }
                  >
                    <Ionicons name="trash" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Message List */}
              <ChatMessageList messages={messages} onClickAction={onClickAction} />

              <ChatInput disable={isGenerating} onSend={handleSend} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "white",
    height: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
  },
  closeButton: {
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  clearButton: {
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
