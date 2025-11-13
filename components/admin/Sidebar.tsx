"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, type NavItem } from "@/lib/nav";
import { memo, useMemo } from "react";

type SidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const SidebarComponent = ({ collapsed = false, onNavigate }: SidebarProps) => {
  const pathname = usePathname();

  const items = useMemo<NavItem[]>(() => navItems, []);

  return (
    <aside
      className={classNames(
        "h-dvh border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950",
        collapsed ? "w-16" : "w-64"
      )}
      aria-label="Sidebar Navigation"
    >
      <div className="flex h-16 items-center gap-2 px-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="h-8 w-8 rounded-md bg-black dark:bg-zinc-50" />
        {!collapsed && (
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Admin Panel
          </span>
        )}
      </div>
      <nav className="px-2 py-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={classNames(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-zinc-200 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {item.label.substring(0, 2).toUpperCase()}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export const Sidebar = memo(SidebarComponent);

