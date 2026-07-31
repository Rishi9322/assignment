import { NextFunction, Request, Response } from "express";
import { settingsRepository } from "../repositories/settings.repository";

type SettingsRow = {
  orgName: string;
  supportEmail: string | null;
  accentColor: string;
  statusLabels: string;
  priorityLabels: string;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutMinutes: number;
  updatedAt: Date;
};

// Branding/labels are safe to expose to unauthenticated visitors (Login page
// needs them). Lockout thresholds are policy detail an anonymous caller
// shouldn't see, so they're only included in the admin-facing response.
const toPublicResponse = (s: SettingsRow) => ({
  org_name: s.orgName,
  support_email: s.supportEmail,
  accent_color: s.accentColor,
  status_labels: JSON.parse(s.statusLabels),
  priority_labels: JSON.parse(s.priorityLabels),
  updated_at: s.updatedAt,
});

const toAdminResponse = (s: SettingsRow) => ({
  ...toPublicResponse(s),
  session_timeout_minutes: s.sessionTimeoutMinutes,
  max_login_attempts: s.maxLoginAttempts,
  lockout_minutes: s.lockoutMinutes,
});

export const settingsController = {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsRepository.get();
      res.json(toPublicResponse(settings));
    } catch (err) {
      next(err);
    }
  },

  async getAdmin(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsRepository.get();
      res.json(toAdminResponse(settings));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const current = await settingsRepository.get();
      const currentStatusLabels = JSON.parse(current.statusLabels);
      const currentPriorityLabels = JSON.parse(current.priorityLabels);

      const settings = await settingsRepository.update({
        orgName: req.body.org_name,
        supportEmail: req.body.support_email,
        accentColor: req.body.accent_color,
        statusLabels: req.body.status_labels
          ? JSON.stringify({ ...currentStatusLabels, ...req.body.status_labels })
          : undefined,
        priorityLabels: req.body.priority_labels
          ? JSON.stringify({ ...currentPriorityLabels, ...req.body.priority_labels })
          : undefined,
        sessionTimeoutMinutes: req.body.session_timeout_minutes,
        maxLoginAttempts: req.body.max_login_attempts,
        lockoutMinutes: req.body.lockout_minutes,
      });
      res.json(toAdminResponse(settings));
    } catch (err) {
      next(err);
    }
  },
};
