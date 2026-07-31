import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-semibold text-ink">
            Support CRM
          </Link>
          <nav className="hidden gap-4 text-sm text-ink-secondary sm:flex">
            <Link to="/dashboard" className="hover:text-ink">
              Dashboard
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
                <Link to="/admin/teams" className="hover:text-ink">
                  Teams
                </Link>
                <Link to="/admin/audit-log" className="hover:text-ink">
                  Audit Log
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
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
