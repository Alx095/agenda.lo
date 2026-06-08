import { http } from '../api/http';
import { authorizedRequest } from '../api/client';
import { User } from '../types/user';
import {
  AuthResponse,
  LoginCredentials,
  MessageResponse,
  RefreshTokenPayload,
  RegisterCredentials,
  RegisterResponse,
} from './auth.types';

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  return http<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    auth: false,
  });
}

export async function registerRequest(
  credentials: RegisterCredentials,
): Promise<RegisterResponse> {
  return http<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
    auth: false,
  });
}

export async function verifyEmailRequest(token: string): Promise<AuthResponse> {
  return http<AuthResponse>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
    auth: false,
  });
}

export async function resendVerificationRequest(
  email: string,
): Promise<MessageResponse> {
  return http<MessageResponse>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
    auth: false,
  });
}

export async function refreshRequest(
  payload: RefreshTokenPayload,
): Promise<AuthResponse> {
  return http<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  });
}

export async function logoutRequest(): Promise<void> {
  await http('/auth/logout', {
    method: 'POST',
    auth: true,
  });
}

export async function getMeRequest(): Promise<User> {
  return authorizedRequest<User>('/users/me', {
    method: 'GET',
  });
}
