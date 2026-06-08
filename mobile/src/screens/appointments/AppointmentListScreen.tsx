import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text } from 'react-native';
import { ScreenPlaceholder } from '../../components/ScreenPlaceholder';
import { AppStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<AppStackParamList, 'AppointmentList'>;

export function AppointmentListScreen({ navigation }: Props) {
  return (
    <ScreenPlaceholder
      title="Appointment List"
      subtitle="Listado de citas del usuario."
    >
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('AppointmentForm')}
      >
        <Text style={styles.buttonText}>Nueva cita</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondaryButton]}
        onPress={() =>
          navigation.navigate('AppointmentDetail', {
            appointmentId: 'placeholder-id',
          })
        }
      >
        <Text style={styles.buttonText}>Ver detalle (placeholder)</Text>
      </Pressable>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#0F172A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
