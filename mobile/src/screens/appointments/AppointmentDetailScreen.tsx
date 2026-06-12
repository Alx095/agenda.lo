import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  deleteAppointment,
  getAppointmentById,
} from '../../api/appointments';
import { AppButton } from '../../components/ui/AppButton';
import { ClientAvatar } from '../../components/ui/ClientAvatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Appointment } from '../../types/appointment';
import { AppStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../theme/ThemeContext';
import { confirmAction } from '../../utils/confirmAction';
import {
  formatAppointmentDate,
  formatAppointmentTime,
} from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/getErrorMessage';

type Props = NativeStackScreenProps<AppStackParamList, 'AppointmentDetail'>;

function InfoBlock({
  label,
  value,
  styles,
}: {
  label: string;
  value: string | null | undefined;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value?.trim() || '—'}</Text>
    </View>
  );
}

export function AppointmentDetailScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(colors, insets.bottom),
    [colors, insets.bottom],
  );
  const { appointmentId } = route.params;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const loadAppointment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAppointmentById(appointmentId);
      setAppointment(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'No se pudo cargar la reserva'));
      setAppointment(null);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useFocusEffect(
    useCallback(() => {
      opacity.value = 1;
      void loadAppointment();
    }, [loadAppointment, opacity]),
  );

  const performDelete = useCallback(async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteAppointment(appointmentId);
      navigation.goBack();
    } catch (deleteError) {
      opacity.value = withTiming(1, { duration: 200 });
      setError(getErrorMessage(deleteError, 'No se pudo eliminar la reserva'));
    } finally {
      setIsDeleting(false);
    }
  }, [appointmentId, navigation, opacity]);

  const animateAndDelete = useCallback(() => {
    opacity.value = withTiming(0, { duration: 260 }, (finished) => {
      if (finished) {
        runOnJS(performDelete)();
      }
    });
  }, [opacity, performDelete]);

  const confirmDelete = () => {
    void (async () => {
      const confirmed = await confirmAction({
        title: 'Cancelar reserva',
        message:
          '¿Eliminar esta reserva? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        cancelLabel: 'Volver',
      });

      if (confirmed) {
        animateAndDelete();
      }
    })();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={colors.text} />
        <Text style={styles.loadingText}>Cargando…</Text>
      </View>
    );
  }

  if (error && !appointment) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => void loadAppointment()}>
          <Text style={styles.errorLink}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Animated.View style={animatedStyle}>
          <View style={styles.clientHero}>
            <ClientAvatar name={appointment.clientName} size={64} />
            <Text style={styles.clientName}>{appointment.clientName}</Text>
            <StatusBadge status={appointment.status} />
          </View>

          <View style={styles.scheduleCard}>
            <Text style={styles.serviceTitle}>{appointment.title}</Text>
            <Text style={styles.scheduleTime}>
              {formatAppointmentTime(appointment.appointmentDate)}
            </Text>
            <Text style={styles.scheduleDate}>
              {formatAppointmentDate(appointment.appointmentDate)}
            </Text>
          </View>

          <View style={styles.detailsCard}>
            <InfoBlock
              label="Teléfono"
              value={appointment.clientPhone}
              styles={styles}
            />
            <View style={styles.divider} />
            <InfoBlock
              label="Notas"
              value={appointment.description}
              styles={styles}
            />
          </View>
        </Animated.View>

        {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label="Editar reserva"
          onPress={() =>
            navigation.navigate('AppointmentForm', { appointmentId })
          }
          disabled={isDeleting}
        />
        <AppButton
          label="Eliminar reserva"
          variant="ghost"
          onPress={confirmDelete}
          loading={isDeleting}
        />
      </View>
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  bottomInset: number,
) {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    container: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 24,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
      padding: 24,
      gap: 12,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    clientHero: {
      alignItems: 'center',
      gap: 10,
      marginBottom: 24,
      paddingVertical: 8,
    },
    clientName: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
    },
    scheduleCard: {
      backgroundColor: colors.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      marginBottom: 16,
      gap: 4,
    },
    serviceTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    scheduleTime: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      fontVariant: ['tabular-nums'],
      letterSpacing: -0.5,
    },
    scheduleDate: {
      fontSize: 15,
      color: colors.textMuted,
    },
    detailsCard: {
      backgroundColor: colors.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 18,
    },
    infoBlock: {
      paddingVertical: 16,
      gap: 4,
    },
    infoLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSoft,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    infoValue: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderLight,
    },
    inlineError: {
      color: colors.danger,
      fontSize: 14,
      marginTop: 16,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Math.max(bottomInset, 16),
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.bgCard,
    },
    errorText: {
      color: colors.danger,
      fontSize: 15,
      textAlign: 'center',
    },
    errorLink: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textDecorationLine: 'underline',
    },
  });
}
