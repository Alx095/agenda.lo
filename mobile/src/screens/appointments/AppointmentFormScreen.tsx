import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createAppointment,
  getAppointmentById,
  updateAppointment,
} from '../../api/appointments';
import { AppointmentStatus } from '../../types/appointment';
import { AppStackParamList } from '../../types/navigation.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

type Props = NativeStackScreenProps<AppStackParamList, 'AppointmentForm'>;

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'COMPLETED', label: 'Completada' },
];

type FormState = {
  title: string;
  description: string;
  clientName: string;
  clientPhone: string;
  appointmentDate: string;
  status: AppointmentStatus;
};

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  clientName: '',
  clientPhone: '',
  appointmentDate: '',
  status: 'PENDING',
};

function isValidIsoDate(value: string): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function AppointmentFormScreen({ navigation, route }: Props) {
  const appointmentId = route.params?.appointmentId;
  const isEditMode = Boolean(appointmentId);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Editar cita' : 'Nueva cita',
    });
  }, [navigation, isEditMode]);

  const loadAppointment = useCallback(async () => {
    if (!appointmentId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const appointment = await getAppointmentById(appointmentId);
      setForm({
        title: appointment.title,
        description: appointment.description ?? '',
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone ?? '',
        appointmentDate: appointment.appointmentDate,
        status: appointment.status,
      });
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'No se pudo cargar la cita'));
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (isEditMode) {
      void loadAppointment();
    }
  }, [isEditMode, loadAppointment]);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!form.title.trim()) {
      return 'El título es obligatorio';
    }

    if (!form.clientName.trim()) {
      return 'El nombre del cliente es obligatorio';
    }

    if (!form.appointmentDate.trim()) {
      return 'La fecha es obligatoria';
    }

    if (!isValidIsoDate(form.appointmentDate.trim())) {
      return 'La fecha debe ser un texto ISO válido (ej. 2026-06-10T10:00:00.000Z)';
    }

    if (!form.status) {
      return 'El estado es obligatorio';
    }

    return null;
  };

  const handleSubmit = async () => {
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.trim() || undefined,
      appointmentDate: form.appointmentDate.trim(),
      status: form.status,
    };

    try {
      if (isEditMode && appointmentId) {
        await updateAppointment(appointmentId, payload);
        navigation.navigate('AppointmentDetail', { appointmentId });
      } else {
        await createAppointment(payload);
        navigation.navigate('AppointmentList');
      }
    } catch (submitError) {
      setError(
        getErrorMessage(
          submitError,
          isEditMode
            ? 'No se pudo actualizar la cita'
            : 'No se pudo crear la cita',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando cita...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Título *</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={(value) => updateField('title', value)}
        placeholder="Consulta general"
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={form.description}
        onChangeText={(value) => updateField('description', value)}
        placeholder="Notas opcionales"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Cliente *</Text>
      <TextInput
        style={styles.input}
        value={form.clientName}
        onChangeText={(value) => updateField('clientName', value)}
        placeholder="Nombre del cliente"
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={form.clientPhone}
        onChangeText={(value) => updateField('clientPhone', value)}
        placeholder="+34 600 000 000"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Fecha (ISO) *</Text>
      <TextInput
        style={styles.input}
        value={form.appointmentDate}
        onChangeText={(value) => updateField('appointmentDate', value)}
        placeholder="2026-06-10T10:00:00.000Z"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.hint}>
        Formato ISO 8601, por ejemplo: 2026-06-10T10:00:00.000Z
      </Text>

      <Text style={styles.label}>Estado *</Text>
      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((option) => {
          const selected = form.status === option.value;

          return (
            <Pressable
              key={option.value}
              style={[styles.statusChip, selected && styles.statusChipSelected]}
              onPress={() => updateField('status', option.value)}
            >
              <Text
                style={[
                  styles.statusChipText,
                  selected && styles.statusChipTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={() => void handleSubmit()}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            {isEditMode ? 'Guardar cambios' : 'Crear cita'}
          </Text>
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
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  statusChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  statusChipTextSelected: {
    color: '#FFFFFF',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
