import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { ScreenPlaceholder } from '../../components/ScreenPlaceholder';
import { AppStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<AppStackParamList, 'AppointmentDetail'>;

export function AppointmentDetailScreen({ route }: Props) {
  return (
    <ScreenPlaceholder
      title="Appointment Detail"
      subtitle="Detalle de una cita específica."
    >
      <Text>ID: {route.params.appointmentId}</Text>
    </ScreenPlaceholder>
  );
}
