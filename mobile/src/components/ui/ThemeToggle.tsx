import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ThemeMode } from '../../theme/types';

const MODE_LABELS: Record<ThemeMode, string> = {
  light: 'Claro',
  dark: 'Oscuro',
  system: 'Automático',
};

export function ThemeToggle() {
  const { mode, setMode, colors, isDark } = useTheme();

  const cycleMode = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const index = order.indexOf(mode);
    setMode(order[(index + 1) % order.length] ?? 'system');
  };

  return (
    <Pressable
      style={[styles.row, { borderColor: colors.border }]}
      onPress={cycleMode}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>Tema</Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {MODE_LABELS[mode]}
        {mode === 'system' ? (isDark ? ' · oscuro' : ' · claro') : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
  },
});
