import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getAppointments } from '../../api/appointments';
import { useAuth } from '../../auth/AuthContext';
import { useBusiness } from '../../business/BusinessContext';
import { AppButton } from '../../components/ui/AppButton';
import { AppScreen } from '../../components/ui/AppScreen';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Appointment } from '../../types/appointment';
import { AppStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../theme/ThemeContext';
import {
  formatAppointmentDate,
  formatAppointmentTime,
} from '../../utils/formatDate';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, logout, isSubmitting } = useAuth();
  const {
    selectedBusiness,
    businesses,
    selectedBusinessId,
    isLoading: isBusinessLoading,
    error: businessError,
    selectBusiness,
    refreshBusinesses,
  } = useBusiness();

  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const canManage = Boolean(selectedBusiness?.id);
  const firstName = (user?.name ?? 'Usuario').split(' ')[0];

  const loadOverview = useCallback(async () => {
    if (!selectedBusinessId) {
      setNextAppointment(null);
      setTodayCount(0);
      return;
    }

    setIsStatsLoading(true);

    try {
      const response = await getAppointments({
        businessId: selectedBusinessId,
        sort: 'asc',
        limit: 100,
      });

      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const today = response.data.filter((item) => {
        const d = new Date(item.appointmentDate);
        return d >= startOfDay && d <= endOfDay;
      });

      const upcoming = response.data.filter(
        (item) => new Date(item.appointmentDate).getTime() >= now.getTime(),
      );

      setTodayCount(today.length);
      setNextAppointment(upcoming[0] ?? null);
    } catch {
      setNextAppointment(null);
      setTodayCount(0);
    } finally {
      setIsStatsLoading(false);
    }
  }, [selectedBusinessId]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  return (
    <AppScreen scroll contentStyle={styles.content}>
      <View style={styles.top}>
        <Text style={styles.wordmark}>Agenda.lo</Text>
        <Text style={styles.greeting}>Buenos días, {firstName}</Text>
        {selectedBusiness ? (
          <Text style={styles.business}>{selectedBusiness.name}</Text>
        ) : null}
      </View>

      {isBusinessLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.text} size="small" />
          <Text style={styles.muted}>Cargando…</Text>
        </View>
      ) : null}

      {businessError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{businessError}</Text>
          <Pressable onPress={() => void refreshBusinesses()}>
            <Text style={styles.errorLink}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      {businesses.length > 1 ? (
        <View style={styles.businessPicker}>
          {businesses.map((business) => {
            const active = business.id === selectedBusiness?.id;
            return (
              <Pressable
                key={business.id}
                style={[styles.businessOption, active && styles.businessOptionActive]}
                onPress={() => selectBusiness(business.id)}
              >
                <Text
                  style={[
                    styles.businessOptionText,
                    active && styles.businessOptionTextActive,
                  ]}
                >
                  {business.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Hoy</Text>
        <Text style={styles.sectionValue}>
          {isStatsLoading ? '…' : `${todayCount} ${todayCount === 1 ? 'cita' : 'citas'}`}
        </Text>
      </View>

      {nextAppointment ? (
        <Pressable
          style={styles.nextBlock}
          onPress={() =>
            navigation.navigate('AppointmentDetail', {
              appointmentId: nextAppointment.id,
            })
          }
        >
          <View style={styles.nextHeader}>
            <Text style={styles.nextLabel}>Próxima cita</Text>
            <StatusBadge status={nextAppointment.status} compact />
          </View>
          <Text style={styles.nextTitle}>{nextAppointment.title}</Text>
          <Text style={styles.nextMeta}>
            {formatAppointmentTime(nextAppointment.appointmentDate)}
            {' · '}
            {nextAppointment.clientName}
          </Text>
          <Text style={styles.nextFullDate}>
            {formatAppointmentDate(nextAppointment.appointmentDate)}
          </Text>
        </Pressable>
      ) : !isStatsLoading && canManage ? (
        <Text style={styles.muted}>No tienes citas próximas.</Text>
      ) : null}

      <View style={styles.actions}>
        <AppButton
          label="Ver agenda"
          onPress={() => navigation.navigate('AppointmentList')}
          disabled={!canManage}
        />
        <AppButton
          label="Nueva cita"
          variant="secondary"
          onPress={() => navigation.navigate('AppointmentForm')}
          disabled={!canManage}
        />
      </View>

      <ThemeToggle />

      <Pressable
        style={styles.logout}
        onPress={() => void logout()}
        disabled={isSubmitting}
      >
        <Text style={styles.logoutText}>
          {isSubmitting ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </Text>
      </Pressable>
    </AppScreen>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    content: {
      paddingTop: 8,
      paddingBottom: 40,
    },
    top: {
      marginBottom: 28,
      gap: 4,
    },
    wordmark: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 12,
    },
    greeting: {
      fontSize: 28,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.5,
    },
    business: {
      fontSize: 15,
      color: colors.textMuted,
      marginTop: 4,
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },
    muted: {
      fontSize: 15,
      color: colors.textMuted,
      lineHeight: 22,
    },
    errorBox: {
      borderLeftWidth: 3,
      borderLeftColor: colors.danger,
      paddingLeft: 12,
      marginBottom: 20,
      gap: 6,
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
    },
    errorLink: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    businessPicker: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 24,
    },
    businessOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    businessOptionActive: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    businessOptionText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textMuted,
    },
    businessOptionTextActive: {
      color: colors.textInverse,
    },
    section: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 15,
      color: colors.textMuted,
    },
    sectionValue: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    nextBlock: {
      marginBottom: 28,
      gap: 6,
    },
    nextHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    nextLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSoft,
    },
    nextTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.2,
    },
    nextMeta: {
      fontSize: 15,
      color: colors.textMuted,
    },
    nextFullDate: {
      fontSize: 14,
      color: colors.textSoft,
    },
    actions: {
      gap: 10,
      marginBottom: 24,
    },
    logout: {
      alignSelf: 'center',
      paddingVertical: 12,
    },
    logoutText: {
      fontSize: 14,
      color: colors.textSoft,
    },
  });
