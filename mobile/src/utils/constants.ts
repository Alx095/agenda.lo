import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LOCAL_API_URL = 'http://localhost:3000';

function resolveApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/^["']|["']$/g, '');
  const extraUrl =
    typeof Constants.expoConfig?.extra?.apiUrl === 'string'
      ? Constants.expoConfig.extra.apiUrl.trim().replace(/^["']|["']$/g, '')
      : undefined;

  const candidate = envUrl || extraUrl;

  if (!candidate || !candidate.startsWith('http')) {
    return LOCAL_API_URL;
  }

  if (Platform.OS !== 'web' && candidate.includes('localhost')) {
    return LOCAL_API_URL;
  }

  return candidate;
}

export const API_URL = resolveApiUrl();

if (__DEV__) {
  console.log('[API] Platform:', Platform.OS);
  console.log('[API] Using base URL:', API_URL);
}
