import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export type StoredTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

function isWebStorage() {
  return Platform.OS === 'web';
}

async function getWebItem(key: string): Promise<string | null> {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage.getItem(key);
}

async function setWebItem(key: string, value: string): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

async function deleteWebItem(key: string): Promise<void> {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
}

export async function getStoredTokens(): Promise<StoredTokens> {
  if (isWebStorage()) {
    const [accessToken, refreshToken] = await Promise.all([
      getWebItem(ACCESS_TOKEN_KEY),
      getWebItem(REFRESH_TOKEN_KEY),
    ]);

    return { accessToken, refreshToken };
  }

  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);

  return { accessToken, refreshToken };
}

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  if (isWebStorage()) {
    await Promise.all([
      setWebItem(ACCESS_TOKEN_KEY, accessToken),
      setWebItem(REFRESH_TOKEN_KEY, refreshToken),
    ]);
    return;
  }

  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  if (isWebStorage()) {
    await Promise.all([
      deleteWebItem(ACCESS_TOKEN_KEY),
      deleteWebItem(REFRESH_TOKEN_KEY),
    ]);
    return;
  }

  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
