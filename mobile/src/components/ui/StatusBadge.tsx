import { StyleSheet, Text, View } from 'react-native';
import { AppointmentStatus } from '../../types/appointment';
import { useTheme } from '../../theme/ThemeContext';

type Props = {
  status: AppointmentStatus;
  compact?: boolean;
};

export function StatusBadge({ status, compact = false }: Props) {
  const { statusTheme } = useTheme();
  const theme = statusTheme[status];

  return (
    <View style={[styles.badge, compact && styles.compact]}>
      <View style={[styles.dot, { backgroundColor: theme.accent }]} />
      <Text style={[styles.text, { color: theme.text }]}>{theme.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compact: {
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
});
