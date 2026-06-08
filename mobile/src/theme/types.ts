import { AppointmentStatus } from '../types/appointment';

export type ThemeMode = 'light' | 'dark' | 'system';

export type AppColors = {
  bg: string;
  bgCard: string;
  bgDark: string;
  bgDarkSoft: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  text: string;
  textMuted: string;
  textSoft: string;
  textInverse: string;
  border: string;
  borderLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  shadow: string;
  heroSubtitle: string;
  inputPlaceholder: string;
};

export type StatusThemeEntry = {
  label: string;
  bg: string;
  text: string;
  accent: string;
};

export type StatusThemeMap = Record<AppointmentStatus, StatusThemeEntry>;

export type NavigationThemeOptions = {
  headerStyle: { backgroundColor: string };
  headerTintColor: string;
  headerTitleStyle: { fontWeight: '600' | '700' };
  headerShadowVisible: boolean;
  contentStyle: { backgroundColor: string };
};

export type AppTheme = {
  colors: AppColors;
  statusTheme: StatusThemeMap;
  navigationTheme: NavigationThemeOptions;
  isDark: boolean;
};
