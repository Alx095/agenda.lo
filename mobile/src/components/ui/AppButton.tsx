import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  fullWidth = true,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'secondary' || variant === 'ghost'
              ? colors.text
              : colors.textInverse
          }
        />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label` as const]]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    base: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    fullWidth: {
      alignSelf: 'stretch',
    },
    primary: {
      backgroundColor: colors.text,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.danger,
    },
    dark: {
      backgroundColor: colors.bgDark,
    },
    disabled: {
      opacity: 0.45,
    },
    pressed: {
      opacity: 0.88,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
    primaryLabel: {
      color: colors.textInverse,
    },
    secondaryLabel: {
      color: colors.text,
    },
    ghostLabel: {
      color: colors.textMuted,
    },
    dangerLabel: {
      color: colors.textInverse,
    },
    darkLabel: {
      color: colors.textInverse,
    },
  });
}
