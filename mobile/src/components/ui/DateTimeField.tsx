import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { formatAppointmentDate } from '../../utils/formatDate';

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  error?: string | null;
};

export function DateTimeField({
  label,
  value,
  onChange,
  minimumDate,
  error,
}: Props) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showPicker, setShowPicker] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(value ?? new Date());

  const displayValue = value
    ? formatAppointmentDate(value.toISOString())
    : 'Seleccionar fecha y hora';

  const openPicker = () => {
    setDraftDate(value ?? new Date());
    setShowPicker(true);
  };

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selected) {
        onChange(selected);
      }
      return;
    }

    if (selected) {
      setDraftDate(selected);
    }
  };

  const confirmIos = () => {
    onChange(draftDate);
    setShowPicker(false);
  };

  if (Platform.OS === 'web') {
    const webValue = value
      ? toLocalInputValue(value)
      : '';

    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <input
          type="datetime-local"
          value={webValue}
          min={minimumDate ? toLocalInputValue(minimumDate) : undefined}
          onChange={(event) => {
            const next = new Date((event.target as HTMLInputElement).value);
            if (!Number.isNaN(next.getTime())) {
              onChange(next);
            }
          }}
          style={{
            width: '100%',
            backgroundColor: colors.bgCard,
            border: `1.5px solid ${error ? colors.danger : colors.border}`,
            borderRadius: 14,
            padding: '14px 16px',
            fontSize: 16,
            color: colors.text,
            boxSizing: 'border-box',
          }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.field, error ? styles.fieldError : null]}
        onPress={openPicker}
      >
        <Text style={[styles.fieldText, !value && styles.placeholder]}>
          {displayValue}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalAction}>Cancelar</Text>
                </Pressable>
                <Text style={styles.modalTitle}>Fecha y hora</Text>
                <Pressable onPress={confirmIos}>
                  <Text style={[styles.modalAction, styles.modalConfirm]}>
                    Listo
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draftDate}
                mode="datetime"
                display="spinner"
                minimumDate={minimumDate}
                onChange={handleChange}
                themeVariant={isDark ? 'dark' : 'light'}
              />
            </View>
          </View>
        </Modal>
      ) : null}

      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode="datetime"
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    wrapper: {
      gap: 6,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    field: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    fieldError: {
      borderColor: colors.danger,
    },
    fieldText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    placeholder: {
      color: colors.inputPlaceholder,
    },
    error: {
      fontSize: 12,
      color: colors.danger,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalSheet: {
      backgroundColor: colors.bgCard,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 24,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    modalAction: {
      fontSize: 16,
      color: colors.textMuted,
      fontWeight: '600',
    },
    modalConfirm: {
      color: colors.primary,
      fontWeight: '800',
    },
  });
}
