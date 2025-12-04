import { File, Directory, Paths } from "expo-file-system";
import { UserProgress, createUserProgress } from "../../models/userProgress";
import { convertDateToDDMMYYYY } from "../../utils";
import { AsyncStorageService } from "./storageServices/asyncStorageService";
import { BaseAppConfig } from "../../constants";

const dir = new Directory(Paths.document, "userProgress");
const file = new File(dir, "userProgress.json");

export class UserProgressService {
  static getUserProgressFromStorage = async (): Promise<UserProgress> => {
    const userProgress = await AsyncStorageService.getUserProgress();
    return createUserProgress(userProgress);
  };

  static setUserProgressToStorage = async (userProgress: any) => {
    await AsyncStorageService.setUserProgress(userProgress);

    if (BaseAppConfig.devMode) {
      try {
        dir.create();
        file.create();
      } catch (_) {}

      try {
        file.write(JSON.stringify(userProgress));
      } catch (_) {}
    }
  };

  static createUserProgressString = (analytic: { [key: string]: string }) => {
    let progress = "";
    Object.entries(analytic).forEach(([key, value]) => {
      progress += `${convertDateToDDMMYYYY(key)}: ${value}\n`;
    });
    progress = progress.trim();
    return progress;
  };
}
