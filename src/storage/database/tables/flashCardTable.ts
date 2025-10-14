import { db } from "../../../core/service";
import { FlashCard } from "../../../models";

export const FlashCardTable = {
  tableName: "FlashCard",
  columnId: "id",
  columnFlashCardId: "flashCardId",
  columnFront: "front",
  columnBack: "back",
  columnExplanation: "explanation",
  columnLevel: "level",
  columnLastUpdate: "lastUpdate",
};

export const createFlashCardTable = () => {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS ${FlashCardTable.tableName} (
        ${FlashCardTable.columnId} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${FlashCardTable.columnFlashCardId} INTEGER,
        ${FlashCardTable.columnFront} TEXT,
        ${FlashCardTable.columnBack} TEXT,
        ${FlashCardTable.columnExplanation} TEXT,
        ${FlashCardTable.columnLevel} TEXT,
        ${FlashCardTable.columnLastUpdate} INTEGER
    )`
  );
};

export const updateFlashCardTables = () => {
  const flashCardColumns = db.getAllSync(`PRAGMA table_info(${FlashCardTable.tableName})`).map((row: any) => row.name);
  db.withTransactionSync(() => {
    Object.values(FlashCardTable).forEach((column) => {
      if (column !== FlashCardTable.tableName && !flashCardColumns.includes(column)) {
        let columnType = "TEXT";
        if (
          column === FlashCardTable.columnId ||
          column === FlashCardTable.columnFlashCardId ||
          column === FlashCardTable.columnLastUpdate
        ) {
          columnType = "INTEGER";
        }
        db.execSync(`ALTER TABLE ${FlashCardTable.tableName} ADD COLUMN ${column} TEXT`);
      }
    });
  });
};

export const insertFlashCards = (flashCards: FlashCard[]) => {
  db.withTransactionSync(() => {
    const flashCardColumns = `(${FlashCardTable.columnFlashCardId}, ${FlashCardTable.columnFront}, ${FlashCardTable.columnBack}, ${FlashCardTable.columnExplanation}, ${FlashCardTable.columnLevel}, ${FlashCardTable.columnLastUpdate})`;
    const flashCardValues = flashCards
      .map(
        (flashCard) =>
          `(${flashCard.flashCardId}, "${flashCard.front}", "${flashCard.back}", "${flashCard.explanation}", "${flashCard.level}", ${flashCard.lastUpdate})`
      )
      .join(", ");
    db.execSync(`INSERT INTO ${FlashCardTable.tableName} ${flashCardColumns} VALUES ${flashCardValues}`);
  });
};

export const deleteFlashCards = (flashCardIds: number[]) => {
  db.withTransactionSync(() => {
    db.execSync(
      `DELETE FROM ${FlashCardTable.tableName} WHERE ${FlashCardTable.columnFlashCardId} IN (${flashCardIds.join(", ")})`
    );
  });
};
