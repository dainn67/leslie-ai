import { useTranslation } from "react-i18next";
import { Answer, createAnswer } from "./answer";

export enum QuestionType {
  Vocabulary = "vocabulary",
  Grammar = "grammar",
  Reading = "reading",
  Listening = "listening",
}

export const QuestionTypeTitles = (): Record<QuestionType, string> => {
  const { t } = useTranslation();
  return {
    [QuestionType.Vocabulary]: t("question_type_vocabulary"),
    [QuestionType.Grammar]: t("question_type_grammar"),
    [QuestionType.Reading]: t("question_type_reading"),
    [QuestionType.Listening]: t("question_type_listening"),
  };
};

export type Question = {
  questionId: number;
  question: string;
  answers: Answer[];
  explanation: string;
  audio: string;
  bookmarked: boolean;
  type: QuestionType;
};

export const createQuestion = (partial?: Partial<Question>): Question => {
  return {
    questionId: partial?.questionId ?? Date.now(),
    question: partial?.question ?? "",
    explanation: partial?.explanation ?? "",
    bookmarked: partial?.bookmarked ?? false,
    type: partial?.type ?? QuestionType.Vocabulary,
    audio: partial?.audio ?? "",
    answers: partial?.answers
      ? [...partial.answers]
          .sort(() => Math.random() - 0.5)
          .map((a, index) => createAnswer({ ...a, answerId: index, questionId: partial.questionId }))
      : [],
  };
};

export const createQuestionString = (question: Question) => {
  return `Question: ${question.question}. Answers: ${question.answers.map((a) => `${a.text}${a.isCorrect ? " (Correct)" : ""}`).join(". ")}. Explanation: ${question.explanation}`;
};
