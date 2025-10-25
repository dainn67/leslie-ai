import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { ChatMessage, createChatMessage, MessageStatus, MessageType, Sender, SuggestedAction } from "../../../models/chatMessage";
import { DifyConfig } from "../../../constants/difyConfig";
import { Question, FlashCard } from "../../../models/";

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
    updateConversationId: (state, action: PayloadAction<{ cid?: string; conversationId: string }>) => {
      const cid = action.payload.cid ?? mainCID;
      state.difyConversationId[cid] = action.payload.conversationId;
    },
    updateConversationSummary: (state, action: PayloadAction<{ cid?: string; conversationSummary: string }>) => {
      const cid = action.payload.cid ?? mainCID;
      if (action.payload.conversationSummary.trim().length != 0) {
        state.conversationSummary[cid] = action.payload.conversationSummary;
      }
    },
    updateLastMessageData: (
      state,
      action: PayloadAction<{
        cid?: string;
        messageId?: string;
        nextWord?: string;
        status?: MessageStatus;
        messageType?: MessageType;
        fullText?: string;
        questions?: Question[];
        flashcards?: FlashCard[];
        suggestedActions?: SuggestedAction[];
        summary?: string;
      }>
    ) => {
      const cid = action.payload.cid ?? mainCID;
      const message = state.messages[cid]?.at(-1);
      if (message) {
        // Loop through the payload and map to fields if exist
        Object.entries(action.payload).forEach(([key, value]) => {
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

export const { addMessage, addLoading, updateConversationId, updateConversationSummary, updateLastMessageData, clearChat } =
  chatbotSlice.actions;
export default chatbotSlice.reducer;
