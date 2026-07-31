import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attachmentService } from "../services/attachment.service";

export const useAttachments = (ticketId: string | undefined) =>
  useQuery({
    queryKey: ["attachments", ticketId],
    queryFn: () => attachmentService.list(ticketId!),
    enabled: !!ticketId,
  });

export const useUploadAttachment = (ticketId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentService.upload(ticketId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });
};

export const useDeleteAttachment = (ticketId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: number) => attachmentService.remove(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", ticketId] });
    },
  });
};
