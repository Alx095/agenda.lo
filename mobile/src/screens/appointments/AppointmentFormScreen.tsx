import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenPlaceholder } from '../../components/ScreenPlaceholder';
import { AppStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<AppStackParamList, 'AppointmentForm'>;

export function AppointmentFormScreen({}: Props) {
  return (
    <ScreenPlaceholder
      title="Appointment Form"
      subtitle="Formulario para crear o editar una cita."
    />
  );
}
