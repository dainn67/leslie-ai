import { createFlashcard, createQuestion, createTest, Flashcard, Question, Test } from "../models";
import { createAnswer } from "../models/answer";
import { db } from "../core/service";
import { AnswerTable } from "../storage/database/tables";

export const getQuestionsFromQuery = (query: string): Question[] => {
  const questionRows = db.getAllSync(query);
  if (questionRows.length === 0) return [];

  const questions: Question[] = questionRows.map((row: any) => createQuestion(row));

  const answerQuery = `SELECT * FROM ${AnswerTable.tableName} WHERE ${AnswerTable.columnQuestionId} IN (${questions.map((question) => question.questionId).join(", ")})`;

  const answers = db.getAllSync(answerQuery);
  answers.forEach((answer: any) => {
    const question = questions.find((question) => question.questionId === answer.questionId);
    if (question) question.answers.push(createAnswer(answer));
  });

  return questions;
};

export const getTestsFromQuery = (query: string): Test[] => {
  const testRows = db.getAllSync(query);
  if (testRows.length === 0) return [];

  return testRows.map((row: any) => createTest(row));
};

export const getFlashcardsFromQuery = (query: string): Flashcard[] => {
  const flashcardRows = db.getAllSync(query);
  if (flashcardRows.length === 0) return [];

  return flashcardRows.map((row: any) => createFlashcard(row));
};
