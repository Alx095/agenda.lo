import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppointmentDetailScreen } from '../screens/appointments/AppointmentDetailScreen';
import { AppointmentFormScreen } from '../screens/appointments/AppointmentFormScreen';
import { AppointmentListScreen } from '../screens/appointments/AppointmentListScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AppStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Stack.Screen
        name="AppointmentList"
        component={AppointmentListScreen}
        options={{ title: 'Mis citas' }}
      />
      <Stack.Screen
        name="AppointmentForm"
        component={AppointmentFormScreen}
        options={{ title: 'Nueva cita' }}
      />
      <Stack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ title: 'Detalle de cita' }}
      />
    </Stack.Navigator>
  );
}
