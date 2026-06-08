import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getAppointments } from '../../api/appointments';
import { useBusiness } from '../../business/BusinessContext';
import { AnimatedListItem } from '../../components/ui/AnimatedListItem';
import { AppointmentCard } from '../../components/ui/AppointmentCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Appointment } from '../../types/appointment';
import { AppStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../theme/ThemeContext';
import { getErrorMessage } from '../../utils/getErrorMessage';

type Props = NativeStackScreenProps<AppStackParamList, 'AppointmentList'>;

export function AppointmentListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { selectedBusiness, selectedBusinessId, isLoading: isBusinessLoading } =
    useBusiness();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async (refreshing = false) => {
    if (!selectedBusinessId) {
      setAppointments([]);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = await getAppointments({
        businessId: selectedBusinessId,
        sort: 'asc',
      });
      setAppointments(response.data);
    } catch (loadError) {
      setError(
        getErrorMessage(loadError, 'No se pudieron cargar las citas'),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedBusinessId]);

  useFocusEffect(
    useCallback(() => {
      void loadAppointments();
    }, [loadAppointments]),
  );

  const handleRefresh = useCallback(() => {
    void loadAppointments(true);
  }, [loadAppointments]);

  const renderItem = useCallback(
    ({ item, index }: { item: Appointment; index: number }) => (
      <AnimatedListItem index={index}>
        <AppointmentCard
          appointment={item}
          onPress={() =>
            navigation.navigate('AppointmentDetail', {
              appointmentId: item.id,
            })
          }
        />
      </AnimatedListItem>
    ),
    [navigation],
  );

  if ((isLoading || isBusinessLoading) && appointments.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={colors.text} />
        <Text style={styles.loadingText}>Cargando…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          {selectedBusiness ? (
            <Text style={styles.businessName}>{selectedBusiness.name}</Text>
          ) : null}
          <Text style={styles.count}>
            {appointments.length}{' '}
            {appointments.length === 1 ? 'cita' : 'citas'}
          </Text>
        </View>
        {selectedBusinessId ? (
          <Pressable onPress={() => navigation.navigate('AppointmentForm')}>
            <Text style={styles.addLink}>Nueva cita</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => void loadAppointments()}>
            <Text style={styles.errorLink}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={
          appointments.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textMuted}
          />
        }
        ListEmptyComponent={
          !error ? (
            <EmptyState
              title="Sin citas"
              subtitle="Cuando agendes una, aparecerá aquí en orden cronológico."
              actionLabel="Agendar cita"
              onAction={() => navigation.navigate('AppointmentForm')}
            />
          ) : null
        }
      />
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
      gap: 12,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    businessName: {
      fontSize: 13,
      color: colors.textSoft,
      marginBottom: 2,
    },
    count: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.3,
    },
    addLink: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    errorBox: {
      marginHorizontal: 20,
      marginTop: 12,
      paddingLeft: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.danger,
      gap: 6,
    },
    errorText: {
      color: colors.danger,
      fontSize: 14,
    },
    errorLink: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    list: {
      padding: 20,
      paddingBottom: 32,
    },
    separator: {
      height: 10,
    },
    emptyList: {
      flexGrow: 1,
      paddingHorizontal: 20,
    },
  });
}
