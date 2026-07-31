import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  loginSchema,
  passkeyRegisterVerifySchema,
  registerSchema,
  verifyLoginPasskeySchema,
} from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), authController.register);
authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post(
  "/login/passkey/verify",
  validateBody(verifyLoginPasskeySchema),
  authController.verifyLoginPasskey
);
authRouter.get("/me", requireAuth, authController.me);

authRouter.post("/passkeys/register/options", requireAuth, authController.passkeyRegisterOptions);
authRouter.post(
  "/passkeys/register/verify",
  requireAuth,
  validateBody(passkeyRegisterVerifySchema),
  authController.passkeyRegisterVerify
);
authRouter.get("/passkeys", requireAuth, authController.listPasskeys);
authRouter.delete("/passkeys/:id", requireAuth, authController.deletePasskey);
