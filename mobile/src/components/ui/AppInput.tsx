import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string | null;
};

export function AppInput({ label, hint, error, style, ...props }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.inputPlaceholder}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    wrapper: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    input: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 16,
      color: colors.text,
    },
    inputError: {
      borderColor: colors.danger,
    },
    hint: {
      fontSize: 13,
      color: colors.textSoft,
      lineHeight: 18,
    },
    error: {
      fontSize: 13,
      color: colors.danger,
    },
  });
}
