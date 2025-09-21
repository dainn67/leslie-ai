import { db } from "../../../storage/database/database";
import { Question, QuestionType } from "../../../models/question";
import { QuestionTable, TestQuestionTable } from "../../../storage/database/tables";
import { getQuestionsFromQuery } from "../../../utils";

export const createReviseQuestionSet = (questions: Question[], amount: number): Question[] => {
  return questions.sort(() => Math.random() - 0.5).slice(0, amount);
};

export const createResultSummary = (questions: Question[], mapAnswers: { [key: number]: number }) => {
  let summary = "";

  for (const [index, question] of questions.entries()) {
    let questionString = `Question ${index + 1}: ${question.question}`.replaceAll("\n", " ");
    let answerString = "";

    const answerId = mapAnswers[question.questionId];

    const correctAnswer = question.answers.find((a) => a.isCorrect);
    const userAnswer = question.answers.find((a) => a.answerId === answerId);

    if (answerId === undefined) {
      answerString = "User skip this question";
    } else if (answerId === correctAnswer?.answerId) {
      answerString = `User correctly answered ${userAnswer?.text}`;
    } else {
      answerString = `User answered ${userAnswer?.text} but correct answer is ${correctAnswer?.text}`;
    }

    summary += `${questionString}. ${answerString}. `;
  }

  return summary;
};

export const shuffleQuestionAnswers = (questions: Question[]) => {
  return questions.map((q) => {
    const shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);
    return {
      ...q,
      answers: shuffledAnswers,
    };
  });
};

export const getAllQuestions = (): Question[] => {
  const query = `SELECT * FROM ${QuestionTable.tableName}`;
  return getQuestionsFromQuery(query);
};

export const getQuestionsByType = (type: QuestionType) => {
  const sql = `SELECT * FROM ${QuestionTable.tableName} WHERE ${QuestionTable.columnType} = "${type}"`;
  return getQuestionsFromQuery(sql);
};

export const getQuestionsByTestId = (testId: number) => {
  const questionIdSql = `SELECT ${TestQuestionTable.columnQuestionId} FROM ${TestQuestionTable.tableName} WHERE ${TestQuestionTable.columnTestId} = ${testId}`;

  const idRows = db.getAllSync(questionIdSql);
  const questionIds = idRows.map((row: any) => row.questionId);

  const questionSql = `SELECT * FROM ${QuestionTable.tableName} WHERE ${QuestionTable.columnQuestionId} IN (${questionIds.join(", ")})`;
  return getQuestionsFromQuery(questionSql);
};
