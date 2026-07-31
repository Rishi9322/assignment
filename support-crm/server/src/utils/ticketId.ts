export const formatTicketId = (sequence: number): string => `TKT-${String(sequence).padStart(3, "0")}`;
