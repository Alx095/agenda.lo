import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ThemeMode } from './types';

const THEME_MODE_KEY = 'theme_mode';

function isWebStorage() {
  return Platform.OS === 'web';
}

export async function getStoredThemeMode(): Promise<ThemeMode | null> {
  try {
    if (isWebStorage()) {
      const value =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem(THEME_MODE_KEY)
          : null;
      return value === 'light' || value === 'dark' || value === 'system'
        ? value
        : null;
    }

    const value = await SecureStore.getItemAsync(THEME_MODE_KEY);
    return value === 'light' || value === 'dark' || value === 'system'
      ? value
      : null;
  } catch {
    return null;
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  if (isWebStorage()) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_MODE_KEY, mode);
    }
    return;
  }

  await SecureStore.setItemAsync(THEME_MODE_KEY, mode);
}
