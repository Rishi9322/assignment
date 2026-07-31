import { Router } from "express";
import { TEAMS } from "../types/ticket";

export const teamRouter = Router();

teamRouter.get("/", (_req, res) => {
  res.json(TEAMS);
});
