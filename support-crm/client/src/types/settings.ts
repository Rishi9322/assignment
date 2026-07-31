export interface Settings {
  org_name: string;
  support_email: string | null;
  accent_color: string;
  status_labels: Record<string, string>;
  priority_labels: Record<string, string>;
  updated_at: string;
}

export interface AdminSettings extends Settings {
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_minutes: number;
}

export interface UpdateSettingsPayload {
  org_name?: string;
  support_email?: string | null;
  accent_color?: string;
  status_labels?: Record<string, string>;
  priority_labels?: Record<string, string>;
  session_timeout_minutes?: number;
  max_login_attempts?: number;
  lockout_minutes?: number;
}
