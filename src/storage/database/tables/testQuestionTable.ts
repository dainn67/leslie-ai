import { TestTable } from ".";
import { db } from "../../../core/service";
import { TestType } from "../../../models";

export const TestQuestionTable = {
  tableName: "TestQuestion",
  columnId: "id",
  columnTestId: "testId",
  columnQuestionId: "questionId",
  columnLastUpdate: "lastUpdate",
};

export const createTestQuestionTable = () => {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS ${TestQuestionTable.tableName} (
        ${TestQuestionTable.columnId} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${TestQuestionTable.columnTestId} INTEGER,
        ${TestQuestionTable.columnQuestionId} INTEGER,
        ${TestQuestionTable.columnLastUpdate} INTEGER
    )`
  );
};

export const updateTestQuestionTables = () => {
  const testQuestionColumns = db.getAllSync(`PRAGMA table_info(${TestQuestionTable.tableName})`).map((row: any) => row.name);
  db.withTransactionSync(() => {
    Object.values(TestQuestionTable).forEach((column) => {
      if (column !== TestQuestionTable.tableName && !testQuestionColumns.includes(column)) {
        db.execSync(`ALTER TABLE ${TestQuestionTable.tableName} ADD COLUMN ${column} INTEGER`);
      }
    });
  });
};
