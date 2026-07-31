import { api } from "./api";
import type { CreateVendorPayload, Vendor } from "../types/vendor";

export const vendorService = {
  async list() {
    const { data } = await api.get<Vendor[]>("/vendors");
    return data;
  },

  async create(payload: CreateVendorPayload) {
    const { data } = await api.post<Vendor>("/vendors", payload);
    return data;
  },
};
