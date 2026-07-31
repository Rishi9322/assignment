import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settings.service";
import type { UpdateSettingsPayload } from "../types/settings";

export const useSettings = () =>
  useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.get(),
    staleTime: 5 * 60 * 1000,
  });

export const useAdminSettings = () =>
  useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => settingsService.getAdmin(),
  });

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => settingsService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
};
