import { AppointmentStatus } from '../types/appointment';
import {
  AppColors,
  AppTheme,
  NavigationThemeOptions,
  StatusThemeMap,
} from './types';

/** Calma — papel cálido, tinta oscura, acento teal. Sin purple/orbs. */
const lightColors: AppColors = {
  bg: '#F7F5F2',
  bgCard: '#FFFFFF',
  bgDark: '#1A1A1A',
  bgDarkSoft: '#2C2C2C',
  primary: '#1F6B63',
  primaryDark: '#164F49',
  primaryLight: '#E8F2F1',
  accent: '#C45C3E',
  accentLight: '#F9EDE8',
  text: '#1A1A1A',
  textMuted: '#6B6560',
  textSoft: '#9C9690',
  textInverse: '#FAFAF9',
  border: '#E5E0D8',
  borderLight: '#EDE9E3',
  success: '#2F7D4A',
  successLight: '#E6F2EA',
  warning: '#A16207',
  warningLight: '#F5EDD8',
  danger: '#B42318',
  dangerLight: '#FCEAE8',
  shadow: '#1A1A1A',
  heroSubtitle: '#6B6560',
  inputPlaceholder: '#9C9690',
};

const darkColors: AppColors = {
  bg: '#121110',
  bgCard: '#1C1A18',
  bgDark: '#FAFAF9',
  bgDarkSoft: '#E5E0D8',
  primary: '#5BA89E',
  primaryDark: '#7EC4BA',
  primaryLight: '#243330',
  accent: '#D4846A',
  accentLight: '#3A2A24',
  text: '#F5F2EE',
  textMuted: '#A8A29E',
  textSoft: '#78716C',
  textInverse: '#121110',
  border: '#2E2A27',
  borderLight: '#252220',
  success: '#6BBF82',
  successLight: '#1E2E24',
  warning: '#D4A843',
  warningLight: '#2E2818',
  danger: '#E07A72',
  dangerLight: '#351816',
  shadow: '#000000',
  heroSubtitle: '#A8A29E',
  inputPlaceholder: '#78716C',
};

function buildStatusTheme(colors: AppColors, isDark: boolean): StatusThemeMap {
  return {
    PENDING: {
      label: 'Pendiente',
      bg: colors.warningLight,
      text: isDark ? '#E8C96A' : colors.warning,
      accent: colors.warning,
    },
    CONFIRMED: {
      label: 'Confirmada',
      bg: colors.primaryLight,
      text: isDark ? colors.primaryDark : colors.primary,
      accent: colors.primary,
    },
    CANCELLED: {
      label: 'Cancelada',
      bg: colors.dangerLight,
      text: isDark ? colors.danger : colors.danger,
      accent: colors.danger,
    },
    COMPLETED: {
      label: 'Completada',
      bg: colors.successLight,
      text: isDark ? colors.success : colors.success,
      accent: colors.success,
    },
  };
}

function buildNavigationTheme(colors: AppColors): NavigationThemeOptions {
  return {
    headerStyle: { backgroundColor: colors.bg },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '600' },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.bg },
  };
}

function buildTheme(colors: AppColors, isDark: boolean): AppTheme {
  return {
    colors,
    statusTheme: buildStatusTheme(colors, isDark),
    navigationTheme: buildNavigationTheme(colors),
    isDark,
  };
}

export function getLightTheme(): AppTheme {
  return buildTheme(lightColors, false);
}

export function getDarkTheme(): AppTheme {
  return buildTheme(darkColors, true);
}

export function getStatusThemeForColors(
  colors: AppColors,
  isDark: boolean,
): StatusThemeMap {
  return buildStatusTheme(colors, isDark);
}
