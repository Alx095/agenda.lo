import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

function FormSection({
  title,
  children,
  styles,
}: {
  title: string;
  children: ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function AppointmentFormScreen({ navigation, route }: Props) {
  const { colors, statusTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(colors, insets.bottom),
    [colors, insets.bottom],
  );
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
      title: isEditMode ? 'Editar reserva' : 'Nueva reserva',
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
      setError(getErrorMessage(loadError, 'No se pudo cargar la reserva'));
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
    if (!form.clientName.trim()) {
      return 'El nombre del cliente es obligatorio';
    }

    if (!form.title.trim()) {
      return 'El servicio es obligatorio';
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
      setError('No hay un negocio seleccionado.');
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
          navigation.navigate('MainTabs', { screen: 'Calendar' });
        }, 900);
      }
    } catch (submitError) {
      setError(
        getErrorMessage(
          submitError,
          isEditMode
            ? 'No se pudo actualizar la reserva'
            : 'No se pudo crear la reserva',
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
          {isEditMode ? 'Cargando reserva…' : 'Preparando…'}
        </Text>
      </View>
    );
  }

  if (!isEditMode && !selectedBusinessId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          No se pudo cargar tu negocio. Revisa la pestaña Cuenta.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <SuccessToast
        visible={showSuccess}
        message="Reserva creada"
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

        <FormSection title="Cliente" styles={styles}>
          <AppInput
            label="Nombre"
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
        </FormSection>

        <FormSection title="Servicio" styles={styles}>
          <AppInput
            label="Nombre del servicio"
            placeholder="Corte, manicura, consulta…"
            value={form.title}
            onChangeText={(value) => updateField('title', value)}
          />
          <AppInput
            label="Notas internas"
            placeholder="Preferencias, alergias, detalles…"
            value={form.description}
            onChangeText={(value) => updateField('description', value)}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
        </FormSection>

        <FormSection title="Fecha y hora" styles={styles}>
          <DateTimeField
            label="Cuándo"
            value={form.appointmentDate}
            onChange={(date) => updateField('appointmentDate', date)}
            minimumDate={isEditMode ? undefined : new Date()}
          />
        </FormSection>

        <FormSection title="Estado" styles={styles}>
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
        </FormSection>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label={isEditMode ? 'Guardar cambios' : 'Confirmar reserva'}
          onPress={() => void handleSubmit()}
          loading={isSubmitting}
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
      gap: 20,
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
    },
    section: {
      gap: 10,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSoft,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    sectionBody: {
      gap: 14,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      minHeight: 96,
      textAlignVertical: 'top',
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
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Math.max(bottomInset, 16),
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.bgCard,
    },
  });
}
