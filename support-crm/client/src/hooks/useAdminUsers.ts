import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";

export const useAdminUsers = () =>
  useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminService.listUsers(),
  });
