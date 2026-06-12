import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AccountScreen } from '../screens/account/AccountScreen';
import { AppointmentListScreen } from '../screens/appointments/AppointmentListScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { useTheme } from '../theme/ThemeContext';
import { MainTabParamList } from '../types/navigation.types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconProps = {
  focused: boolean;
  variant: 'today' | 'calendar' | 'account';
};

function TabIcon({ focused, variant }: TabIconProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createIconStyles(colors), [colors]);
  const color = focused ? colors.text : colors.textSoft;

  if (variant === 'today') {
    return (
      <View style={styles.iconWrap}>
        <View style={[styles.todayBox, { borderColor: color }]}>
          <View style={[styles.todayDot, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  if (variant === 'calendar') {
    return (
      <View style={styles.iconWrap}>
        <View style={[styles.calendarTop, { backgroundColor: color }]} />
        <View style={[styles.calendarBody, { borderColor: color }]}>
          <View style={[styles.calendarLine, { backgroundColor: color }]} />
          <View style={[styles.calendarLine, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.iconWrap}>
      <View style={[styles.accountHead, { backgroundColor: color }]} />
      <View style={[styles.accountBody, { borderColor: color }]} />
    </View>
  );
}

export function MainTabs() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Today"
        component={HomeScreen}
        options={{
          title: 'Hoy',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} variant="today" />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={AppointmentListScreen}
        options={{
          title: 'Agenda',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} variant="calendar" />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} variant="account" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    tabBar: {
      backgroundColor: colors.bgCard,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      height: 60,
      paddingTop: 6,
      paddingBottom: 8,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '600',
    },
  });
}

function createIconStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    iconWrap: {
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todayBox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todayDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    calendarTop: {
      width: 16,
      height: 4,
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
    },
    calendarBody: {
      width: 16,
      height: 12,
      borderWidth: 1.5,
      borderTopWidth: 0,
      borderBottomLeftRadius: 2,
      borderBottomRightRadius: 2,
      paddingTop: 2,
      gap: 2,
      alignItems: 'center',
    },
    calendarLine: {
      width: 10,
      height: 1.5,
      borderRadius: 1,
    },
    accountHead: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginBottom: 2,
    },
    accountBody: {
      width: 14,
      height: 8,
      borderWidth: 1.5,
      borderTopWidth: 0,
      borderBottomLeftRadius: 7,
      borderBottomRightRadius: 7,
    },
  });
}
