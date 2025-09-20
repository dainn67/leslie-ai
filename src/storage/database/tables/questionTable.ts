import { createAnswer } from "../../../models/answer";
import { createQuestion, Question, QuestionType } from "../../../models/question";
import { db } from "../database";

export const QuestionTable = {
  tableName: "Question",
  columnId: "id",
  columnQuestionId: "questionId",
  columnQuestion: "question",
  columnExplanation: "explanation",
  columnAudio: "audio",
  columnType: "type",
  columnIsGenerated: "isGenerated",
};

export const AnswerTable = {
  tableName: "Answer",
  columnId: "id",
  columnAnswerId: "answerId",
  columnQuestionId: "questionId",
  columnAnswer: "answer",
  columnIsCorrect: "isCorrect",
};

export const createQuestionTable = () => {
  db.withTransactionSync(() => {
    db.execSync(
      `CREATE TABLE IF NOT EXISTS ${QuestionTable.tableName} (
          ${QuestionTable.columnId} INTEGER PRIMARY KEY AUTOINCREMENT,
          ${QuestionTable.columnQuestionId} INTEGER,
          ${QuestionTable.columnQuestion} TEXT,
          ${QuestionTable.columnExplanation} TEXT,
          ${QuestionTable.columnAudio} TEXT,
          ${QuestionTable.columnType} TEXT,
          ${QuestionTable.columnIsGenerated} INTEGER)`
    );

    db.execSync(
      `CREATE TABLE IF NOT EXISTS ${AnswerTable.tableName} (
          ${AnswerTable.columnId} INTEGER PRIMARY KEY AUTOINCREMENT,
          ${AnswerTable.columnAnswerId} INTEGER,
          ${AnswerTable.columnQuestionId} INTEGER,
          ${AnswerTable.columnAnswer} TEXT,
          ${AnswerTable.columnIsCorrect} INTEGER,
          FOREIGN KEY (${AnswerTable.columnQuestionId}) REFERENCES ${QuestionTable.tableName}(${QuestionTable.columnQuestionId}))`
    );
  });
};

export const updateTables = () => {
  const questionColumns = db.getAllSync(`PRAGMA table_info(${QuestionTable.tableName})`).map((row: any) => row.name);
  db.withTransactionSync(() => {
    Object.values(QuestionTable).forEach((column) => {
      if (column !== QuestionTable.tableName) {
        if (!questionColumns.includes(column)) {
          // Add the column
          let columnType =
            column === QuestionTable.columnId ||
            column === QuestionTable.columnQuestionId ||
            column === QuestionTable.columnIsGenerated
              ? "INTEGER"
              : "TEXT";
          db.execSync(`ALTER TABLE ${QuestionTable.tableName} ADD COLUMN ${column} ${columnType}`);
        }
      }
    });
  });

  const answerColumns = db.getAllSync(`PRAGMA table_info(${AnswerTable.tableName})`).map((row: any) => row.name);
  db.withTransactionSync(() => {
    Object.values(AnswerTable).forEach((column) => {
      if (column !== AnswerTable.tableName) {
        if (!answerColumns.includes(column)) {
          // If missing, find the type
          let columnType = "TEXT";
          if (
            column === AnswerTable.columnId ||
            column === AnswerTable.columnQuestionId ||
            column === AnswerTable.columnIsCorrect
          ) {
            columnType = "INTEGER";
          }

          // Add the column
          db.execSync(`ALTER TABLE ${AnswerTable.tableName} ADD COLUMN ${column} ${columnType}`);
        }
      }
    });
  });
};

export const getAllQuestions = (): Question[] => {
  const questionRows = db.getAllSync(`SELECT * FROM ${QuestionTable.tableName}`);

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

  const answerRows = db.getAllSync(`SELECT * FROM ${AnswerTable.tableName}`);

  answerRows.forEach((row: any) => {
    const question = questions.find((question) => question.questionId === row.questionId);
    if (question) {
      question.answers.push(
        createAnswer({
          answerId: row.answerId,
          questionId: row.questionId,
          text: row.answer,
          isCorrect: row.isCorrect,
        })
      );
    }
  });

  return questions;
};

export const insertQuestions = (questions: Question[]) => {
  db.withTransactionSync(() => {
    const questionValues = questions
      .map((question) => {
        const questionString = question.question.replaceAll('"', "'");
        const explanationString = question.explanation.replaceAll('"', "'");
        return `(${question.questionId}, "${questionString}", "${explanationString}", "${question.type}", "${question.audio}")`;
      })
      .join(", ");
    db.execSync(
      `INSERT INTO ${QuestionTable.tableName} (${QuestionTable.columnQuestionId}, ${QuestionTable.columnQuestion}, ${QuestionTable.columnExplanation}, ${QuestionTable.columnType}, ${QuestionTable.columnAudio}) VALUES ${questionValues}`
    );

    const answerValues = questions
      .flatMap((question) =>
        question.answers.map((answer) => {
          const answerString = answer.text.replaceAll('"', "'");
          return `(${question.questionId}, ${answer.answerId}, "${answerString}", "${answer.isCorrect ? 1 : 0}")`;
        })
      )
      .join(", ");
    db.execSync(
      `INSERT INTO ${AnswerTable.tableName} (${AnswerTable.columnQuestionId}, ${AnswerTable.columnAnswerId}, ${AnswerTable.columnAnswer}, ${AnswerTable.columnIsCorrect}) VALUES ${answerValues}`
    );
  });
};

export const getQuestionsByType = (type: QuestionType) => {
  const sql = `SELECT * FROM ${QuestionTable.tableName} WHERE ${QuestionTable.columnType} = "${type}"`;
  const questionRows = db.getAllSync(sql);

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

  const answerRows = db.getAllSync(
    `SELECT * FROM ${AnswerTable.tableName} WHERE ${AnswerTable.columnQuestionId} IN (${questions
      .map((question) => question.questionId)
      .join(", ")})`
  );

  answerRows.forEach((row: any) => {
    const question = questions.find((question) => question.questionId === row.questionId);
    if (question) {
      question.answers.push(
        createAnswer({
          answerId: row.answerId,
          questionId: row.questionId,
          text: row.answer,
          isCorrect: row.isCorrect,
        })
      );
    }
  });

  return questions;
};

export const deleteQuestion = (questionId: number) => {
  db.withTransactionSync(() => {
    db.execSync(`DELETE FROM ${AnswerTable.tableName} WHERE ${AnswerTable.columnQuestionId} = ${questionId}`);
    db.execSync(`DELETE FROM ${QuestionTable.tableName} WHERE ${QuestionTable.columnQuestionId} = ${questionId}`);
  });
};

export const clearAllTables = () => {
  db.withTransactionSync(() => {
    db.execSync(`DELETE FROM ${QuestionTable.tableName}`);
    db.execSync(`DELETE FROM ${AnswerTable.tableName}`);
  });
};

export const deleteAllTables = () => {
  db.withTransactionSync(() => {
    db.execSync(`DROP TABLE IF EXISTS ${QuestionTable.tableName}`);
    db.execSync(`DROP TABLE IF EXISTS ${AnswerTable.tableName}`);
  });
};
