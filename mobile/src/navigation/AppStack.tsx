import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppointmentDetailScreen } from '../screens/appointments/AppointmentDetailScreen';
import { AppointmentFormScreen } from '../screens/appointments/AppointmentFormScreen';
import { useTheme } from '../theme/ThemeContext';
import { AppStackParamList } from '../types/navigation.types';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  const { navigationTheme, colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...navigationTheme,
        headerTitleStyle: {
          ...navigationTheme.headerTitleStyle,
          fontSize: 16,
        },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppointmentForm"
        component={AppointmentFormScreen}
        options={{ title: 'Reserva' }}
      />
      <Stack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ title: 'Detalle de reserva' }}
      />
    </Stack.Navigator>
  );
}
