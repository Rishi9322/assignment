export const ROLES = ["Admin", "Agent"] as const;
export type Role = (typeof ROLES)[number];

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  team: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MfaChallengeResponse {
  mfaRequired: true;
  mfaToken: string;
  options: unknown;
}

export type LoginResponse = AuthResponse | MfaChallengeResponse;

export interface Passkey {
  id: number;
  nickname: string | null;
  device_type: string | null;
  backed_up: boolean;
  created_at: string;
}
