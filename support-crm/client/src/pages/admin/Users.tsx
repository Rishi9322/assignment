import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { adminService } from "../../services/admin.service";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/Toast";
import { Loader } from "../../components/Loader";
import { ROLES } from "../../types/user";
import type { Role } from "../../types/user";
import { formatDate } from "../../utils/date";

export const AdminUsers = () => {
  const { data: users, isLoading } = useAdminUsers();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) =>
      adminService.updateUser(id, { role }),
    onSuccess: () => {
      invalidate();
      showToast("Role updated");
    },
    onError: (err: any) => showToast(err?.response?.data?.error ?? "Failed to update role", "error"),
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      adminService.updateUser(id, { active }),
    onSuccess: (_, { active }) => {
      invalidate();
      showToast(active ? "User reactivated" : "User deactivated");
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.error ?? "Failed to update status", "error"),
  });

  const unlockMutation = useMutation({
    mutationFn: (id: number) => adminService.unlockUser(id),
    onSuccess: () => {
      invalidate();
      showToast("Account unlocked");
    },
    onError: () => showToast("Failed to unlock account", "error"),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Users</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Manage roles and account access for everyone in your organization.
      </p>

      <div className="mt-6">
        {isLoading && <Loader />}
        {users && (
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-surface-alt">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Team</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Role</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Joined</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isLocked = !!u.lockedUntil && new Date(u.lockedUntil).getTime() > Date.now();
                  return (
                    <tr key={u.id} className={!u.active ? "opacity-60" : ""}>
                      <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                      <td className="px-4 py-3 text-ink-secondary">{u.email}</td>
                      <td className="px-4 py-3 text-ink-secondary">{u.team ?? "—"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={isSelf || roleMutation.isPending}
                          onChange={(e) =>
                            roleMutation.mutate({ id: u.id, role: e.target.value as Role })
                          }
                          className="field w-auto py-1"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            u.active
                              ? "bg-success-soft text-success"
                              : "bg-danger-soft text-danger"
                          }`}
                        >
                          {u.active ? "Active" : "Deactivated"}
                        </span>
                        {isLocked && (
                          <span className="ml-1.5 inline-flex items-center rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">
                            Locked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {isLocked && (
                          <button
                            onClick={() => unlockMutation.mutate(u.id)}
                            disabled={unlockMutation.isPending}
                            className="mr-3 text-xs font-medium text-accent hover:underline disabled:opacity-50"
                          >
                            Unlock
                          </button>
                        )}
                        {!isSelf && (
                          <button
                            onClick={() =>
                              activeMutation.mutate({ id: u.id, active: !u.active })
                            }
                            disabled={activeMutation.isPending}
                            className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
                          >
                            {u.active ? "Deactivate" : "Reactivate"}
                          </button>
                        )}
                        {isSelf && <span className="text-xs text-ink-muted">You</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
