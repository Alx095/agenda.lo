import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { useBusiness } from '../../business/BusinessContext';
import { AppScreen } from '../../components/ui/AppScreen';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { AppStackParamList, MainTabParamList } from '../../types/navigation.types';
import { useTheme } from '../../theme/ThemeContext';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Account'>,
  NativeStackScreenProps<AppStackParamList>
>;

export function AccountScreen(_props: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, logout, isSubmitting } = useAuth();
  const {
    selectedBusiness,
    businesses,
    isLoading: isBusinessLoading,
    error: businessError,
    selectBusiness,
    refreshBusinesses,
  } = useBusiness();

  return (
    <AppScreen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Cuenta</Text>
        <Text style={styles.subtitle}>Ajustes de tu espacio de trabajo</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileInitial}>
          <Text style={styles.profileInitialText}>
            {(user?.name ?? 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name ?? 'Usuario'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Negocio activo</Text>
        {isBusinessLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.text} size="small" />
            <Text style={styles.muted}>Cargando…</Text>
          </View>
        ) : selectedBusiness ? (
          <Text style={styles.businessName}>{selectedBusiness.name}</Text>
        ) : (
          <Text style={styles.muted}>Sin negocio configurado</Text>
        )}

        {businessError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{businessError}</Text>
            <Pressable onPress={() => void refreshBusinesses()}>
              <Text style={styles.errorLink}>Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {businesses.length > 1 ? (
          <View style={styles.businessList}>
            {businesses.map((business) => {
              const active = business.id === selectedBusiness?.id;
              return (
                <Pressable
                  key={business.id}
                  style={[styles.businessRow, active && styles.businessRowActive]}
                  onPress={() => selectBusiness(business.id)}
                >
                  <Text
                    style={[
                      styles.businessRowText,
                      active && styles.businessRowTextActive,
                    ]}
                  >
                    {business.name}
                  </Text>
                  {active ? <Text style={styles.activeMark}>Activo</Text> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preferencias</Text>
        <ThemeToggle />
      </View>

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

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    content: {
      paddingTop: 12,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 24,
      gap: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textMuted,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    profileInitial: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileInitialText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
    },
    profileInfo: {
      flex: 1,
      gap: 2,
    },
    profileName: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    profileEmail: {
      fontSize: 14,
      color: colors.textMuted,
    },
    section: {
      marginBottom: 28,
      gap: 12,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSoft,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    muted: {
      fontSize: 15,
      color: colors.textMuted,
    },
    businessName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    errorBox: {
      borderLeftWidth: 3,
      borderLeftColor: colors.danger,
      paddingLeft: 12,
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
    businessList: {
      gap: 8,
    },
    businessRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgCard,
    },
    businessRowActive: {
      borderColor: colors.text,
    },
    businessRowText: {
      fontSize: 15,
      color: colors.textMuted,
    },
    businessRowTextActive: {
      color: colors.text,
      fontWeight: '600',
    },
    activeMark: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    logout: {
      alignSelf: 'center',
      paddingVertical: 14,
    },
    logoutText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.danger,
    },
  });
}
