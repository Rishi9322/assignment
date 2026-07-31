export const VENDOR_TYPES = ["Fixed", "Temporary"] as const;
export type VendorType = (typeof VENDOR_TYPES)[number];

export interface CreateVendorInput {
  name: string;
  type: VendorType;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}
