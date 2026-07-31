import type { Priority } from "./ticket";

export interface SlaRule {
  priority: Priority;
  hours: number;
  updated_at: string | null;
}
