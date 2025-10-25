import { Flashcard } from ".";
import { ChatbotService } from "../core/service";
import { Question } from "./question";

export enum Sender {
  USER = "user",
  BOT = "bot",
}

export enum MessageType {
  STREAM_TEXT = "stream_text",
  QUESTIONS = "questions",
  FLASHCARDS = "flashcards",
}

export enum MessageStatus {
  USER,
  LOADING,
  STREAMING,
  DONE,
  ERROR,
}

export type ChatMessage = {
  id: string;

  // Streaming text
  words: string[];
  fullText: string;
  wordsLength: number;

  // Data
  questions: Question[];
  flashcards: Flashcard[];
  suggestedActions: SuggestedAction[];

  // Type and sender
  messageType: MessageType;
  sender: Sender;
  status: MessageStatus;

  // Id when click suggested action
  actionId: number;
  summary: string;

  createdAt: string;
};

export const createChatMessage = (partial?: Partial<ChatMessage>): ChatMessage => {
  const fullText = partial?.fullText ?? "";
  const words = partial?.words ?? ChatbotService.splitCustomWords(fullText);
  const timestamp = new Date().toISOString();
  return {
    id: partial?.id ?? timestamp,
    fullText,
    words,
    wordsLength: partial?.wordsLength ?? words.length,
    questions: partial?.questions ?? [],
    flashcards: partial?.flashcards ?? [],
    suggestedActions: partial?.suggestedActions ?? [],
    sender: partial?.sender ?? Sender.USER,
    actionId: partial?.actionId ?? 0,
    summary: partial?.summary ?? "",
    messageType: partial?.messageType ?? MessageType.STREAM_TEXT,
    status: partial?.status ?? MessageStatus.USER,
    createdAt: partial?.createdAt ?? timestamp,
  };
};

export type SuggestedAction = {
  id?: string;
  title: string;
};
