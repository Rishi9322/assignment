import { NextFunction, Request, Response } from "express";
import { userRepository } from "../repositories/user.repository";

export const userController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userRepository.listAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  },
};
