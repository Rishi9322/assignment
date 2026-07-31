// Configurable capabilities an Admin can delegate to the Agent role without
// promoting them to full Admin. Admin implicitly has every permission and is
// never represented as rows in the RolePermission table.
export const PERMISSIONS = [
  "manage_teams",
  "manage_sla",
  "manage_webhooks",
  "view_audit_log",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  manage_teams: "Manage team directory",
  manage_sla: "Edit SLA rules",
  manage_webhooks: "Manage webhooks",
  view_audit_log: "View audit log",
};

// Roles that can be granted permissions. Admin is excluded — it always has
// every permission and isn't a configurable row in the matrix.
export const CONFIGURABLE_ROLES = ["Agent"] as const;
