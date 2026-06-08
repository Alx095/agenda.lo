import { Platform } from 'react-native';
import { API_URL, DEFAULT_API_URL } from '../utils/constants';
import { getAccessToken } from './tokenManager';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type HttpOptions = RequestInit & {
  auth?: boolean;
};

function getBaseUrl(): string {
  const base = API_URL?.startsWith('http') ? API_URL : DEFAULT_API_URL;
  return base.replace(/\/$/, '');
}

export function buildUrl(path: string): string {
  return `${getBaseUrl()}${path}`;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }

    if (typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    // ignore JSON parse errors
  }

  return `Error ${response.status}`;
}

function mapFetchError(error: unknown): Error {
  if (error instanceof ApiError) {
    return error;
  }

  const detail =
    error instanceof Error ? error.message : 'Error de red desconocido';

  if (Platform.OS === 'web') {
    return new Error(
      `No se pudo conectar (web/CORS). Configura CORS_ORIGIN=* en Railway. Detalle: ${detail}`,
    );
  }

  if (__DEV__) {
    return new Error(
      `No se pudo conectar con el servidor (${detail}). URL: ${getBaseUrl()}`,
    );
  }

  return new Error(
    'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  );
}

export async function http<T>(
  path: string,
  options: HttpOptions = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (rest.body) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const url = buildUrl(path);

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      throw new ApiError(message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    throw mapFetchError(error);
  }
}

export type PingResult = {
  ok: boolean;
  detail: string;
};

export async function pingApi(): Promise<PingResult> {
  const url = buildUrl('/health');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    return {
      ok: response.ok,
      detail: `HTTP ${response.status} → ${url}`,
    };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : 'Error de red desconocido';

    return {
      ok: false,
      detail: `${detail} → ${url}`,
    };
  }
}
