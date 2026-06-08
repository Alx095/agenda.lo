import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { AppButton } from './AppButton';

type Props = {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, subtitle, actionLabel, onAction }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          variant="secondary"
          onPress={onAction}
          fullWidth={false}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 56,
      paddingHorizontal: 32,
    },
    line: {
      width: 32,
      height: 2,
      backgroundColor: colors.primary,
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
      maxWidth: 280,
    },
    button: {
      paddingHorizontal: 20,
    },
  });
}
