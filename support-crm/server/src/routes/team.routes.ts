import { Router } from "express";
import { teamController } from "../controllers/team.controller";

export const teamRouter = Router();

teamRouter.get("/", teamController.listActiveNames);
