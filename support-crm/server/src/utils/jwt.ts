import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthTokenPayload, MfaTokenPayload } from "../types/user";
import { settingsRepository } from "../repositories/settings.repository";

// Session length is admin-configurable (System Settings > Security) rather
// than a fixed env var, so it takes effect for new logins without a redeploy.
export const signToken = async (payload: AuthTokenPayload): Promise<string> => {
  const settings = await settingsRepository.get();
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: settings.sessionTimeoutMinutes * 60,
  } as SignOptions);
};

export const verifyToken = (token: string): AuthTokenPayload =>
  jwt.verify(token, env.jwtSecret) as unknown as AuthTokenPayload;

export const signMfaToken = (payload: Omit<MfaTokenPayload, "purpose">): string =>
  jwt.sign({ ...payload, purpose: "mfa" } satisfies MfaTokenPayload, env.jwtSecret, {
    expiresIn: "5m",
  });

export const verifyMfaToken = (token: string): MfaTokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret) as unknown as MfaTokenPayload;
  if (decoded.purpose !== "mfa") {
    throw new Error("Not an MFA token");
  }
  return decoded;
};
