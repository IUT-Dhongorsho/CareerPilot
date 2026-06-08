export type AuthUser = {
  name?: string;
  email: string;
  avatar_url?: string;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
  user: AuthUser;
};

export const AUTH_TYPES_VERSION = '1.0.0';
