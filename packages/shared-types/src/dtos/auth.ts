export interface AuthUserProfile {
  id: string;
  email: string;
  name: string;
  number?: string | null;
  orgtype?: string | null;
  ownerId?: string | null;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  user: AuthUserProfile;
}

export interface JwtAuthUser extends AuthUserProfile {}