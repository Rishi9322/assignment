import { Router } from "express";
import { ticketController } from "../controllers/ticket.controller";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  addNoteSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  updateTicketSchema,
} from "../validators/ticket.validator";

export const ticketRouter = Router();

ticketRouter.post("/", validateBody(createTicketSchema), ticketController.create);
ticketRouter.get("/", validateQuery(listTicketsQuerySchema), ticketController.list);
ticketRouter.get("/:ticketId", ticketController.getById);
ticketRouter.put("/:ticketId", validateBody(updateTicketSchema), ticketController.update);
ticketRouter.post("/:ticketId/notes", validateBody(addNoteSchema), ticketController.addNote);
