import { useSettings } from "./useSettings";
import { STATUS_LABELS } from "../types/ticket";
import type { Priority, TicketStatus } from "../types/ticket";

// Merges admin-configured display-label overrides (System Settings) over the
// built-in defaults. The underlying status/priority values never change —
// only what's shown to the user.
export const useStatusLabel = () => {
  const { data: settings } = useSettings();
  return (status: TicketStatus) => settings?.status_labels[status] ?? STATUS_LABELS[status];
};

export const usePriorityLabel = () => {
  const { data: settings } = useSettings();
  return (priority: Priority) => settings?.priority_labels[priority] ?? priority;
};
