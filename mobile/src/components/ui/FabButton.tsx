import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function FabButton({ label, onPress, disabled = false, style }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(colors, insets.bottom),
    [colors, insets.bottom],
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.plus}>+</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  bottomInset: number,
) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 20,
      bottom: Math.max(bottomInset, 16) + 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderRadius: 999,
      backgroundColor: colors.text,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    pressed: {
      opacity: 0.9,
    },
    disabled: {
      opacity: 0.45,
    },
    plus: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textInverse,
      lineHeight: 22,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textInverse,
    },
  });
}
