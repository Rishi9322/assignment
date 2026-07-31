const COLORS = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
];

const colorFor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

interface Props {
  name: string;
  size?: "sm" | "md";
}

export const Avatar = ({ name, size = "sm" }: Props) => {
  const dimension = size === "sm" ? "h-5 w-5 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full font-medium ${dimension} ${colorFor(name)}`}
      title={name}
    >
      {initials(name)}
    </span>
  );
};
