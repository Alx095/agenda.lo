import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAppointments } from '../../api/appointments';
import { useBusiness } from '../../business/BusinessContext';
import { AnimatedListItem } from '../../components/ui/AnimatedListItem';
import { AppointmentCard } from '../../components/ui/AppointmentCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { FabButton } from '../../components/ui/FabButton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Appointment } from '../../types/appointment';
import { AppStackParamList, MainTabParamList } from '../../types/navigation.types';
import { useTheme } from '../../theme/ThemeContext';
import {
  AppointmentDaySection,
  groupAppointmentsByDay,
} from '../../utils/groupAppointments';
import { getErrorMessage } from '../../utils/getErrorMessage';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Calendar'>,
  NativeStackScreenProps<AppStackParamList>
>;

export function AppointmentListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(colors, insets.top),
    [colors, insets.top],
  );
  const { selectedBusiness, selectedBusinessId, isLoading: isBusinessLoading } =
    useBusiness();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sections = useMemo(
    () => groupAppointmentsByDay(appointments),
    [appointments],
  );

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
        getErrorMessage(loadError, 'No se pudieron cargar las reservas'),
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

  const renderSectionHeader = useCallback(
    ({ section }: { section: AppointmentDaySection }) => (
      <SectionHeader title={section.title} count={section.data.length} />
    ),
    [],
  );

  if ((isLoading || isBusinessLoading) && appointments.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={colors.text} />
        <Text style={styles.loadingText}>Cargando agenda…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        {selectedBusiness ? (
          <Text style={styles.businessName}>{selectedBusiness.name}</Text>
        ) : null}
        <Text style={styles.subtitle}>
          {appointments.length}{' '}
          {appointments.length === 1 ? 'reserva' : 'reservas'} en total
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={
          appointments.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadAppointments(true)}
            tintColor={colors.textMuted}
          />
        }
        ListEmptyComponent={
          !error ? (
            <EmptyState
              title="Sin reservas"
              subtitle="Cuando agendes una, aparecerá aquí agrupada por día."
              actionLabel="Nueva reserva"
              onAction={() => navigation.navigate('AppointmentForm')}
            />
          ) : null
        }
      />

      {selectedBusinessId ? (
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
      paddingTop: topInset + 12,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.bgCard,
      gap: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
    },
    businessName: {
      fontSize: 14,
      color: colors.textMuted,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSoft,
      marginTop: 2,
    },
    errorBox: {
      marginHorizontal: 20,
      marginTop: 12,
      paddingLeft: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.danger,
    },
    errorText: {
      color: colors.danger,
      fontSize: 14,
    },
    list: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    separator: {
      height: 8,
    },
    emptyList: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
  });
}
