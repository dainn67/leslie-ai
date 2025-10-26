import { db } from "../../../core/service";
import { Flashcard } from "../../../models";

export const FlashcardTable = {
  tableName: "Flashcard",
  columnId: "id",
  columnFlashcardId: "flashcardId",
  columnFront: "front",
  columnBack: "back",
  columnExplanation: "explanation",
  columnLevel: "level",
  columnLastUpdate: "lastUpdate",
};

export const createFlashcardTable = () => {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS ${FlashcardTable.tableName} (
        ${FlashcardTable.columnId} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${FlashcardTable.columnFlashcardId} INTEGER,
        ${FlashcardTable.columnFront} TEXT,
        ${FlashcardTable.columnBack} TEXT,
        ${FlashcardTable.columnExplanation} TEXT,
        ${FlashcardTable.columnLevel} TEXT,
        ${FlashcardTable.columnLastUpdate} INTEGER
    )`
  );
};

export const updateFlashcardTables = () => {
  const flashcardColumns = db.getAllSync(`PRAGMA table_info(${FlashcardTable.tableName})`).map((row: any) => row.name);
  db.withTransactionSync(() => {
    Object.values(FlashcardTable).forEach((column) => {
      if (column !== FlashcardTable.tableName && !flashcardColumns.includes(column)) {
        let columnType = "TEXT";
        if (
          column === FlashcardTable.columnId ||
          column === FlashcardTable.columnFlashcardId ||
          column === FlashcardTable.columnLastUpdate
        ) {
          columnType = "INTEGER";
        }
        db.execSync(`ALTER TABLE ${FlashcardTable.tableName} ADD COLUMN ${column} TEXT`);
      }
    });
  });
};

export const insertFlashcards = (flashCards: Flashcard[]) => {
  db.withTransactionSync(() => {
    const flashcardColumns = `(${FlashcardTable.columnFlashcardId}, ${FlashcardTable.columnFront}, ${FlashcardTable.columnBack}, ${FlashcardTable.columnExplanation}, ${FlashcardTable.columnLevel}, ${FlashcardTable.columnLastUpdate})`;
    const flashcardValues = flashCards
      .map(
        (flashCard) =>
          `(${flashCard.flashcardId}, "${flashCard.front}", "${flashCard.back}", "${flashCard.explanation}", "${flashCard.level}", ${flashCard.lastUpdate})`
      )
      .join(", ");
    db.execSync(`INSERT INTO ${FlashcardTable.tableName} ${flashcardColumns} VALUES ${flashcardValues}`);
  });
};

export const deleteFlashcards = (flashCardIds: number[]) => {
  db.withTransactionSync(() => {
    db.execSync(
      `DELETE FROM ${FlashcardTable.tableName} WHERE ${FlashcardTable.columnFlashcardId} IN (${flashCardIds.join(", ")})`
    );
  });
};
