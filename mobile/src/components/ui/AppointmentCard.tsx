import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Appointment } from '../../types/appointment';
import { useTheme } from '../../theme/ThemeContext';
import {
  formatAppointmentDay,
  formatAppointmentTime,
} from '../../utils/formatDate';
import { StatusBadge } from './StatusBadge';

type Props = {
  appointment: Appointment;
  onPress: () => void;
};

export function AppointmentCard({ appointment, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.timeCol}>
        <Text style={styles.time}>{formatAppointmentTime(appointment.appointmentDate)}</Text>
        <Text style={styles.day}>{formatAppointmentDay(appointment.appointmentDate)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {appointment.title}
        </Text>
        <Text style={styles.client} numberOfLines={1}>
          {appointment.clientName}
        </Text>
        <StatusBadge status={appointment.status} compact />
      </View>
    </Pressable>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: colors.bgCard,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    pressed: {
      backgroundColor: colors.borderLight,
    },
    timeCol: {
      width: 72,
      paddingVertical: 14,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
    },
    time: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    day: {
      fontSize: 11,
      color: colors.textSoft,
      marginTop: 2,
      textAlign: 'center',
    },
    divider: {
      width: 1,
      backgroundColor: colors.border,
    },
    body: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 14,
      gap: 4,
      justifyContent: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    client: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 2,
    },
  });
}
