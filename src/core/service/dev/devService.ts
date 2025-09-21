import { db } from "../../../storage/database/database";

export const DB_NAME = "quiz.db";

export const createTables = () => {
  db.withTransactionSync(() => {
    db.execSync(
      `CREATE TABLE IF NOT EXISTS Question (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            questionId INTEGER,
            question TEXT,
            explanation TEXT,
            audio TEXT,
            type TEXT,
            isGenerated INTEGER,
            lastUpdate INTEGER
        );`
    );

    db.execSync(
      `CREATE TABLE IF NOT EXISTS Answer (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            answerId INTEGER,
            questionId INTEGER,
            answer TEXT,
            isCorrect INTEGER,
            lastUpdate INTEGER,
            FOREIGN KEY (questionId) REFERENCES Question(questionId)
        );`
    );

    db.execSync(
      `CREATE TABLE IF NOT EXISTS Test (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            type TEXT,
            lastUpdate INTEGER
        );`
    );

    db.execSync(
      `CREATE TABLE IF NOT EXISTS TestQuestion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            testId INTEGER,
            questionId INTEGER,
            lastUpdate INTEGER,
            FOREIGN KEY (testId) REFERENCES Test(id),
            FOREIGN KEY (questionId) REFERENCES Question(questionId)
        );`
    );
  });
};
