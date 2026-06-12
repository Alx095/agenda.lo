import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAppointments } from '../../api/appointments';
import { useBusiness } from '../../business/BusinessContext';
import { AppointmentCard } from '../../components/ui/AppointmentCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { FabButton } from '../../components/ui/FabButton';
import { Appointment } from '../../types/appointment';
import { AppStackParamList, MainTabParamList } from '../../types/navigation.types';
import { useTheme } from '../../theme/ThemeContext';
import { formatTodayHeader } from '../../utils/formatDate';
import { filterTodayAppointments } from '../../utils/groupAppointments';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Today'>,
  NativeStackScreenProps<AppStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(colors, insets.top),
    [colors, insets.top],
  );
  const {
    selectedBusiness,
    selectedBusinessId,
    isLoading: isBusinessLoading,
    error: businessError,
    refreshBusinesses,
  } = useBusiness();

  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canManage = Boolean(selectedBusinessId);

  const loadToday = useCallback(async (refreshing = false) => {
    if (!selectedBusinessId) {
      setTodayAppointments([]);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await getAppointments({
        businessId: selectedBusinessId,
        sort: 'asc',
        limit: 100,
      });
      setTodayAppointments(filterTodayAppointments(response.data));
    } catch {
      setTodayAppointments([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedBusinessId]);

  useFocusEffect(
    useCallback(() => {
      void loadToday();
    }, [loadToday]),
  );

  const renderTimelineItem = useCallback(
    ({ item, index }: { item: Appointment; index: number }) => {
      const isLast = index === todayAppointments.length - 1;

      return (
        <View style={styles.timelineRow}>
          <View style={styles.timelineRail}>
            <View style={styles.timelineDot} />
            {!isLast ? <View style={styles.timelineLine} /> : null}
          </View>
          <View style={styles.timelineCard}>
            <AppointmentCard
              appointment={item}
              variant="timeline"
              onPress={() =>
                navigation.navigate('AppointmentDetail', {
                  appointmentId: item.id,
                })
              }
            />
          </View>
        </View>
      );
    },
    [navigation, styles, todayAppointments.length],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.dateTitle}>{formatTodayHeader()}</Text>
            {selectedBusiness ? (
              <Text style={styles.businessName}>{selectedBusiness.name}</Text>
            ) : null}
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countValue}>{todayAppointments.length}</Text>
            <Text style={styles.countLabel}>
              {todayAppointments.length === 1 ? 'reserva' : 'reservas'}
            </Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Agenda del día</Text>
      </View>

      {businessError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{businessError}</Text>
          <Pressable onPress={() => void refreshBusinesses()}>
            <Text style={styles.errorLink}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      {(isLoading || isBusinessLoading) && todayAppointments.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.text} />
          <Text style={styles.loadingText}>Cargando agenda…</Text>
        </View>
      ) : (
        <FlatList
          data={todayAppointments}
          keyExtractor={(item) => item.id}
          renderItem={renderTimelineItem}
          contentContainerStyle={
            todayAppointments.length === 0
              ? styles.emptyList
              : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadToday(true)}
              tintColor={colors.textMuted}
            />
          }
          ListEmptyComponent={
            canManage ? (
              <EmptyState
                title="Sin reservas hoy"
                subtitle="Tu calendario está libre. Crea una reserva para empezar el día."
                actionLabel="Nueva reserva"
                onAction={() => navigation.navigate('AppointmentForm')}
              />
            ) : (
              <Text style={styles.muted}>Configura tu negocio para ver la agenda.</Text>
            )
          }
        />
      )}

      {canManage ? (
        <FabButton
          label="Nueva reserva"
          onPress={() => navigation.navigate('AppointmentForm')}
        />
      ) : null}
    </View>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  topInset: number,
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      paddingTop: topInset + 12,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.bgCard,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
    },
    headerText: {
      flex: 1,
      gap: 4,
    },
    dateTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.4,
      textTransform: 'capitalize',
    },
    businessName: {
      fontSize: 14,
      color: colors.textMuted,
    },
    countBadge: {
      alignItems: 'center',
      minWidth: 56,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    countValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    countLabel: {
      fontSize: 11,
      color: colors.textSoft,
    },
    headerSubtitle: {
      marginTop: 10,
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSoft,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 100,
    },
    emptyList: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    muted: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      paddingTop: 40,
    },
    timelineRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    timelineRail: {
      width: 24,
      alignItems: 'center',
      paddingTop: 18,
    },
    timelineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: colors.border,
      marginTop: 4,
    },
    timelineCard: {
      flex: 1,
      paddingBottom: 12,
    },
  });
}
