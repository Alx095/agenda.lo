import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';

type Props = {
  visible: boolean;
  message: string;
  onHide?: () => void;
  durationMs?: number;
};

export function SuccessToast({
  visible,
  message,
  onHide,
  durationMs = 1200,
}: Props) {
  const { colors } = useTheme();

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(() => {
      onHide?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [visible, durationMs, onHide]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(180)}
      style={[
        styles.container,
        {
          backgroundColor: colors.text,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.message, { color: colors.textInverse }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    zIndex: 100,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
