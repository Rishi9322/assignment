import { useQuery } from "@tanstack/react-query";
import { ticketService } from "../services/ticket.service";

export const useTeams = () =>
  useQuery({
    queryKey: ["teams"],
    queryFn: () => ticketService.teams(),
    staleTime: 5 * 60 * 1000,
  });
