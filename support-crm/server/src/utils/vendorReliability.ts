interface VendorTicket {
  status: string;
  createdAt: Date;
  resolvedAt: Date | null;
  reopenCount: number;
}

export interface VendorReliability {
  tickets_handled: number;
  tickets_resolved: number;
  avg_resolution_hours: number | null;
  reopen_rate: number | null;
  score: number | null;
}

// Deterministic, not a fake "AI" prediction: a weighted blend of how fast this
// vendor resolves tickets currently assigned to it, and how often those
// resolutions get reopened. Undercounts history for tickets later reassigned
// away from the vendor, since only the current vendorId link is available.
export const computeVendorReliability = (tickets: VendorTicket[]): VendorReliability => {
  const resolved = tickets.filter((t) => t.resolvedAt);
  const ticketsHandled = tickets.length;
  const ticketsResolved = resolved.length;

  if (ticketsResolved === 0) {
    return {
      tickets_handled: ticketsHandled,
      tickets_resolved: 0,
      avg_resolution_hours: null,
      reopen_rate: null,
      score: null,
    };
  }

  const totalResolutionHours = resolved.reduce(
    (sum, t) => sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (60 * 60 * 1000),
    0
  );
  const avgResolutionHours = totalResolutionHours / ticketsResolved;

  const reopened = resolved.filter((t) => t.reopenCount > 0).length;
  const reopenRate = reopened / ticketsResolved;

  const RESOLUTION_BENCHMARK_HOURS = 48;
  const resolutionScore = Math.max(0, 100 - (avgResolutionHours / RESOLUTION_BENCHMARK_HOURS) * 100);
  const reopenScore = Math.max(0, 100 - reopenRate * 200);
  const score = Math.round(0.6 * resolutionScore + 0.4 * reopenScore);

  return {
    tickets_handled: ticketsHandled,
    tickets_resolved: ticketsResolved,
    avg_resolution_hours: Math.round(avgResolutionHours * 10) / 10,
    reopen_rate: Math.round(reopenRate * 1000) / 1000,
    score,
  };
};
