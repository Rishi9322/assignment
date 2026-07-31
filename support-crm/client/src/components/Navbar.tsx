import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useHasPermission } from "../hooks/usePermissions";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { useSettings } from "../hooks/useSettings";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const canManageTeams = useHasPermission("manage_teams");
  const canManageWebhooks = useHasPermission("manage_webhooks");
  const canManageSla = useHasPermission("manage_sla");
  const canViewAuditLog = useHasPermission("view_audit_log");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-semibold text-ink">
            {settings?.org_name ?? "Support CRM"}
          </Link>
          <nav className="hidden gap-4 text-sm text-ink-secondary sm:flex">
            <Link to="/dashboard" className="hover:text-ink">
              Dashboard
            </Link>
            <Link to="/contacts" className="hover:text-ink">
              Contacts
            </Link>
            <Link to="/vendors" className="hover:text-ink">
              Vendors
            </Link>
            <Link to="/security" className="hover:text-ink">
              Security
            </Link>
            {user?.role === "Admin" && (
              <>
                <Link to="/admin/users" className="hover:text-ink">
                  Users
                </Link>
                <Link to="/admin/permissions" className="hover:text-ink">
                  Permissions
                </Link>
                <Link to="/admin/settings" className="hover:text-ink">
                  Settings
                </Link>
              </>
            )}
            {canManageTeams && (
              <Link to="/admin/teams" className="hover:text-ink">
                Teams
              </Link>
            )}
            {canManageWebhooks && (
              <Link to="/admin/webhooks" className="hover:text-ink">
                Webhooks
              </Link>
            )}
            {canManageSla && (
              <Link to="/admin/sla-rules" className="hover:text-ink">
                SLA
              </Link>
            )}
            {canViewAuditLog && (
              <Link to="/admin/audit-log" className="hover:text-ink">
                Audit Log
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user && <NotificationBell />}
          <ThemeToggle />
          <Link
            to="/tickets/new"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            New Ticket
          </Link>
          {user && (
            <div className="flex items-center gap-2 text-sm text-ink-secondary">
              <span className="hidden sm:inline">{user.name}</span>
              <button onClick={handleLogout} className="text-ink-muted hover:text-ink">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
