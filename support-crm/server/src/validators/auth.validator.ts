import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  email: z.string().trim().email("email must be valid"),
  password: z.string().min(8, "password must be at least 8 characters"),
  team: z.string().trim().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("email must be valid"),
  password: z.string().min(1, "password is required"),
});

export const verifyLoginPasskeySchema = z.object({
  mfa_token: z.string().min(1, "mfa_token is required"),
  response: z.record(z.string(), z.any()),
});

export const passkeyRegisterVerifySchema = z.object({
  response: z.record(z.string(), z.any()),
  nickname: z.string().trim().min(1).optional(),
});
