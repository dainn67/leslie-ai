import { UserProgress, createUserProgress } from "../../models/userProgress";
import { convertDateToDDMMYYYY } from "../../utils";
import { AsyncStorageService } from "./storageServices/asyncStorageService";

export class UserProgressService {
  static getUserProgressFromStorage = async (): Promise<UserProgress> => {
    const userProgress = await AsyncStorageService.getUserProgress();
    return createUserProgress(userProgress);
  };

  static setUserProgressToStorage = async (userProgress: any) => {
    await AsyncStorageService.setUserProgress(userProgress);
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
