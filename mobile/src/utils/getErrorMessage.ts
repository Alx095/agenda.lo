import { ApiError } from '../api/http';

export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error'): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
