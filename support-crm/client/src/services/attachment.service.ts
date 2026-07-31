import { api } from "./api";
import type { Attachment } from "../types/ticket";

export const attachmentService = {
  async list(ticketId: string) {
    const { data } = await api.get<Attachment[]>(`/attachments/ticket/${ticketId}`);
    return data;
  },

  async upload(ticketId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<Attachment>(`/attachments/ticket/${ticketId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async download(attachment: Attachment) {
    const { data } = await api.get(`/attachments/${attachment.id}/download`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  async remove(attachmentId: number) {
    await api.delete(`/attachments/${attachmentId}`);
  },
};
