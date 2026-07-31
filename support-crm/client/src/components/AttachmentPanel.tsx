import { useRef } from "react";
import { useAttachments, useDeleteAttachment, useUploadAttachment } from "../hooks/useAttachments";
import { attachmentService } from "../services/attachment.service";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./Toast";
import { Loader } from "./Loader";
import type { Attachment } from "../types/ticket";

const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024;

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AttachmentPanel = ({ ticketId }: { ticketId: string }) => {
  const { data: attachments, isLoading } = useAttachments(ticketId);
  const uploadMutation = useUploadAttachment(ticketId);
  const deleteMutation = useDeleteAttachment(ticketId);
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_SIZE) {
      showToast("File exceeds the 15MB upload limit", "error");
      return;
    }
    uploadMutation.mutate(file, {
      onSuccess: () => showToast("File attached"),
      onError: (err: any) => showToast(err?.response?.data?.error ?? "Upload failed", "error"),
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      await attachmentService.download(attachment);
    } catch {
      showToast("Download failed", "error");
    }
  };

  const handleDelete = (attachment: Attachment) => {
    if (!window.confirm(`Remove "${attachment.file_name}"?`)) return;
    deleteMutation.mutate(attachment.id, {
      onSuccess: () => showToast("Attachment removed"),
      onError: (err: any) => showToast(err?.response?.data?.error ?? "Failed to remove", "error"),
    });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Attachments</h2>
        <label className="cursor-pointer rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-alt">
          {uploadMutation.isPending ? "Uploading..." : "Upload file"}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            disabled={uploadMutation.isPending}
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />
        </label>
      </div>

      <div className="mt-3">
        {isLoading && <Loader />}
        {attachments && attachments.length === 0 && (
          <p className="text-sm text-ink-secondary">No files attached yet.</p>
        )}
        {attachments && attachments.length > 0 && (
          <ul className="divide-y divide-line">
            {attachments.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <button
                  onClick={() => handleDownload(a)}
                  className="min-w-0 flex-1 truncate text-left text-accent hover:underline"
                  title={a.file_name}
                >
                  {a.file_name}
                </button>
                <span className="shrink-0 text-xs text-ink-muted">{formatSize(a.size)}</span>
                <span className="shrink-0 text-xs text-ink-muted">{a.uploaded_by.name}</span>
                {(a.uploaded_by.id === user?.id || user?.role === "Admin") && (
                  <button
                    onClick={() => handleDelete(a)}
                    disabled={deleteMutation.isPending}
                    className="shrink-0 text-xs font-medium text-danger hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
