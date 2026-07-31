import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthTokenPayload, MfaTokenPayload } from "../types/user";

export const signToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as SignOptions);

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
