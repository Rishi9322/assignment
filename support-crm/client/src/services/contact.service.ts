import { api } from "./api";
import type { Contact, ContactDetail, UpdateContactPayload } from "../types/contact";

export const contactService = {
  async list() {
    const { data } = await api.get<Contact[]>("/contacts");
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<ContactDetail>(`/contacts/${id}`);
    return data;
  },

  async update(id: number, payload: UpdateContactPayload) {
    const { data } = await api.patch<Contact>(`/contacts/${id}`, payload);
    return data;
  },
};
