import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { ScreenPlaceholder } from '../../components/ScreenPlaceholder';
import { AppStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user, logout, isSubmitting } = useAuth();

  return (
    <ScreenPlaceholder
      title={`Hola, ${user?.name ?? 'Usuario'}`}
      subtitle="Pantalla principal de la app autenticada."
    >
      <Text style={styles.email}>{user?.email}</Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('AppointmentList')}
      >
        <Text style={styles.buttonText}>Ver citas</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.logoutButton]}
        onPress={() => void logout()}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        )}
      </Pressable>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  email: {
    color: '#64748B',
    marginBottom: 20,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
