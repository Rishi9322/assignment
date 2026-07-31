import { randomUUID } from "node:crypto";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
  WebAuthnCredential,
} from "@simplewebauthn/server";
import { userRepository } from "../repositories/user.repository";
import { passkeyRepository } from "../repositories/passkey.repository";
import { ApiError } from "../middleware/errorHandler";
import { comparePassword, hashPassword } from "../utils/password";
import { signToken, signMfaToken, verifyMfaToken } from "../utils/jwt";
import { challengeStore } from "../utils/challengeStore";
import { env } from "../config/env";
import { settingsRepository } from "../repositories/settings.repository";
import { LoginInput, RegisterInput, Role } from "../types/user";

type UserRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  team: string | null;
};

const toAuthResponse = async (user: UserRecord) => {
  const token = await signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, team: user.team },
  };
};

const ensureActive = (user: { active: boolean }) => {
  if (!user.active) {
    throw new ApiError(403, "This account has been deactivated. Contact an administrator.");
  }
};

const ensureNotLocked = (user: { lockedUntil: Date | null }) => {
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new ApiError(
      423,
      `Too many failed login attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`
    );
  }
};

const toWebAuthnCredential = (p: {
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string | null;
}): WebAuthnCredential => ({
  id: p.credentialId,
  publicKey: isoBase64URL.toBuffer(p.publicKey),
  counter: p.counter,
  transports: p.transports ? (p.transports.split(",") as WebAuthnCredential["transports"]) : undefined,
});

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ApiError(409, "An account with this email already exists");
    }
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      team: input.team,
    });
    return await toAuthResponse(user);
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }
    ensureNotLocked(user);

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      const settings = await settingsRepository.get();
      const attempts = user.failedLoginAttempts + 1;
      const lockedUntil =
        attempts >= settings.maxLoginAttempts
          ? new Date(Date.now() + settings.lockoutMinutes * 60 * 1000)
          : null;
      await userRepository.recordFailedLogin(user.id, attempts, lockedUntil);
      if (lockedUntil) {
        throw new ApiError(
          423,
          `Too many failed login attempts. Try again in ${settings.lockoutMinutes} minutes.`
        );
      }
      throw new ApiError(401, "Invalid email or password");
    }
    if (user.failedLoginAttempts > 0) {
      await userRepository.clearLockout(user.id);
    }
    ensureActive(user);

    const passkeys = await passkeyRepository.findByUserId(user.id);
    if (passkeys.length === 0) {
      return await toAuthResponse(user);
    }

    const options = await generateAuthenticationOptions({
      rpID: env.webauthnRpId,
      userVerification: "preferred",
      allowCredentials: passkeys.map((p) => ({
        id: p.credentialId,
        transports: p.transports
          ? (p.transports.split(",") as NonNullable<WebAuthnCredential["transports"]>)
          : undefined,
      })),
    });

    const ceremonyId = randomUUID();
    challengeStore.save(ceremonyId, user.id, options.challenge);
    const mfaToken = signMfaToken({ sub: user.id, ceremonyId });

    return { mfaRequired: true as const, mfaToken, options };
  },

  async verifyLoginPasskey(mfaToken: string, response: AuthenticationResponseJSON) {
    let payload;
    try {
      payload = verifyMfaToken(mfaToken);
    } catch {
      throw new ApiError(401, "MFA session expired, please log in again");
    }

    const entry = challengeStore.consume(payload.ceremonyId);
    if (!entry || entry.userId !== payload.sub) {
      throw new ApiError(401, "MFA session expired, please log in again");
    }

    const passkey = await passkeyRepository.findByCredentialId(response.id);
    if (!passkey || passkey.userId !== payload.sub) {
      throw new ApiError(401, "Passkey not recognized");
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: entry.challenge,
      expectedOrigin: env.webauthnOrigin,
      expectedRPID: env.webauthnRpId,
      credential: toWebAuthnCredential(passkey),
      requireUserVerification: false,
    });

    if (!verification.verified) {
      throw new ApiError(401, "Passkey verification failed");
    }

    await passkeyRepository.updateCounter(passkey.id, verification.authenticationInfo.newCounter);

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    ensureActive(user);
    return await toAuthResponse(user);
  },

  async me(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return { id: user.id, name: user.name, email: user.email, role: user.role, team: user.team };
  },

  async generatePasskeyRegistrationOptions(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const existing = await passkeyRepository.findByUserId(userId);

    const options = await generateRegistrationOptions({
      rpName: env.webauthnRpName,
      rpID: env.webauthnRpId,
      userName: user.email,
      userDisplayName: user.name,
      userID: isoUint8Array.fromUTF8String(String(user.id)),
      attestationType: "none",
      excludeCredentials: existing.map((p) => ({
        id: p.credentialId,
        transports: p.transports
          ? (p.transports.split(",") as NonNullable<WebAuthnCredential["transports"]>)
          : undefined,
      })),
      authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
    });

    challengeStore.save(`register:${userId}`, userId, options.challenge);
    return options;
  },

  async verifyPasskeyRegistration(
    userId: number,
    response: RegistrationResponseJSON,
    nickname?: string
  ) {
    const entry = challengeStore.consume(`register:${userId}`);
    if (!entry) {
      throw new ApiError(400, "Registration session expired, please try again");
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: entry.challenge,
      expectedOrigin: env.webauthnOrigin,
      expectedRPID: env.webauthnRpId,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new ApiError(400, "Passkey registration failed");
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    await passkeyRepository.create({
      userId,
      credentialId: credential.id,
      publicKey: isoBase64URL.fromBuffer(credential.publicKey),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: credential.transports?.join(","),
      nickname,
    });

    return { verified: true };
  },

  async listPasskeys(userId: number) {
    const passkeys = await passkeyRepository.findByUserId(userId);
    return passkeys.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      device_type: p.deviceType,
      backed_up: p.backedUp,
      created_at: p.createdAt,
    }));
  },

  async deletePasskey(userId: number, id: number) {
    await passkeyRepository.deleteForUser(userId, id);
  },
};
