import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";

export const useAuditLog = () =>
  useQuery({
    queryKey: ["admin", "audit-log"],
    queryFn: () => adminService.auditLog(200),
  });
