import { configureStore } from "@reduxjs/toolkit";
import chatbotReducer from "../../features/chatbot/slice/chatbotSlice";
import themeReducer from "../../features/theme/themeSlice";
import userProgressReducer from "../../features/userProgress/userProgressSlice";
import questionReducer from "../../features/questions/slice/questionSlice";
import gameReducer from "../../features/game/slice/gameSlice";
import appConfigReducer from "./AppConfig";

export const store = configureStore({
  reducer: {
    chatbot: chatbotReducer,
    userProgress: userProgressReducer,
    theme: themeReducer,
    questions: questionReducer,
    game: gameReducer,
    appConfig: appConfigReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
