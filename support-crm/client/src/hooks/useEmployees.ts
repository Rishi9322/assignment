import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export const useEmployees = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: () => userService.list(),
  });
