import { Question } from "../../../models/question";
import { db } from "../../../core/service";

export const QuestionTable = {
  tableName: "Question",
  columnId: "id",
  columnQuestionId: "questionId",
  columnQuestion: "question",
  columnExplanation: "explanation",
  columnAudio: "audio",
  columnType: "type",
  columnIsGenerated: "isGenerated",
  columnLastUpdate: "lastUpdate",
};

export const AnswerTable = {
  tableName: "Answer",
  columnId: "id",
  columnAnswerId: "answerId",
  columnQuestionId: "questionId",
  columnAnswer: "answer",
  columnIsCorrect: "isCorrect",
  columnLastUpdate: "lastUpdate",
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
          ${QuestionTable.columnIsGenerated} INTEGER,
          ${QuestionTable.columnLastUpdate} INTEGER)`
    );

    db.execSync(
      `CREATE TABLE IF NOT EXISTS ${AnswerTable.tableName} (
          ${AnswerTable.columnId} INTEGER PRIMARY KEY AUTOINCREMENT,
          ${AnswerTable.columnAnswerId} INTEGER,
          ${AnswerTable.columnQuestionId} INTEGER,
          ${AnswerTable.columnAnswer} TEXT,
          ${AnswerTable.columnIsCorrect} INTEGER,
          ${AnswerTable.columnLastUpdate} INTEGER,
          FOREIGN KEY (${AnswerTable.columnQuestionId}) REFERENCES ${QuestionTable.tableName}(${QuestionTable.columnQuestionId}))`
    );
  });
};

export const updateQuestionTables = () => {
  const questionColumns = db.getAllSync(`PRAGMA table_info(${QuestionTable.tableName})`).map((row: any) => row.name);
  db.withTransactionSync(() => {
    Object.values(QuestionTable).forEach((column) => {
      if (column !== QuestionTable.tableName && !questionColumns.includes(column)) {
        // Add the column
        let columnType = "TEXT";
        if (
          column === QuestionTable.columnId ||
          column === QuestionTable.columnQuestionId ||
          column === QuestionTable.columnIsGenerated ||
          column === QuestionTable.columnLastUpdate
        ) {
          columnType = "INTEGER";
        }
        db.execSync(`ALTER TABLE ${QuestionTable.tableName} ADD COLUMN ${column} ${columnType}`);
      }
    });
  });

  const answerColumns = db.getAllSync(`PRAGMA table_info(${AnswerTable.tableName})`).map((row: any) => row.name);
  db.withTransactionSync(() => {
    Object.values(AnswerTable).forEach((column) => {
      if (column !== AnswerTable.tableName && !answerColumns.includes(column)) {
        // If missing, find the type
        let columnType = "TEXT";
        if (
          column === AnswerTable.columnId ||
          column === AnswerTable.columnQuestionId ||
          column === AnswerTable.columnIsCorrect ||
          column === AnswerTable.columnLastUpdate
        ) {
          columnType = "INTEGER";
        }

        // Add the column
        db.execSync(`ALTER TABLE ${AnswerTable.tableName} ADD COLUMN ${column} ${columnType}`);
      }
    });
  });
};

export const insertQuestions = (questions: Question[]) => {
  db.withTransactionSync(() => {
    const questionColumns = `(${QuestionTable.columnQuestionId}, ${QuestionTable.columnQuestion}, ${QuestionTable.columnExplanation}, ${QuestionTable.columnType}, ${QuestionTable.columnAudio})`;
    const questionValues = questions
      .map((question) => {
        const questionString = question.question.replaceAll('"', "'");
        const explanationString = question.explanation.replaceAll('"', "'");
        return `(${question.questionId}, "${questionString}", "${explanationString}", "${question.type}", "${question.audio}")`;
      })
      .join(", ");
    db.execSync(`INSERT INTO ${QuestionTable.tableName} ${questionColumns} VALUES ${questionValues}`);

    const answerColumns = `(${AnswerTable.columnQuestionId}, ${AnswerTable.columnAnswerId}, ${AnswerTable.columnAnswer}, ${AnswerTable.columnIsCorrect})`;
    const answerValues = questions
      .flatMap((question) =>
        question.answers.map((answer) => {
          const answerString = answer.text.replaceAll('"', "'");
          return `(${question.questionId}, ${answer.answerId}, "${answerString}", "${answer.isCorrect ? 1 : 0}")`;
        })
      )
      .join(", ");
    db.execSync(`INSERT INTO ${AnswerTable.tableName} ${answerColumns} VALUES ${answerValues}`);
  });
};

export const deleteQuestions = (questionIds: number[]) => {
  db.withTransactionSync(() => {
    db.execSync(`DELETE FROM ${AnswerTable.tableName} WHERE ${AnswerTable.columnQuestionId} IN (${questionIds.join(", ")})`);
    db.execSync(`DELETE FROM ${QuestionTable.tableName} WHERE ${QuestionTable.columnQuestionId} IN (${questionIds.join(", ")})`);
  });
};
