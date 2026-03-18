import AsyncStorage from "@react-native-async-storage/async-storage";

export const Storage = {
  get: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // silent
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // silent
    }
  },

  getJson: async <T>(key: string): Promise<T | null> => {
    try {
      const val = await AsyncStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },

  setJson: async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // silent
    }
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch {
      // silent
    }
  },
};