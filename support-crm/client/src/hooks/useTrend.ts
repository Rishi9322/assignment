import { useQuery } from "@tanstack/react-query";
import { ticketService } from "../services/ticket.service";

export const useTrend = () =>
  useQuery({
    queryKey: ["stats", "trend"],
    queryFn: () => ticketService.trend(),
  });
