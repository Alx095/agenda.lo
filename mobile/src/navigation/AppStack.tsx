import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppointmentDetailScreen } from '../screens/appointments/AppointmentDetailScreen';
import { AppointmentFormScreen } from '../screens/appointments/AppointmentFormScreen';
import { AppointmentListScreen } from '../screens/appointments/AppointmentListScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { useTheme } from '../theme/ThemeContext';
import { AppStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  const { navigationTheme, colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...navigationTheme,
        headerStyle: {
          ...navigationTheme.headerStyle,
        },
        headerTitleStyle: {
          ...navigationTheme.headerTitleStyle,
          fontSize: 16,
        },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Stack.Screen
        name="AppointmentList"
        component={AppointmentListScreen}
        options={{ title: 'Agenda' }}
      />
      <Stack.Screen
        name="AppointmentForm"
        component={AppointmentFormScreen}
        options={{ title: 'Cita' }}
      />
      <Stack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ title: 'Detalle' }}
      />
    </Stack.Navigator>
  );
}
