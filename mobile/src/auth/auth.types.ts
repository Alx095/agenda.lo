import { User } from '../types/user';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: User;
};

export type RefreshTokenPayload = {
  refresh_token: string;
};
