import { NextFunction, Request, Response } from "express";
import { userRepository } from "../repositories/user.repository";
import { teamRepository } from "../repositories/team.repository";
import { prisma } from "../config/prisma";
import { ApiError } from "../middleware/errorHandler";
import { computeTeamWorkload } from "../utils/queuePressure";

const userSelect = { id: true, name: true, email: true } as const;

const serializeUser = (u: { id: number; name: string; email: string } | null | undefined) =>
  u ? { id: u.id, name: u.name, email: u.email } : null;

export const adminController = {
  async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userRepository.listAllForAdmin();
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetId = Number(req.params.id);
      if (targetId === req.user!.sub) {
        throw new ApiError(400, "You can't change your own role or active status");
      }
      const user = await userRepository.update(targetId, req.body);
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        active: user.active,
      });
    } catch (err) {
      next(err);
    }
  },

  async unlockUser(req: Request, res: Response, next: NextFunction) {
    try {
      await userRepository.clearLockout(Number(req.params.id));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  async teamWorkload(_req: Request, res: Response, next: NextFunction) {
    try {
      const [activeTeams, tickets] = await Promise.all([
        teamRepository.listActive(),
        prisma.ticket.findMany({
          where: { team: { not: null } },
          select: {
            team: true,
            status: true,
            priority: true,
            createdAt: true,
            dueAt: true,
            resolvedAt: true,
            reopenCount: true,
            assignedToUserId: true,
            vendorId: true,
          },
        }),
      ]);

      const workloads = activeTeams.map((team) =>
        computeTeamWorkload(
          team.name,
          tickets.filter((t) => t.team === team.name)
        )
      );

      res.json(workloads);
    } catch (err) {
      next(err);
    }
  },

  async listTeamDirectory(_req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await teamRepository.listAll();
      res.json(teams.map((t) => ({ id: t.id, name: t.name, archived: t.archived, created_at: t.createdAt })));
    } catch (err) {
      next(err);
    }
  },

  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await teamRepository.findByName(req.body.name);
      if (existing) {
        throw new ApiError(409, "A team with this name already exists");
      }
      const team = await teamRepository.create(req.body.name);
      res.status(201).json({ id: team.id, name: team.name, archived: team.archived, created_at: team.createdAt });
    } catch (err) {
      next(err);
    }
  },

  async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamRepository.update(Number(req.params.id), req.body);
      res.json({ id: team.id, name: team.name, archived: team.archived, created_at: team.createdAt });
    } catch (err) {
      next(err);
    }
  },

  async auditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(Number(req.query.limit) || 100, 500);
      const events = await prisma.ticketEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          actor: { select: userSelect },
          ticket: { select: { ticketId: true, subject: true } },
        },
      });
      res.json(
        events.map((e) => ({
          id: e.id,
          type: e.type,
          from: e.fromValue,
          to: e.toValue,
          message: e.message,
          actor: serializeUser(e.actor),
          ticket: { ticket_id: e.ticket.ticketId, subject: e.ticket.subject },
          created_at: e.createdAt,
        }))
      );
    } catch (err) {
      next(err);
    }
  },
};
