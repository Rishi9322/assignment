import { NextFunction, Request, Response } from "express";
import { slaRuleRepository } from "../repositories/slaRule.repository";
import { ApiError } from "../middleware/errorHandler";
import { PRIORITIES, Priority } from "../types/ticket";
import { DEFAULT_SLA_HOURS_BY_PRIORITY } from "../utils/sla";

const toResponse = (r: { priority: string; hours: number; updatedAt: Date }) => ({
  priority: r.priority,
  hours: r.hours,
  updated_at: r.updatedAt,
});

export const slaRuleController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const rules = await slaRuleRepository.listAll();
      const byPriority = new Map(rules.map((r) => [r.priority, r]));
      // Always return one row per known priority, even if a rule hasn't been
      // saved yet — the admin UI shouldn't have to special-case a missing row.
      const merged = PRIORITIES.map((priority) => {
        const existing = byPriority.get(priority);
        return existing
          ? toResponse(existing)
          : { priority, hours: DEFAULT_SLA_HOURS_BY_PRIORITY[priority], updated_at: null };
      });
      res.json(merged);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const priority = req.params.priority as Priority;
      if (!PRIORITIES.includes(priority)) {
        throw new ApiError(400, `Unknown priority "${req.params.priority}"`);
      }
      const rule = await slaRuleRepository.upsertByPriority(priority, req.body.hours);
      res.json(toResponse(rule));
    } catch (err) {
      next(err);
    }
  },
};
