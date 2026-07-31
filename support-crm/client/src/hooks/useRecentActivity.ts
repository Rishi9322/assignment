import { useQuery } from "@tanstack/react-query";
import { ticketService } from "../services/ticket.service";

export const useRecentActivity = () =>
  useQuery({
    queryKey: ["stats", "recent-activity"],
    queryFn: () => ticketService.recentActivity(),
    refetchInterval: 30_000,
  });
