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
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Appointment } from '../../types/appointment';
import { AppStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../theme/ThemeContext';
import { confirmAction } from '../../utils/confirmAction';
import { formatAppointmentDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/getErrorMessage';

type Props = NativeStackScreenProps<AppStackParamList, 'AppointmentDetail'>;

function DetailRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string | null | undefined;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value?.trim() || '—'}</Text>
    </View>
  );
}

export function AppointmentDetailScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
      setError(getErrorMessage(loadError, 'No se pudo cargar la cita'));
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
      navigation.navigate('AppointmentList');
    } catch (deleteError) {
      opacity.value = withTiming(1, { duration: 200 });
      setError(getErrorMessage(deleteError, 'No se pudo eliminar la cita'));
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
        title: 'Eliminar cita',
        message:
          '¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        cancelLabel: 'Cancelar',
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={animatedStyle}>
        <View style={styles.header}>
          <Text style={styles.title}>{appointment.title}</Text>
          <StatusBadge status={appointment.status} />
        </View>

        <Text style={styles.date}>
          {formatAppointmentDate(appointment.appointmentDate)}
        </Text>

        <View style={styles.divider} />

        <DetailRow
          label="Cliente"
          value={appointment.clientName}
          styles={styles}
        />
        <DetailRow
          label="Teléfono"
          value={appointment.clientPhone}
          styles={styles}
        />
        <DetailRow
          label="Descripción"
          value={appointment.description}
          styles={styles}
        />
      </Animated.View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}

      <View style={styles.actions}>
        <AppButton
          label="Editar"
          variant="secondary"
          onPress={() =>
            navigation.navigate('AppointmentForm', { appointmentId })
          }
          disabled={isDeleting}
        />
        <AppButton
          label="Eliminar"
          variant="ghost"
          onPress={confirmDelete}
          loading={isDeleting}
        />
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
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
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 8,
    },
    title: {
      flex: 1,
      fontSize: 26,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.4,
      lineHeight: 32,
    },
    date: {
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: 24,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 8,
    },
    row: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      gap: 4,
    },
    rowLabel: {
      fontSize: 13,
      color: colors.textSoft,
    },
    rowValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    actions: {
      marginTop: 32,
      gap: 8,
    },
    inlineError: {
      color: colors.danger,
      fontSize: 14,
      marginTop: 16,
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
