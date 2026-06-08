import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext';
import { BusinessProvider } from './src/business/BusinessContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { RootNavigator } from './src/navigation/RootNavigator';
import { setupNotificationHandler } from './src/notifications/registerPushNotifications';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  useEffect(() => {
    setupNotificationHandler();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <BusinessProvider>
              <RootNavigator />
              <ThemedStatusBar />
            </BusinessProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
