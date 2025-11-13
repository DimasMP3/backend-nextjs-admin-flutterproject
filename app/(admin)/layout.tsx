"use client";
import { PropsWithChildren, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

export default function AdminLayout({ children }: PropsWithChildren) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh w-full bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <Sidebar collapsed={collapsed} onNavigate={() => setCollapsed(false)} />
      <div className="flex min-h-dvh flex-1 flex-col">
        <Topbar onToggleSidebar={() => setCollapsed((v) => !v)} />
        <main className="mx-auto w-full max-w-screen-2xl flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

