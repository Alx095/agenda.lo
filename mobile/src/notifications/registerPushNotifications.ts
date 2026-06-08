import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { updatePushTokenRequest } from '../api/users';

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

function getExpoProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  if (!Device.isDevice) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  if (!Device.isDevice) {
    if (__DEV__) {
      console.log('[Push] Push tokens require a physical device');
    }
    return null;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    if (__DEV__) {
      console.log('[Push] Notification permission not granted');
    }
    return null;
  }

  await ensureAndroidNotificationChannel();

  const projectId = getExpoProjectId();
  if (!projectId) {
    if (__DEV__) {
      console.log(
        '[Push] Missing EAS projectId. Set EXPO_PUBLIC_EAS_PROJECT_ID in .env',
      );
    }
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenResponse.data;
}

export async function registerPushNotifications(): Promise<string | null> {
  try {
    const pushToken = await getExpoPushToken();

    if (!pushToken) {
      return null;
    }

    await updatePushTokenRequest(pushToken);

    if (__DEV__) {
      console.log('[Push] Token registered with backend');
    }

    return pushToken;
  } catch (error) {
    if (__DEV__) {
      console.log('[Push] Failed to register push token:', error);
    }

    return null;
  }
}
