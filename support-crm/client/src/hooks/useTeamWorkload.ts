import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";

export const useTeamWorkload = () =>
  useQuery({
    queryKey: ["admin", "teams"],
    queryFn: () => adminService.teamWorkload(),
  });
