import { api } from "./api";
import type {
  CreateTicketPayload,
  Priority,
  Stats,
  Team,
  TicketDetail,
  TicketStatus,
  TicketSummary,
  TrendPoint,
} from "../types/ticket";

export const ticketService = {
  async list(params: { status?: TicketStatus; search?: string; team?: Team }) {
    const { data } = await api.get<TicketSummary[]>("/tickets", { params });
    return data;
  },

  async getById(ticketId: string) {
    const { data } = await api.get<TicketDetail>(`/tickets/${ticketId}`);
    return data;
  },

  async create(payload: CreateTicketPayload) {
    const { data } = await api.post<{ ticket_id: string; created_at: string }>(
      "/tickets",
      payload
    );
    return data;
  },

  async updateStatus(ticketId: string, status: TicketStatus, notes?: string) {
    const { data } = await api.put(`/tickets/${ticketId}`, { status, notes });
    return data;
  },

  async updatePriority(ticketId: string, priority: Priority) {
    const { data } = await api.put(`/tickets/${ticketId}`, { priority });
    return data;
  },

  async addNote(ticketId: string, notes: string) {
    const { data } = await api.put(`/tickets/${ticketId}`, { notes });
    return data;
  },

  async updateNextAction(ticketId: string, nextAction: string | null) {
    const { data } = await api.put(`/tickets/${ticketId}`, { next_action: nextAction });
    return data;
  },

  async assign(
    ticketId: string,
    params: { team?: Team | null; assigned_to_user_id?: number | null; vendor_id?: number | null }
  ) {
    const { data } = await api.put(`/tickets/${ticketId}`, params);
    return data;
  },

  async teams() {
    const { data } = await api.get<Team[]>("/teams");
    return data;
  },

  async stats() {
    const { data } = await api.get<Stats>("/stats");
    return data;
  },

  async trend() {
    const { data } = await api.get<TrendPoint[]>("/stats/trend");
    return data;
  },
};
