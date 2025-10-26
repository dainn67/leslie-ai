import * as SQLite from "expo-sqlite";
import { File, Directory, Paths } from "expo-file-system";
import { Asset } from "expo-asset";
import {
  clearQuestionTables,
  createQuestionTable,
  createTestQuestionTable,
  createTestTable,
  updateQuestionTables,
  updateTestQuestionTables,
  updateTestTables,
} from "../../../storage/database/tables";
import { AsyncStorageService } from "./asyncStorageService";
import { createFlashcardTable, updateFlashcardTables } from "../../../storage/database/tables/flashCardTable";

export const DB_NAME = "leslieai.db";
const ASSETS_DB_PATH = require("../../../../assets/databases/leslieai.db");

export const sqliteDir = new Directory(Paths.document, "databases");
export const dbFile = new File(sqliteDir, DB_NAME);

export let db: SQLite.SQLiteDatabase;

export const logDatabasePath = () => {
  console.log("Đường dẫn database:", dbFile.uri || dbFile.name);
};

export const loadDatabase = async () => {
  const exists = await AsyncStorageService.getFirstTimeLoadDatabase();

  if (!exists) {
    // Tạo thư mục nếu chưa tồn tại
    try {
      sqliteDir.create({ intermediates: true });
    } catch (error) {
      console.log("Error creating directory:", error);
    }

    // Tải database từ assets
    const asset = Asset.fromModule(ASSETS_DB_PATH);
    await asset.downloadAsync();

    if (!asset.localUri) console.error("Failed to download database asset");

    try {
      // If database file exists, delete it first
      const dbFileInfo = dbFile.info();
      if (dbFileInfo.exists) dbFile.delete();

      // Create new database file from asset
      const assetFile = new File(asset.localUri!);
      assetFile.copy(dbFile);

      await AsyncStorageService.setFirstTimeLoadDatabase(true);
    } catch (error) {
      console.error("Error loading database:", error);
    }
  }
  db = SQLite.openDatabaseSync(DB_NAME, undefined, sqliteDir.uri);
};

export const clearDatabase = () => {
  clearQuestionTables();
};

export const initializeDatabase = async () => {
  await loadDatabase();
  createQuestionTable();
  updateQuestionTables();

  createTestTable();
  updateTestTables();

  createTestQuestionTable();
  updateTestQuestionTables();

  createFlashcardTable();
  updateFlashcardTables();
};
