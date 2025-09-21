import * as SQLite from "expo-sqlite";
import { File, Directory, Paths } from "expo-file-system";
import { Asset } from "expo-asset";
import {
  createQuestionTable,
  updateQuestionTables,
  updateTestQuestionTables,
  updateTestTables,
} from "../../../storage/database/tables";

export const DB_NAME = "leslieai.db";
const ASSETS_DB_PATH = require("../../../../assets/databases/leslieai.db");

export const sqliteDir = new Directory(Paths.document, "SQLite");
export const dbFile = new File(sqliteDir, DB_NAME);

export const db = SQLite.openDatabaseSync(DB_NAME, undefined, sqliteDir.uri);

export const isDatabaseLoaded = async (): Promise<{ exists: boolean }> => {
  const info = dbFile.info();
  return { exists: info.exists };
};

export const logDatabasePath = () => {
  // Hàm này dùng để log đường dẫn tới file database
  console.log("Đường dẫn database:", dbFile.uri || dbFile.name);
};

export const loadDatabase = async () => {
  try {
    const { exists } = await isDatabaseLoaded();

    if (!exists) {
      try {
        sqliteDir.create({ intermediates: true });
      } catch (error) {}

      const asset = Asset.fromModule(ASSETS_DB_PATH);
      await asset.downloadAsync();

      if (asset.localUri) {
        // Nếu file database đã tồn tại, xóa nó trước khi ghi lại
        if (dbFile.exists) {
          try {
            dbFile.delete();
          } catch (error) {
            console.warn("Cannot delete old database:", error);
          }
        }
        const assetFile = new File(asset.localUri);
        assetFile.copy(dbFile);
        console.log("Database copied successfully");
      } else {
        console.warn("asset.localUri is undefined");
      }
    } else {
      console.log("Database already exists");
    }
  } catch (error) {
    console.error("Error loading database:", error);
    throw error;
  }
};

export const initializeDatabase = async () => {
  await loadDatabase();
  createQuestionTable();
  updateQuestionTables();
  updateTestTables();
  updateTestQuestionTables();
};
