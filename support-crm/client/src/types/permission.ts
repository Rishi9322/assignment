export interface PermissionMatrix {
  permissions: string[];
  roles: { role: string; granted: string[] }[];
}

export interface MyPermissions {
  role: string;
  permissions: string[];
}

export const PERMISSION_LABELS: Record<string, string> = {
  manage_teams: "Manage team directory",
  manage_sla: "Edit SLA rules",
  manage_webhooks: "Manage webhooks",
  view_audit_log: "View audit log",
};
