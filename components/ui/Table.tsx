import { HTMLAttributes, ReactNode } from "react";

export const Table = ({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) => (
  <table className={`w-full table-auto text-sm ${className}`} {...props} />
);

export const THead = ({ className = "", ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={`text-left text-zinc-500 dark:text-zinc-400 ${className}`} {...props} />
);

export const TBody = ({ className = "", ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={`text-zinc-800 dark:text-zinc-200 ${className}`} {...props} />
);

export const TR = ({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`border-b border-zinc-100 last:border-0 dark:border-zinc-900 ${className}`} {...props} />
);

export const TH = ({ className = "", ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <th className={`px-3 py-2 font-medium ${className}`} {...props} />
);

export const TD = ({ className = "", ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-3 py-2 ${className}`} {...props} />
);

export const EmptyState = ({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
    {icon}
    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</h4>
    {description && <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
  </div>
);

