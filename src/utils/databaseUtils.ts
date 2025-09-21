import { createQuestion, createTest, Question, Test } from "../models";
import { createAnswer } from "../models/answer";
import { db } from "../storage/database/database";
import { AnswerTable } from "../storage/database/tables";

export const getQuestionsFromQuery = (query: string): Question[] => {
  const questionRows = db.getAllSync(query);
  if (questionRows.length === 0) return [];

  const questions: Question[] = questionRows.map((row: any) =>
    createQuestion({
      questionId: row.questionId,
      question: row.question,
      explanation: row.explanation,
      answers: [],
      bookmarked: row.bookmarked,
      audio: row.audio,
      type: row.type,
    })
  );

  const answerQuery = `SELECT * FROM ${AnswerTable.tableName} WHERE ${AnswerTable.columnQuestionId} IN (${questions.map((question) => question.questionId).join(", ")})`;

  const answers = db.getAllSync(answerQuery);
  answers.forEach((answer: any) => {
    const question = questions.find((question) => question.questionId === answer.questionId);
    if (question) {
      question.answers.push(
        createAnswer({
          answerId: answer.answerId,
          questionId: answer.questionId,
          text: answer.answer,
          isCorrect: answer.isCorrect,
        })
      );
    }
  });

  return questions;
};

export const getTestsFromQuery = (query: string): Test[] => {
  const testRows = db.getAllSync(query);
  if (testRows.length === 0) return [];

  return testRows.map((row: any) => createTest(row));
};
