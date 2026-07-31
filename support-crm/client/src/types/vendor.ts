export const VENDOR_TYPES = ["Fixed", "Temporary"] as const;
export type VendorType = (typeof VENDOR_TYPES)[number];

export interface VendorReliability {
  tickets_handled: number;
  tickets_resolved: number;
  avg_resolution_hours: number | null;
  reopen_rate: number | null;
  score: number | null;
}

export interface Vendor {
  id: number;
  name: string;
  type: VendorType;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  reliability?: VendorReliability;
}

export interface CreateVendorPayload {
  name: string;
  type: VendorType;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}
