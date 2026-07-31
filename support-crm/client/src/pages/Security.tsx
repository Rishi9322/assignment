import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startRegistration } from "@simplewebauthn/browser";
import { usePasskeys } from "../hooks/usePasskeys";
import { authService } from "../services/auth.service";
import { useToast } from "../components/Toast";
import { Loader } from "../components/Loader";
import { formatDate } from "../utils/date";

export const Security = () => {
  const { data: passkeys, isLoading } = usePasskeys();
  const [nickname, setNickname] = useState("");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const addPasskeyMutation = useMutation({
    mutationFn: async () => {
      const options = await authService.passkeyRegisterOptions();
      const attestation = await startRegistration({ optionsJSON: options as any });
      return authService.passkeyRegisterVerify(attestation, nickname.trim() || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
      setNickname("");
      showToast("Passkey added. It will now be required as a second step at login.");
    },
    onError: (err: any) => {
      if (err?.name === "NotAllowedError") {
        showToast("Passkey setup was cancelled.", "error");
      } else {
        showToast(err?.response?.data?.error ?? "Failed to add passkey", "error");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => authService.deletePasskey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
      showToast("Passkey removed");
    },
    onError: () => showToast("Failed to remove passkey", "error"),
  });

  const hasPasskey = !!passkeys && passkeys.length > 0;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Security</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Passkeys add a second step at login (Windows Hello, Touch ID, or a security key) in addition
        to your password.
      </p>

      {hasPasskey && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
          <span aria-hidden>✓</span>
          Protected by passkey — logins now require both your password and a passkey.
        </div>
      )}

      <div className="card mt-6 p-6">
        <h2 className="text-lg font-semibold text-ink">Your passkeys</h2>

        {isLoading && <Loader />}

        {passkeys && passkeys.length === 0 && (
          <p className="mt-3 text-sm text-ink-secondary">
            No passkeys registered. Your account currently only requires a password to sign in.
          </p>
        )}

        <ul className="mt-3 space-y-2">
          {passkeys?.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2 text-sm"
            >
              <div>
                <p className="text-ink">{p.nickname || `Passkey #${p.id}`}</p>
                <p className="text-xs text-ink-muted">Added {formatDate(p.created_at)}</p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(p.id)}
                disabled={deleteMutation.isPending}
                className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Nickname (e.g. Work laptop)"
            className="field flex-1"
          />
          <button
            onClick={() => addPasskeyMutation.mutate()}
            disabled={addPasskeyMutation.isPending}
            className="btn-primary"
          >
            {addPasskeyMutation.isPending ? "Adding..." : "Add a passkey"}
          </button>
        </div>
      </div>
    </div>
  );
};
