import Constants from "expo-constants";
import { DiscordService, DiscordWebhookType } from "./discordService";
import { UserProgressService } from "./userProgressSerivice";
import { ApiClient } from "../../api/apiClient";
import { connectSSE } from "../../api/sseClient";
import { AppDispatch } from "../../app/store";
import { ApiConfig } from "../../constants/apiConfig";
import { DifyConfig } from "../../constants/difyConfig";
import {
  updateLastMessageData,
  updateConversationId,
  updateConversationSummary,
  addLoading,
} from "../../features/chatbot/slice/chatbotSlice";
import { MessageType, ChatMessage, MessageStatus, Sender } from "../../models/chatMessage";
import { Question, createQuestionString, createQuestion } from "../../models/question";
import { UserProgress } from "../../models/userProgress";
import { convertDateToDDMMYYYY } from "../../utils";

export const Delimiter = "--//--";

const {
  DIFY_CHAT_API_KEY,
  DIFY_ANALYZE_GAME_RESULT_API_KEY,
  DIFY_ASSISTANT_API_KEY,
  DIFY_EXTRACT_CONTEXT_API_KEY,
  DIFY_ANALYZE_PROGRESS_API_KEY,
} = Constants.expoConfig?.extra ?? {};

const user = "dainn";

export class ChatbotService {
  static splitCustomWords = (input: string) => {
    let splittedText: string[] = [];

    const largeChunk = input.split("\n");

    for (const chunk of largeChunk) {
      if (chunk.length === 0) continue;
      let text = chunk;

      // Remove incomplete special characters while streaming
      if (text[text.length - 1] == "\\") {
        text = text.substring(0, text.length - 1);
      }

      // Check incomplete special characters string
      const openBracketCount = (chunk.match(/\(/g) || []).length;
      const closeBracketCount = (chunk.match(/\)/g) || []).length;

      // Cut from incomplete special characters
      if (openBracketCount != closeBracketCount) {
        const lastIndex = chunk.lastIndexOf("\\(");
        if (lastIndex != -1) {
          text = text.substring(0, lastIndex);
        }
      }

      // Check and remove incomplete embedded actions
      const leftActionBracketCount = (chunk.match(/⟦⟦/g) || []).length;
      const rightActionBracketCount = (chunk.match(/⟧⟧/g) || []).length;

      if (leftActionBracketCount != rightActionBracketCount) {
        const lastIndex = chunk.lastIndexOf("⟦⟦");
        if (lastIndex != -1) {
          text = text.substring(0, lastIndex);
        }
      }

      // Process text character by character
      const words: string[] = [];
      let currentWord: string = "";
      let isBold = false;

      // First split into words, treating expressions and action brackets as single words
      let i = 0;
      while (i < text.length) {
        // Check for action brackets start
        if (i + 1 < text.length && text[i] == "⟦" && text[i + 1] == "⟦") {
          // If we had started a word, add it to words
          if (currentWord.length != 0) {
            words.push(currentWord);
            currentWord = "";
          }

          // Collect the entire action text as one word
          let actionText = "⟦⟦";
          i += 2; // Skip '⟦⟦'

          while (i < text.length) {
            if (i + 1 < text.length && text[i] == "⟧" && text[i + 1] == "⟧") {
              actionText += "⟧⟧";
              i += 2; // Skip '⟧⟧'
              break;
            } else {
              actionText += text[i];
              i++;
            }
          }

          words.push(actionText);
        }
        // Check for expression start
        else if (i + 1 < text.length && text[i] == "\\" && text[i + 1] == "(") {
          // If we had started a word, add it to words
          if (currentWord.length != 0) {
            words.push(currentWord);
            currentWord = "";
          }

          // Collect the entire expression as one word
          let expression = "\\(";
          i += 2; // Skip '\('

          while (i < text.length) {
            if (i + 1 < text.length && text[i] == "\\" && text[i + 1] == ")") {
              expression += "\\)";
              i += 2; // Skip '\)'
              break;
            } else {
              expression += text[i];
              i++;
            }
          }

          words.push(expression);
        } else if (text[i] == " ") {
          // Space character - finish current word if any
          if (currentWord.length != 0) {
            words.push(currentWord);
            currentWord = "";
          }
          i++;
        } else {
          // Regular character - add to current word
          currentWord += text[i];
          i++;
        }
      }

      // Add any remaining word
      if (currentWord.length != 0) {
        words.push(currentWord);
      }

      // Process bold formatting
      isBold = false;
      for (const word of words) {
        if (word.includes("**")) {
          const numberOfBold = (word.match(/\*\*/g) || []).length;
          if (numberOfBold % 2 == 1) isBold = !isBold;
          if (word == "**") continue;

          splittedText.push(`**${word.replaceAll("**", "")}**`);
        } else {
          if (isBold) {
            splittedText.push(`**${word}**`);
          } else {
            splittedText.push(word);
          }
        }
      }

      splittedText.push("\n");
    }

    // Trim text
    while (splittedText[splittedText.length - 1] == "\n") splittedText.pop();
    while (splittedText[0] == "\n") splittedText.shift();

    splittedText = splittedText.filter((e) => e.length > 0 && e != "**");

    const suggestionIndex = splittedText.findIndex((element) => element.includes(Delimiter));

    if (suggestionIndex !== -1) {
      const delimiterWord = splittedText[suggestionIndex];

      // Get index of word chunk that contains the delimiter
      const indexOfDelimiter = delimiterWord.indexOf(Delimiter);

      // Cut off the rest
      splittedText.splice(suggestionIndex, splittedText.length - suggestionIndex);

      // Check if the delimiter word chunk contains previous words of the response
      if (indexOfDelimiter > 0) {
        const previousWords = delimiterWord.slice(0, indexOfDelimiter).split(" ");

        splittedText.push(...previousWords);
      }
    }

    return splittedText;
  };

