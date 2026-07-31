import { useQuery } from "@tanstack/react-query";
import { ticketService } from "../services/ticket.service";
import type { Team, TicketStatus } from "../types/ticket";

export const useTickets = (status?: TicketStatus, search?: string, team?: Team) =>
  useQuery({
    queryKey: ["tickets", status, search, team],
    queryFn: () => ticketService.list({ status, search, team }),
  });
