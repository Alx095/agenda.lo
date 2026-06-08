import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const DEFAULT_API_URL =
  'https://agendalo-production-b282.up.railway.app';

function resolveApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const extraUrl =
    typeof Constants.expoConfig?.extra?.apiUrl === 'string'
      ? Constants.expoConfig.extra.apiUrl.trim()
      : undefined;

  const candidate = envUrl || extraUrl || DEFAULT_API_URL;

  if (Platform.OS !== 'web' && candidate.includes('localhost')) {
    return DEFAULT_API_URL;
  }

  if (!candidate.startsWith('http')) {
    return DEFAULT_API_URL;
  }

  return candidate;
}

export const API_URL = resolveApiUrl();

if (__DEV__) {
  console.log('[API] Platform:', Platform.OS);
  console.log('[API] Using base URL:', API_URL);
}
