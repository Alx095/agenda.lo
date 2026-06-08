import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { getDarkTheme, getLightTheme } from './palettes';
import { getStoredThemeMode, saveThemeMode } from './themeStorage';
import { AppTheme, ThemeMode } from './types';

type ThemeContextValue = AppTheme & {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isReady: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveIsDark(mode: ThemeMode, systemScheme: ColorSchemeName): boolean {
  if (mode === 'dark') {
    return true;
  }

  if (mode === 'light') {
    return false;
  }

  return systemScheme === 'dark';
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? 'light',
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void getStoredThemeMode().then((stored) => {
      if (stored) {
        setModeState(stored);
      }
      setIsReady(true);
    });

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    void saveThemeMode(nextMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((current) => {
      const next: ThemeMode =
        current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
      void saveThemeMode(next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = resolveIsDark(mode, systemScheme);
    const theme = isDark ? getDarkTheme() : getLightTheme();

    return {
      ...theme,
      mode,
      setMode,
      toggleTheme,
      isReady,
    };
  }, [mode, systemScheme, setMode, toggleTheme, isReady]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

export function useThemedStyles<T>(
  factory: (theme: AppTheme) => T,
  deps: unknown[] = [],
): T {
  const theme = useTheme();

  return useMemo(() => factory(theme), [theme, ...deps]);
}
