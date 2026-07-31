import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { permissionService } from "../services/permission.service";
import { useAuth } from "./useAuth";

export const usePermissionMatrix = () =>
  useQuery({
    queryKey: ["admin", "permissions"],
    queryFn: () => permissionService.matrix(),
  });

// Any authenticated user's own effective permissions — Admins implicitly have
// all of them; only fetched for non-Admins since Admin already bypasses every check.
export const useMyPermissions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["permissions", "mine"],
    queryFn: () => permissionService.mine(),
    enabled: !!user && user.role !== "Admin",
  });
};

export const useHasPermission = (permission: string) => {
  const { user } = useAuth();
  const { data } = useMyPermissions();
  if (user?.role === "Admin") return true;
  return data?.permissions.includes(permission) ?? false;
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ role, permissions }: { role: string; permissions: string[] }) =>
      permissionService.updateRole(role, permissions),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "permissions"] }),
  });
};
