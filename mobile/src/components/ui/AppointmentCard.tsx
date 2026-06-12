import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Appointment } from '../../types/appointment';
import { useTheme } from '../../theme/ThemeContext';
import { formatAppointmentTime } from '../../utils/formatDate';
import { ClientAvatar } from './ClientAvatar';
import { StatusBadge } from './StatusBadge';

type Props = {
  appointment: Appointment;
  onPress: () => void;
  variant?: 'default' | 'timeline';
};

export function AppointmentCard({
  appointment,
  onPress,
  variant = 'default',
}: Props) {
  const { colors, statusTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const statusAccent = statusTheme[appointment.status].accent;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        variant === 'timeline' && styles.timelineCard,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.statusBar, { backgroundColor: statusAccent }]} />

      <ClientAvatar name={appointment.clientName} size={44} />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.clientName} numberOfLines={1}>
            {appointment.clientName}
          </Text>
          <Text style={styles.time}>
            {formatAppointmentTime(appointment.appointmentDate)}
          </Text>
        </View>
        <Text style={styles.service} numberOfLines={1}>
          {appointment.title}
        </Text>
        <StatusBadge status={appointment.status} compact />
      </View>
    </Pressable>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingRight: 14,
      paddingLeft: 0,
      overflow: 'hidden',
    },
    timelineCard: {
      marginLeft: 0,
    },
    pressed: {
      backgroundColor: colors.borderLight,
    },
    statusBar: {
      width: 4,
      alignSelf: 'stretch',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    body: {
      flex: 1,
      gap: 4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    clientName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    time: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
      fontVariant: ['tabular-nums'],
    },
    service: {
      fontSize: 14,
      color: colors.textMuted,
    },
  });
}
