import { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "error";
};

const styles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export const Badge = ({ className = "", variant = "default", ...props }: BadgeProps) => (
  <span
    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}
    {...props}
  />
);

