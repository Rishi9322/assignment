import { useQuery } from "@tanstack/react-query";
import { ticketService } from "../services/ticket.service";

export const useStats = () =>
  useQuery({
    queryKey: ["stats"],
    queryFn: () => ticketService.stats(),
  });
