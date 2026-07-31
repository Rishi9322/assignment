export const ROLES = ["Admin", "Agent"] as const;
export type Role = (typeof ROLES)[number];

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  team?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  sub: number;
  email: string;
  name: string;
  role: Role;
  purpose?: undefined;
}

export interface MfaTokenPayload {
  sub: number;
  ceremonyId: string;
  purpose: "mfa";
}
