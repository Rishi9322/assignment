import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async verifyLoginPasskey(req: Request, res: Response, next: NextFunction) {
    try {
      const { mfa_token, response } = req.body;
      const result = await authService.verifyLoginPasskey(mfa_token, response);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user!.sub);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async passkeyRegisterOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const options = await authService.generatePasskeyRegistrationOptions(req.user!.sub);
      res.json(options);
    } catch (err) {
      next(err);
    }
  },

  async passkeyRegisterVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const { response, nickname } = req.body;
      const result = await authService.verifyPasskeyRegistration(req.user!.sub, response, nickname);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async listPasskeys(req: Request, res: Response, next: NextFunction) {
    try {
      const passkeys = await authService.listPasskeys(req.user!.sub);
      res.json(passkeys);
    } catch (err) {
      next(err);
    }
  },

  async deletePasskey(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.deletePasskey(req.user!.sub, Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
