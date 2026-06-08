import { NavigationContainer, Theme as NavTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isDark, isReady } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const navigationTheme = useMemo<NavTheme>(
    () => ({
      dark: isDark,
      colors: {
        primary: colors.primary,
        background: colors.bg,
        card: colors.bg,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
      fonts: {
        regular: { fontFamily: 'System', fontWeight: '400' },
        medium: { fontFamily: 'System', fontWeight: '500' },
        bold: { fontFamily: 'System', fontWeight: '600' },
        heavy: { fontFamily: 'System', fontWeight: '700' },
      },
    }),
    [colors, isDark],
  );

  if (isLoading || !isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.wordmark}>Agenda.lo</Text>
        <ActivityIndicator color={colors.text} size="small" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
      gap: 20,
    },
    wordmark: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
      letterSpacing: 0.3,
    },
  });
}