  static sendStreamMessage = ({
    message,
    messages,
    actionId,
    userProgress,
    analyzeChatGame,
    conversationSummary,
    questionId,
    difyConversationId,
    question,
    dispatch,
  }: {
    message?: string;
    messageType?: MessageType;
    messages: ChatMessage[];
    conversationHistory?: string;
    conversationSummary?: string;
    actionId?: string;
    analyzeChatGame?: boolean;
    questionId?: string;
    difyConversationId?: string;
    question?: Question;
    userProgress?: UserProgress;
    dispatch: AppDispatch;
  }) => {
    // Called at 2 places: Main chatbot and question chatbot assistant
    // Differentiate by passed in question

    dispatch(addLoading({ cid: questionId }));

    const token = question ? DIFY_ASSISTANT_API_KEY : DIFY_CHAT_API_KEY;

    let fullText = "";
    let wordIndex = 0;
    let wordLength = 0;
    let isQuestionJson = false;
    let startReceiveMessage = false;
    let hasError = false;

    const now = convertDateToDDMMYYYY(new Date());
    const userLevel = userProgress?.level ?? "";
    const userTarget = userProgress?.target ?? "";
    const userExamDate = userProgress?.examDate;
    const userProgressString = userProgress ? UserProgressService.createUserProgressString(userProgress.analytic) : "";

    let examDateString = "";
    if (userExamDate == 0) {
      examDateString = "User hasn't decided exam date yet";
    } else if (userExamDate) {
      const formattedExamDate = convertDateToDDMMYYYY(userExamDate);
      examDateString = `Now is ${now} and user JLPT exam date is ${formattedExamDate}`;
    }

    const conversationHistory = ChatbotService.createConversationHistory(messages);

    const questionString = question ? createQuestionString(question) : "";
    const cid = question?.questionId.toString() ?? DifyConfig.mainChatbotConversationId;

    // Original stream
    connectSSE({
      url: ApiConfig.difyServerUrl,
      token: token,
      body: {
        query: message ?? "none",
        inputs: {
          level: userLevel,
          target: userTarget,
          action_id: actionId,
          conversation_history: conversationHistory,
          conversation_summary: conversationSummary,
          current_date: now,
          exam_date: examDateString,
          analyze_chat_game: analyzeChatGame ? 1 : 0,
          question_string: questionString,
          user_progress_string: userProgressString,
        },
        conversation_id: difyConversationId,
        response_mode: "streaming",
        user: user,
        auto_generate_name: false,
      },
      onMessage: (data) => {
        const type = data["event"];
        const messageId = data["message_id"];
        const text = data["answer"];
        const conversationId = data["conversation_id"];
        const nodeTitle = data["data"]?.["title"];

        if (!isQuestionJson && nodeTitle && nodeTitle == DifyConfig.titleGenQuestions) {
          dispatch(updateLastMessageData({ messageType: MessageType.QUESTIONS, cid: cid }));
          isQuestionJson = true;
        }

        if (type === "message") {
          fullText += text;
        } else if (type === DifyConfig.typeWorkflowStart) {
          startReceiveMessage = true;
          dispatch(updateLastMessageData({ messageId, cid: cid }));
          dispatch(updateConversationId({ conversationId, cid: cid }));
        } else if (type === DifyConfig.typeMessageEnd) {
          const usage = data["metadata"]["usage"];
          console.log(
            `Tokens: ${usage["total_tokens"]} (${usage["prompt_tokens"]} input, ${usage["completion_tokens"]} completion) => ${usage["total_price"]} ${usage["currency"]}`
          );
        }
      },
      onDone: () => {
        wordLength = ChatbotService.splitCustomWords(fullText).length;
        dispatch(updateLastMessageData({ fullText: fullText, cid: cid }));
        if (isQuestionJson) {
          const { questions, summary } = ChatbotService.extractQuestionsFromJson(fullText);
          dispatch(updateLastMessageData({ questions, summary, status: MessageStatus.DONE, cid: cid }));
        }
      },
      onError: (error) => {
        console.log("SSE error", error);
        if (!hasError) {
          hasError = true;
          dispatch(updateLastMessageData({ status: MessageStatus.ERROR, cid: cid }));

          // Log errors
          DiscordService.sendDiscordMessage({
            message: `SSE error: ${JSON.stringify(error)}`,
            type: DiscordWebhookType.ERROR,
          });
        }
      },
    });

    const waitCondition = setInterval(() => {
      if (startReceiveMessage) {
        clearInterval(waitCondition);

        let startStreaming = false;
        const interval = setInterval(() => {
          if (isQuestionJson) clearInterval(interval);

          // Split word every time update to find latest words
          const words = ChatbotService.splitCustomWords(fullText);

          // Skip if new text haven't arrived yet
          if (words.length >= wordIndex + 1) {
            // Start streaming
            if (!startStreaming) {
              if (!isQuestionJson) dispatch(updateLastMessageData({ status: MessageStatus.STREAMING, cid: cid }));
              startStreaming = true;
            }

            const nextWord = words[wordIndex];
            dispatch(updateLastMessageData({ nextWord, cid: cid }));

            wordIndex++;

            // Stop interval at lastword, after original stream is done
            if (wordLength > 0 && wordIndex == wordLength - 1) {
              const lastWord = words[wordIndex];
              dispatch(updateLastMessageData({ nextWord: lastWord, cid: cid }));

              const splittedText = fullText.split(Delimiter);
              // Extract the suggested actions here to wait for the stream to finish
              const suggestedActions = ChatbotService.extractSuggestedActions(fullText);
              dispatch(updateLastMessageData({ suggestedActions, cid: cid }));

              // Extract the summary when finished
              const summary = splittedText[splittedText.length - 1].trim();
              dispatch(updateLastMessageData({ summary, cid: cid }));
              dispatch(updateLastMessageData({ status: MessageStatus.DONE, cid: cid }));

              clearInterval(interval);
            }
          }

          if (wordLength > 0 && wordIndex + 1 > wordLength) {
            const splittedText = fullText.split(Delimiter);
            // Extract the suggested actions here to wait for the stream to finish
            const suggestedActions = ChatbotService.extractSuggestedActions(fullText);
            dispatch(updateLastMessageData({ suggestedActions, cid: cid }));

            // Extract the summary when finished
            const summary = splittedText[splittedText.length - 1].trim();
            dispatch(updateLastMessageData({ summary, cid: cid }));
            dispatch(updateLastMessageData({ status: MessageStatus.DONE, cid: cid }));

            clearInterval(interval);
          }
        }, 20);
      }
    }, 200);

    // Extract the summary
    if (message) {
      ChatbotService.sendMessage({
        message: message ?? "",
        type: "context",
      }).then((result) => {
        dispatch(updateConversationSummary({ cid: cid, conversationSummary: result }));
      });
    }
  };

