import { api } from "./api";
import type { AuthResponse, LoginResponse, Passkey, User } from "../types/user";

export const authService = {
  async register(input: { name: string; email: string; password: string; team?: string }) {
    const { data } = await api.post<AuthResponse>("/auth/register", input);
    return data;
  },

  async login(input: { email: string; password: string }) {
    const { data } = await api.post<LoginResponse>("/auth/login", input);
    return data;
  },

  async verifyLoginPasskey(mfaToken: string, response: unknown) {
    const { data } = await api.post<AuthResponse>("/auth/login/passkey/verify", {
      mfa_token: mfaToken,
      response,
    });
    return data;
  },

  async me() {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async passkeyRegisterOptions() {
    const { data } = await api.post("/auth/passkeys/register/options");
    return data;
  },

  async passkeyRegisterVerify(response: unknown, nickname?: string) {
    const { data } = await api.post("/auth/passkeys/register/verify", { response, nickname });
    return data;
  },

  async listPasskeys() {
    const { data } = await api.get<Passkey[]>("/auth/passkeys");
    return data;
  },

  async deletePasskey(id: number) {
    await api.delete(`/auth/passkeys/${id}`);
  },
};
