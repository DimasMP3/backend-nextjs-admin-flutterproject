"use client";
import { memo, useState } from "react";

type TopbarProps = {
  onToggleSidebar?: () => void;
  title?: string;
};

const TopbarComponent = ({ onToggleSidebar, title = "Dashboard" }: TopbarProps) => {
  const [, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-10 h-16 w-full border-b border-zinc-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M3.75 6.75A.75.75 0 014.5 6h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm.75 4.5a.75.75 0 000 1.5h8.25a.75.75 0 000-1.5H4.5z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search…"
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-56 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            type="button"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              A
            </span>
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export const Topbar = memo(TopbarComponent);
