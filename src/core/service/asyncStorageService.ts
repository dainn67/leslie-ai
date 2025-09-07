import { loadFromAsyncStorage, saveToAsyncStorage } from "../../storage/asyncStorage/asyncStorage";
import { AsyncStorageConstants } from "../../storage/asyncStorage/asyncStorateConstant";

export class AsyncStorageService {
  // Onboarding
  static setOnboardingCompleted = async (completed: boolean) => {
    await saveToAsyncStorage(AsyncStorageConstants.ONBOARDING_COMPLETED, completed);
  };

  static getOnboardingCompleted = async () => {
    return await loadFromAsyncStorage(AsyncStorageConstants.ONBOARDING_COMPLETED);
  };

  static resetOnboardingCompleted = async () => {
    await saveToAsyncStorage(AsyncStorageConstants.ONBOARDING_COMPLETED, false);
  };

  // User progress
  static setUserProgress = async (userProgress: any) => {
    await saveToAsyncStorage(AsyncStorageConstants.USER_PROGRESS, userProgress);
  };

  static getUserProgress = async () => {
    return await loadFromAsyncStorage(AsyncStorageConstants.USER_PROGRESS);
  };

  // Theme
  static setTheme = async (theme: string) => {
    await saveToAsyncStorage(AsyncStorageConstants.THEME_MODE, theme);
  };

  static getTheme = async () => {
    return await loadFromAsyncStorage(AsyncStorageConstants.THEME_MODE);
  };
}
