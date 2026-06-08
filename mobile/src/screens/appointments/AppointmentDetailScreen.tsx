import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  deleteAppointment,
  getAppointmentById,
} from '../../api/appointments';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { AppStackParamList } from '../../types/navigation.types';
import { formatAppointmentDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/getErrorMessage';

type Props = NativeStackScreenProps<AppStackParamList, 'AppointmentDetail'>;

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: '#F59E0B',
  CONFIRMED: '#2563EB',
  CANCELLED: '#DC2626',
  COMPLETED: '#16A34A',
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value?.trim() || '—'}</Text>
    </View>
  );
}

export function AppointmentDetailScreen({ navigation, route }: Props) {
  const { appointmentId } = route.params;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      void loadAppointment();
    }, [loadAppointment]),
  );

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteAppointment(appointmentId);
      navigation.navigate('AppointmentList');
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'No se pudo eliminar la cita'));
    } finally {
      setIsDeleting(false);
    }
  }, [appointmentId, navigation]);

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar cita',
      '¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void handleDelete(),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando cita...</Text>
      </View>
    );
  }

  if (error && !appointment) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => void loadAppointment()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (!appointment) {
    return null;
  }

  const isBusy = isDeleting;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{appointment.title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[appointment.status] },
          ]}
        >
          <Text style={styles.statusText}>
            {STATUS_LABELS[appointment.status]}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <DetailRow label="Descripción" value={appointment.description} />
        <DetailRow label="Cliente" value={appointment.clientName} />
        <DetailRow label="Teléfono" value={appointment.clientPhone} />
        <DetailRow
          label="Fecha"
          value={formatAppointmentDate(appointment.appointmentDate)}
        />
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}

      <Pressable
        style={[styles.button, isBusy && styles.buttonDisabled]}
        onPress={() =>
          navigation.navigate('AppointmentForm', { appointmentId })
        }
        disabled={isBusy}
      >
        <Text style={styles.buttonText}>Editar</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.deleteButton, isBusy && styles.buttonDisabled]}
        onPress={confirmDelete}
        disabled={isBusy}
      >
        {isDeleting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Eliminar</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 15,
  },
  header: {
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 16,
    marginBottom: 24,
  },
  row: {
    gap: 4,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  rowValue: {
    fontSize: 16,
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  inlineError: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
