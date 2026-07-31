import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export const usePasskeys = () =>
  useQuery({
    queryKey: ["passkeys"],
    queryFn: () => authService.listPasskeys(),
  });
