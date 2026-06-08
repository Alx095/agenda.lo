export { http, pingApi, ApiError } from './http';
export { getAccessToken, setAccessToken } from './tokenManager';

type TokenRefreshHandler = () => Promise<string | null>;
type SessionExpiredHandler = () => void;

let refreshHandler: TokenRefreshHandler | null = null;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function configureApiAuth(options: {
  refreshHandler: TokenRefreshHandler;
  onSessionExpired: SessionExpiredHandler;
}) {
  refreshHandler = options.refreshHandler;
  sessionExpiredHandler = options.onSessionExpired;
}

export async function authorizedRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { http, ApiError } = await import('./http');

  try {
    return await http<T>(path, { ...options, auth: true });
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      refreshHandler &&
      !path.includes('/auth/refresh')
    ) {
      const newToken = await refreshHandler();

      if (!newToken) {
        sessionExpiredHandler?.();
        throw error;
      }

      return http<T>(path, { ...options, auth: true });
    }

    throw error;
  }
}
