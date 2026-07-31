import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import type { CreateTeamPayload, UpdateTeamPayload } from "../types/admin";

export const useTeamDirectory = () =>
  useQuery({
    queryKey: ["admin", "team-directory"],
    queryFn: () => adminService.listTeamDirectory(),
  });

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => adminService.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "team-directory"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTeamPayload }) =>
      adminService.updateTeam(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "team-directory"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};
