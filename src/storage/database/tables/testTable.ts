import { db } from "../../../core/service";

export const TestTable = {
  tableName: "Test",
  columnId: "id",
  columnTitle: "name",
  columnType: "type",
  columnLastUpdate: "lastUpdate",
};

export const createTestTable = () => {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS ${TestTable.tableName} (
        ${TestTable.columnId} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${TestTable.columnTitle} TEXT,
        ${TestTable.columnType} TEXT,
        ${TestTable.columnLastUpdate} INTEGER
    )`
  );
};

export const updateTestTables = () => {
  const testColumns = db.getAllSync(`PRAGMA table_info(${TestTable.tableName})`).map((row: any) => row.name);
  db.withTransactionSync(() => {
    Object.values(TestTable).forEach((column) => {
      if (column !== TestTable.tableName && !testColumns.includes(column)) {
        let columnType = "TEXT";
        if (column === TestTable.columnId || column === TestTable.columnLastUpdate) {
          columnType = "INTEGER";
        }
        db.execSync(`ALTER TABLE ${TestTable.tableName} ADD COLUMN ${column} ${columnType}`);
      }
    });
  });
};
