interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ page, pageSize, total, onPageChange }: Props) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-ink-secondary">
      <span>
        {start}–{end} of {total}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border border-line px-3 py-1 hover:bg-surface-alt disabled:opacity-40"
        >
          Previous
        </button>
        <span className="px-2 py-1">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md border border-line px-3 py-1 hover:bg-surface-alt disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};
