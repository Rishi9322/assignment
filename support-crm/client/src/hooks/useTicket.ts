import { useQuery } from "@tanstack/react-query";
import { ticketService } from "../services/ticket.service";

export const useTicket = (ticketId: string | undefined) =>
  useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => ticketService.getById(ticketId as string),
    enabled: Boolean(ticketId),
  });
