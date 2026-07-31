import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { slaRuleService } from "../services/slaRule.service";

export const useSlaRules = () =>
  useQuery({
    queryKey: ["admin", "sla-rules"],
    queryFn: () => slaRuleService.list(),
  });

export const useUpdateSlaRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ priority, hours }: { priority: string; hours: number }) =>
      slaRuleService.update(priority, hours),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "sla-rules"] }),
  });
};
