import argon2 from "argon2";

// Argon2id: hybrid mode, resistant to both GPU cracking and side-channel attacks.
// A fresh random salt is generated internally by argon2 for every hash call.
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MB, OWASP-recommended minimum for argon2id
  timeCost: 2,
  parallelism: 1,
} as const;

export const hashPassword = (password: string): Promise<string> =>
  argon2.hash(password, ARGON2_OPTIONS);

export const comparePassword = (password: string, hash: string): Promise<boolean> =>
  argon2.verify(hash, password);
