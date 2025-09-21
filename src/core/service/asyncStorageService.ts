import { loadFromAsyncStorage, saveToAsyncStorage } from "../../storage/asyncStorage/asyncStorage";
import { AsyncStorageConstants } from "../../storage/asyncStorage/asyncStorateConstant";

export class AsyncStorageService {
  // Onboarding
  static setOnboardingCompleted = async (completed: boolean): Promise<void> => {
    await saveToAsyncStorage(AsyncStorageConstants.ONBOARDING_COMPLETED, completed);
  };

  static getOnboardingCompleted = async (): Promise<boolean> => {
    return await loadFromAsyncStorage(AsyncStorageConstants.ONBOARDING_COMPLETED);
  };

  static resetOnboardingCompleted = async (): Promise<void> => {
    await saveToAsyncStorage(AsyncStorageConstants.ONBOARDING_COMPLETED, false);
  };

  // User progress
  static setUserProgress = async (userProgress: any): Promise<void> => {
    await saveToAsyncStorage(AsyncStorageConstants.USER_PROGRESS, userProgress);
  };

  static getUserProgress = async (): Promise<any> => {
    return await loadFromAsyncStorage(AsyncStorageConstants.USER_PROGRESS);
  };

  // Theme
  static setTheme = async (theme: string): Promise<void> => {
    await saveToAsyncStorage(AsyncStorageConstants.THEME_MODE, theme);
  };

  static getTheme = async (): Promise<string> => {
    return await loadFromAsyncStorage(AsyncStorageConstants.THEME_MODE);
  };

  // First time load database
  static setFirstTimeLoadDatabase = async (firstTimeLoadDatabase: boolean): Promise<void> => {
    await saveToAsyncStorage(AsyncStorageConstants.FIRST_TIME_LOAD_DATABASE, firstTimeLoadDatabase);
  };

  static getFirstTimeLoadDatabase = async (): Promise<boolean> => {
    return (await loadFromAsyncStorage(AsyncStorageConstants.FIRST_TIME_LOAD_DATABASE)) ?? false;
  };

  static resetFirstTimeLoadDatabase = async (): Promise<void> => {
    await saveToAsyncStorage(AsyncStorageConstants.FIRST_TIME_LOAD_DATABASE, false);
  };
}
