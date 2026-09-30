"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { canAccess, homePath } from "@/lib/access";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ConfirmProvider } from "@/components/providers/ConfirmProvider";
import type { Session } from "@/types";

export function DashboardShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const allowed = canAccess(session.role, pathname);

  useEffect(() => {
    if (!allowed) router.replace(homePath(session.role));
  }, [allowed, router, session.role]);

  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-page">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={session.role} />
        <Topbar
          session={session}
          onMenuClick={() => setSidebarOpen((v) => !v)}
        />
        <main className="lg:ml-60 pt-16 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 py-7 pb-16">{allowed ? children : null}</div>
        </main>
      </div>
    </ConfirmProvider>
  );
}
