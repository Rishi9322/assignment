import { NextFunction, Request, Response } from "express";
import { teamRepository } from "../repositories/team.repository";

export const teamController = {
  // Used by ticket/user assignment dropdowns — active team names only,
  // matching the shape the client has always expected (a plain string array).
  async listActiveNames(_req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await teamRepository.listActive();
      res.json(teams.map((t) => t.name));
    } catch (err) {
      next(err);
    }
  },
};
