import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  createAppointment,
  getAppointmentById,
  updateAppointment,
} from '../../api/appointments';
import { useBusiness } from '../../business/BusinessContext';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { DateTimeField } from '../../components/ui/DateTimeField';
import { SuccessToast } from '../../components/ui/SuccessToast';
import { AppointmentStatus } from '../../types/appointment';
import { AppStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../theme/ThemeContext';
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
  appointmentDate: Date | null;
  status: AppointmentStatus;
};

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  clientName: '',
  clientPhone: '',
  appointmentDate: null,
  status: 'PENDING',
};

export function AppointmentFormScreen({ navigation, route }: Props) {
  const { colors, statusTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const appointmentId = route.params?.appointmentId;
  const isEditMode = Boolean(appointmentId);
  const {
    selectedBusiness,
    selectedBusinessId,
    isLoading: isBusinessLoading,
  } = useBusiness();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
        appointmentDate: new Date(appointment.appointmentDate),
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

    if (!form.appointmentDate) {
      return 'Selecciona una fecha y hora';
    }

    if (Number.isNaN(form.appointmentDate.getTime())) {
      return 'La fecha seleccionada no es válida';
    }

    return null;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!isEditMode && !selectedBusinessId) {
      setError('No hay un negocio seleccionado. Vuelve al inicio e inténtalo de nuevo.');
      return;
    }

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
      appointmentDate: form.appointmentDate!.toISOString(),
      status: form.status,
    };

    try {
      if (isEditMode && appointmentId) {
        await updateAppointment(appointmentId, payload);
        navigation.navigate('AppointmentDetail', { appointmentId });
      } else {
        await createAppointment({
          ...payload,
          businessId: selectedBusinessId!,
        });
        setShowSuccess(true);
        setTimeout(() => {
          navigation.navigate('AppointmentList');
        }, 1200);
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

  if (isLoading || (!isEditMode && isBusinessLoading)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {isEditMode ? 'Cargando cita...' : 'Preparando negocio...'}
        </Text>
      </View>
    );
  }

  if (!isEditMode && !selectedBusinessId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          No se pudo cargar tu negocio. Vuelve al inicio e inténtalo de nuevo.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <SuccessToast
        visible={showSuccess}
        message="Cita guardada"
        onHide={() => setShowSuccess(false)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {!isEditMode && selectedBusiness ? (
          <Text style={styles.businessNote}>{selectedBusiness.name}</Text>
        ) : null}

        <View style={styles.formCard}>
          <AppInput
            label="Título"
            placeholder="Consulta general"
            value={form.title}
            onChangeText={(value) => updateField('title', value)}
          />
          <AppInput
            label="Descripción"
            placeholder="Notas opcionales"
            value={form.description}
            onChangeText={(value) => updateField('description', value)}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
          <AppInput
            label="Cliente"
            placeholder="Nombre del cliente"
            value={form.clientName}
            onChangeText={(value) => updateField('clientName', value)}
          />
          <AppInput
            label="Teléfono"
            placeholder="+34 600 000 000"
            keyboardType="phone-pad"
            value={form.clientPhone}
            onChangeText={(value) => updateField('clientPhone', value)}
          />
          <DateTimeField
            label="Fecha y hora"
            value={form.appointmentDate}
            onChange={(date) => updateField('appointmentDate', date)}
            minimumDate={isEditMode ? undefined : new Date()}
          />

          <View style={styles.statusSection}>
            <Text style={styles.statusLabel}>Estado</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((option) => {
                const selected = form.status === option.value;
                const theme = statusTheme[option.value];

                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.statusChip,
                      selected && {
                        backgroundColor: theme.bg,
                        borderColor: theme.accent,
                      },
                    ]}
                    onPress={() => updateField('status', option.value)}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        selected && { color: theme.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton
          label={isEditMode ? 'Guardar cambios' : 'Crear cita'}
          onPress={() => void handleSubmit()}
          loading={isSubmitting}
        />
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
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
      paddingBottom: 32,
      gap: 14,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
      gap: 12,
      padding: 24,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: 15,
    },
    businessNote: {
      fontSize: 14,
      color: colors.textSoft,
      marginBottom: 4,
    },
    formCard: {
      gap: 16,
    },
    textArea: {
      minHeight: 96,
      textAlignVertical: 'top',
    },
    statusSection: {
      gap: 8,
    },
    statusLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    statusRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    statusChip: {
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bg,
    },
    statusChipText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
    },
    error: {
      color: colors.danger,
      fontSize: 14,
    },
  });
}