  static sendResultAnalytic({
    message,
    onYieldWord,
  }: {
    message: string;
    data?: { [key: string]: any };
    onYieldWord: (word: string) => void;
  }) {
    let fullText = "";
    let wordIndex = 0;
    let wordLength = 0;
    let startReceiveMessage = false;
    let hasError = false;

    // Original stream
    connectSSE({
      url: ApiConfig.difyServerUrl,
      token: DIFY_ANALYZE_GAME_RESULT_API_KEY,
      body: {
        query: message,
        inputs: {},
        response_mode: "streaming",
        user: user,
        auto_generate_name: false,
      },
      onMessage: (data) => {
        const type = data["event"];
        const text = data["answer"];

        if (type === "message") {
          fullText += text;
        } else if (type === DifyConfig.typeWorkflowStart) {
          startReceiveMessage = true;
        } else if (type === DifyConfig.typeMessageEnd) {
          const usage = data["metadata"]["usage"];
          console.log(
            `Tokens: ${usage["total_tokens"]} (${usage["prompt_tokens"]} input, ${usage["completion_tokens"]} completion) => ${usage["total_price"]} ${usage["currency"]}`
          );
        }
      },
      onDone: () => (wordLength = ChatbotService.splitCustomWords(fullText).length),
      onError: (error) => {
        console.log("SSE error", error);
        if (!hasError) hasError = true;
        DiscordService.sendDiscordMessage({
          message: `SSE error: ${JSON.stringify(error)}`,
          type: DiscordWebhookType.ERROR,
        });
      },
    });

    const waitCondition = setInterval(() => {
      if (startReceiveMessage) {
        clearInterval(waitCondition);

        const interval = setInterval(() => {
          // Split word every time update to find latest words
          const words = ChatbotService.splitCustomWords(fullText);

          // Skip if new text haven't arrived yet
          if (words.length >= wordIndex + 1) {
            const nextWord = words[wordIndex];
            onYieldWord(nextWord);

            wordIndex++;

            // Stop interval at lastword, after original stream is done
            if (wordLength > 0 && wordIndex == wordLength - 1) {
              const lastWord = words[wordIndex];
              onYieldWord(lastWord);
              clearInterval(interval);
            }
          }

          if (wordLength > 0 && wordIndex + 1 > wordLength) {
            clearInterval(interval);
          }
        }, 20);
      }
    }, 200);
  }

