import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToAsyncStorage = async (key: string, config: any) => {
  await AsyncStorage.setItem(key, JSON.stringify(config));
};

export const loadFromAsyncStorage = async (key: string) => {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
};

export const removeFromAsyncStorage = async (key: string) => {
  await AsyncStorage.removeItem(key);
};

export const clearAllAsyncStorage = async () => {
  await AsyncStorage.clear();
};
