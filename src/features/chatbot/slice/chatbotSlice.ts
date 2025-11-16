import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { ChatMessage, createChatMessage, MessageStatus, MessageType, Sender, SuggestedAction } from "../../../models/chatMessage";
import { DifyConfig } from "../../../constants/difyConfig";
import { Question, Flashcard } from "../../../models/";

const mainCID = DifyConfig.mainChatbotConversationId;

type ChatbotState = {
  messages: { [key: string]: ChatMessage[] };
  difyConversationId: { [key: string]: string | undefined };
  conversationSummary: { [key: string]: string | undefined };
  suggestedPropmpt: string[];
};

const initialState: ChatbotState = {
  messages: {},
  difyConversationId: {},
  conversationSummary: {},
  suggestedPropmpt: [],
};

export const getMessagesByCID = createSelector(
  [(state: ChatbotState) => state, (state: ChatbotState, cid?: string) => cid],
  (state, cid) => state.messages[cid ?? mainCID] || []
);

export const getLatestMessageByCID = createSelector(
  [(state: ChatbotState) => state, (state: ChatbotState, cid?: string) => cid],
  (state, cid) => {
    const messages = state.messages[cid ?? mainCID] || [];
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }
);

export const getDifyConversationIdByCID = createSelector(
  [(state: ChatbotState) => state, (state: ChatbotState, cid?: string) => cid],
  (state, cid) => state.difyConversationId[cid ?? mainCID] || ""
);

export const getConversationSummaryByCID = createSelector(
  [(state: ChatbotState) => state, (state: ChatbotState, cid?: string) => cid],
  (state, cid) => state.conversationSummary[cid ?? mainCID] || ""
);

const chatbotSlice = createSlice({
  name: "chatbotState",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ cid?: string; message: ChatMessage }>) => {
      const cid = action.payload.cid ?? mainCID;
      state.messages[cid] = [...(state.messages[cid] || []), action.payload.message];
    },
    addLoading: (state, action: PayloadAction<{ cid?: string }>) => {
      const cid = action.payload.cid ?? mainCID;
      state.messages[cid] = [
        ...(state.messages[cid] || []),
        createChatMessage({
          status: MessageStatus.LOADING,
          sender: Sender.BOT,
        }),
      ];
    },
    updateConversationId: (state, action: PayloadAction<{ cid?: string; difyConversationId: string }>) => {
      const cid = action.payload.cid ?? mainCID;
      state.difyConversationId[cid] = action.payload.difyConversationId;
    },
    updateConversationSummary: (state, action: PayloadAction<{ cid?: string; conversationSummary: string }>) => {
      const cid = action.payload.cid ?? mainCID;
      if (action.payload.conversationSummary.trim().length != 0) {
        state.conversationSummary[cid] = action.payload.conversationSummary;
      }
    },
    updateMessageData: (
      state,
      action: PayloadAction<{
        cid?: string;
        messageId?: string;
        nextWord?: string;
        status?: MessageStatus;
        messageType?: MessageType;
        fullText?: string;
        questions?: Question[];
        flashcards?: Flashcard[];
        suggestedActions?: SuggestedAction[];
        summary?: string;
      }>
    ) => {
      const payload = action.payload;
      const cid = payload.cid ?? mainCID;
      const messageId = payload.messageId;

      const foundMessage = state.messages[cid]?.find((m) => m.messageId === messageId);
      const message = messageId && foundMessage ? foundMessage : state.messages[cid]?.at(-1);

      if (message) {
        if (!message.messageId && messageId) message.messageId = messageId;
        // Loop through the payload and map to fields if exist
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "nextWord") {
              message.words.push(value as string);
            } else {
              // @ts-ignore: dynamic gán thuộc tính
              message[key] = value;
            }
          }
        });
      }
    },
    clearChat: (state, action: PayloadAction<{ cid?: string }>) => {
      const cid = action.payload.cid ?? mainCID;
      state.messages[cid] = [];
      state.difyConversationId[cid] = undefined;
      state.conversationSummary[cid] = undefined;
    },
  },
});

export const { addMessage, addLoading, updateConversationId, updateConversationSummary, updateMessageData, clearChat } =
  chatbotSlice.actions;
export default chatbotSlice.reducer;
