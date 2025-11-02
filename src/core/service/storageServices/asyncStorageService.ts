import { ThemeMode } from "../../../features/theme/themeSlice";
import { loadFromAsyncStorage, saveToAsyncStorage } from "../../../storage/asyncStorage/asyncStorage";
import { AsyncStorageConstants } from "../../../storage/asyncStorage/asyncStorateConstant";

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

  static updateOpenAppCount = async (): Promise<void> => {
    const openAppCount = await AsyncStorageService.getOpenAppCount();
    await saveToAsyncStorage(AsyncStorageConstants.OPEN_APP_COUNT, openAppCount + 1);
  };

  static getOpenAppCount = async (): Promise<number> => {
    return (await loadFromAsyncStorage(AsyncStorageConstants.OPEN_APP_COUNT)) ?? 0;
  };

  static resetOpenAppCount = async (): Promise<void> => {
    await saveToAsyncStorage(AsyncStorageConstants.OPEN_APP_COUNT, 0);
  };

  // Language
  static setLanguage = async (language: string): Promise<void> => {
    await saveToAsyncStorage(AsyncStorageConstants.LANGUAGE, language);
  };

  static getLanguage = async (): Promise<string> => {
    return (await loadFromAsyncStorage(AsyncStorageConstants.LANGUAGE)) ?? "en";
  };

  // User progress
  static setUserProgress = async (userProgress: any): Promise<void> => {
    await saveToAsyncStorage(AsyncStorageConstants.USER_PROGRESS, userProgress);
  };

  static getUserProgress = async (): Promise<any> => {
    return await loadFromAsyncStorage(AsyncStorageConstants.USER_PROGRESS);
  };

  // Theme
  static setTheme = async (theme: ThemeMode): Promise<void> => {
    await saveToAsyncStorage(AsyncStorageConstants.THEME_MODE, theme);
  };

  static getTheme = async (): Promise<ThemeMode> => {
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

  static clearData = async (): Promise<void> => {
    this.resetOpenAppCount();
  };

  // Api remote config
  static setIsUsingNginrok = async (isUsingNginrok: boolean): Promise<void> => {
    await saveToAsyncStorage(AsyncStorageConstants.IS_USING_NGINROK, isUsingNginrok);
  };

  static getIsUsingNginrok = async (): Promise<boolean> => {
    return (await loadFromAsyncStorage(AsyncStorageConstants.IS_USING_NGINROK)) ?? false;
  };
}
