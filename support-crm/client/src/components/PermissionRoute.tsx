import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useHasPermission, useMyPermissions } from "../hooks/usePermissions";
import { Loader } from "./Loader";

export const PermissionRoute = ({ permission }: { permission: string }) => {
  const { user, isLoading } = useAuth();
  const { isLoading: permissionsLoading } = useMyPermissions();
  const allowed = useHasPermission(permission);

  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "Admin" && permissionsLoading) return <Loader />;
  if (!allowed) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
