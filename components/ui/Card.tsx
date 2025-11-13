import { HTMLAttributes } from "react";

export const Card = ({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
    {...props}
  />
);

export const CardHeader = ({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`mb-3 flex items-center justify-between ${className}`} {...props} />
);

export const CardTitle = ({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-sm font-semibold text-zinc-900 dark:text-zinc-100 ${className}`} {...props} />
);

export const CardContent = ({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`text-sm text-zinc-600 dark:text-zinc-300 ${className}`} {...props} />
);

