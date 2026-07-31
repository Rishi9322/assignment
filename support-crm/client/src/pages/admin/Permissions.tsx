import { useState } from "react";
import { usePermissionMatrix, useUpdateRolePermissions } from "../../hooks/usePermissions";
import { Loader } from "../../components/Loader";
import { useToast } from "../../components/Toast";
import { PERMISSION_LABELS } from "../../types/permission";

const RoleColumn = ({ role, granted }: { role: string; granted: string[] }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(granted));
  const updateMutation = useUpdateRolePermissions();
  const { showToast } = useToast();
  const { data } = usePermissionMatrix();

  const toggle = (permission: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  };

  const dirty =
    !data ||
    selected.size !== granted.length ||
    [...selected].some((p) => !granted.includes(p));

  const handleSave = () => {
    updateMutation.mutate(
      { role, permissions: [...selected] },
      {
        onSuccess: () => showToast(`${role} permissions updated`),
        onError: (err: any) =>
          showToast(err?.response?.data?.error ?? "Failed to update permissions", "error"),
      }
    );
  };

  if (!data) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{role}</h2>
        <button
          onClick={handleSave}
          disabled={!dirty || updateMutation.isPending}
          className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {data.permissions.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-ink-secondary">
            <input type="checkbox" checked={selected.has(p)} onChange={() => toggle(p)} />
            {PERMISSION_LABELS[p] ?? p}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const AdminPermissions = () => {
  const { data, isLoading } = usePermissionMatrix();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Roles &amp; permissions</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Admins always have full access. Grant Agents specific admin capabilities below without
        promoting them to Admin.
      </p>

      <div className="mt-6 space-y-4">
        {isLoading && <Loader />}
        {data &&
          data.roles.map((r) => <RoleColumn key={r.role} role={r.role} granted={r.granted} />)}
      </div>
    </div>
  );
};
