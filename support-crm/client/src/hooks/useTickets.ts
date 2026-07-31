import { useQuery } from "@tanstack/react-query";
import { ticketService } from "../services/ticket.service";
import type { ListTicketsParams } from "../services/ticket.service";

export const useTickets = (params: ListTicketsParams) =>
  useQuery({
    queryKey: ["tickets", params],
    queryFn: () => ticketService.list(params),
    placeholderData: (previous) => previous,
  });
