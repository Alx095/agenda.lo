import { PropsWithChildren, ReactNode, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

type Props = PropsWithChildren<{
  scroll?: boolean;
  hero?: ReactNode;
  title?: string;
  subtitle?: string;
  contentStyle?: ViewStyle;
}>;

export function AppScreen({
  children,
  scroll = true,
  hero,
  title,
  subtitle,
  contentStyle,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const body = (
    <>
      {hero}
      <View style={[styles.content, contentStyle]}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {body}
          </ScrollView>
        ) : (
          <View style={styles.flex}>{body}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createAuthStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <Text style={styles.wordmark}>Agenda.lo</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      padding: 24,
      gap: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textMuted,
      lineHeight: 22,
    },
  });
}

function createAuthStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 28,
      paddingTop: 48,
      paddingBottom: 32,
      gap: 8,
    },
    wordmark: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      letterSpacing: 0.4,
      marginBottom: 12,
    },
    title: {
      fontSize: 32,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.8,
      lineHeight: 38,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
      lineHeight: 24,
      maxWidth: 300,
    },
  });
}
