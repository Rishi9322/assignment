import type { Priority } from "../types/ticket";

const COLORS: Record<Priority, string> = {
  Low: "bg-gray-100 text-gray-700 dark:bg-gray-400/15 dark:text-gray-300",
  Medium: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300",
  High: "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300",
  Urgent: "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300",
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[priority]}`}
  >
    {priority}
  </span>
);
