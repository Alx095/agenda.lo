import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { configureApiAuth } from '../api/client';
import { getAccessToken, setAccessToken } from '../api/tokenManager';
import { User } from '../types/user';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  getMeRequest,
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
} from './auth.api';
import { LoginCredentials, RegisterCredentials } from './auth.types';
import {
  clearTokens,
  getStoredTokens,
  saveTokens,
} from './tokenStorage';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const refreshTokenRef = useRef<string | null>(null);

  const applyAuthSession = useCallback(
    async (accessToken: string, refreshToken: string, nextUser: User) => {
      refreshTokenRef.current = refreshToken;
      setAccessToken(accessToken);
      await saveTokens(accessToken, refreshToken);
      setUser(nextUser);
    },
    [],
  );

  const clearAuthSession = useCallback(async () => {
    refreshTokenRef.current = null;
    setAccessToken(null);
    await clearTokens();
    setUser(null);
  }, []);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const refreshToken = refreshTokenRef.current;

    if (!refreshToken) {
      await clearAuthSession();
      return null;
    }

    try {
      const response = await refreshRequest({ refresh_token: refreshToken });
      await applyAuthSession(
        response.access_token,
        response.refresh_token,
        response.user,
      );
      return response.access_token;
    } catch {
      await clearAuthSession();
      return null;
    }
  }, [applyAuthSession, clearAuthSession]);

  const restoreSession = useCallback(async () => {
    try {
      const { accessToken, refreshToken } = await getStoredTokens();

      if (!accessToken || !refreshToken) {
        await clearAuthSession();
        return;
      }

      refreshTokenRef.current = refreshToken;
      setAccessToken(accessToken);

      try {
        const me = await getMeRequest();
        setUser(me);
      } catch {
        const newAccessToken = await refreshSession();
        if (!newAccessToken) {
          await clearAuthSession();
        }
      }
    } catch {
      await clearAuthSession();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthSession, refreshSession]);

  useEffect(() => {
    configureApiAuth({
      refreshHandler: refreshSession,
      onSessionExpired: () => {
        void clearAuthSession();
      },
    });

    void restoreSession();
  }, [clearAuthSession, refreshSession, restoreSession]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsSubmitting(true);

      try {
        const response = await loginRequest(credentials);
        await applyAuthSession(
          response.access_token,
          response.refresh_token,
          response.user,
        );
      } catch (error) {
        throw new Error(getErrorMessage(error, 'No se pudo iniciar sesión'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [applyAuthSession],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      setIsSubmitting(true);

      try {
        const response = await registerRequest(credentials);
        await applyAuthSession(
          response.access_token,
          response.refresh_token,
          response.user,
        );
      } catch (error) {
        throw new Error(getErrorMessage(error, 'No se pudo registrar el usuario'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [applyAuthSession],
  );

  const logout = useCallback(async () => {
    setIsSubmitting(true);

    try {
      if (getAccessToken()) {
        await logoutRequest();
      }
    } catch {
      // Best effort logout even if API fails.
    } finally {
      await clearAuthSession();
      setIsSubmitting(false);
    }
  }, [clearAuthSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isSubmitting,
      login,
      register,
      logout,
    }),
    [user, isLoading, isSubmitting, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