  static sendMessage = async ({
    message,
    type,
    data,
  }: {
    message: string;
    type: "context" | "progress";
    data?: { [key: string]: any };
  }) => {
    const token = type === "context" ? DIFY_EXTRACT_CONTEXT_API_KEY : DIFY_ANALYZE_PROGRESS_API_KEY;

    const result = await ApiClient.postData({
      url: ApiConfig.difyServerUrl,
      token: token,
      body: {
        query: message,
        inputs: data ?? {},
        response_mode: "blocking",
        user: user,
        auto_generate_name: false,
      },
    });

    console.log("result", result?.["answer"]?.trim());

    return result?.["answer"]?.trim() || "";
  };

  static createConversationHistory = (messages: ChatMessage[]) => {
    return messages
      .slice(-10)
      .map((m) => {
        const senderString = m.sender == Sender.BOT ? "Bot" : "User";
        let text = `(${senderString}): ${m.sender == Sender.BOT ? m.summary : m.fullText}`;
        if (text.endsWith(".")) text = text.slice(0, -1);
        return text;
      })
      .join(". ");
  };

  static extractQuestionsFromJson = (json: string): { questions: Question[]; summary: string } => {
    const dataString = json.replaceAll("```json", "").replaceAll("```", "").trim();
    const data = JSON.parse(dataString);
    const questions: Question[] = data["questions"].map((question: any, index: number) =>
      createQuestion({ ...question, questionId: Date.now() + index })
    );
    const summary = data["summary"];

    return { questions, summary };
  };

  static extractSuggestedActions = (fullText: string) => {
    const splittedText = fullText.split(Delimiter);
    if (splittedText.length > 2) {
      const suggestedActions = splittedText
        .slice(1, -1) // Remove the response and the summary
        .map((text) => {
          // Split by "-" or ":"
          let data = text.split("-");
          if (data.length < 2) data = text.split(":");
          if (data.length < 2) return { title: text };

          const [id, title] = data;
          return { id: id.trim(), title: title.trim() };
        })
        .filter((action) => action.title !== undefined && action.title !== null);

      return suggestedActions;
    }

    return [];
  };
}
