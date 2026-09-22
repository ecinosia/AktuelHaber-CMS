"use client";

import { useRouter } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { api } from "@/lib/api";
import type { Session } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Yönetici",
  editor: "Editör",
  author: "Yazar",
};

export function Topbar({ session, onMenuClick }: { session: Session; onMenuClick: () => void }) {
  const router = useRouter();

  async function handleLogout() {
    await api.auth.logout().catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  const roleLabel = ROLE_LABELS[session.role] ?? session.role;
  const initials = session.email.slice(0, 2).toUpperCase();

  return (
    <header className="fixed top-0 left-0 lg:left-60 right-0 h-16 bg-surface border-b border-line flex items-center justify-between gap-3 px-4 sm:px-7 z-10">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-md border border-line-strong text-body hover:bg-surface-2 transition-colors cursor-pointer"
          aria-label="Menüyü aç/kapat"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Search */}
        <div className="relative flex-1 min-w-0 lg:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
          <input
            type="text"
            placeholder="Panelde ara..."
            className="w-full lg:w-80 pl-9 pr-3 py-2 border border-line-strong rounded-md text-[13px] text-ink placeholder-muted-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors bg-surface"
            style={{ fontFamily: "var(--font-public-sans)" }}
          />
        </div>
      </div>

      {/* User info + logout */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-9 w-9 rounded-full bg-surface-3 flex items-center justify-center text-[12px] font-extrabold font-archivo text-muted shrink-0">
          {initials}
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[13px] font-bold font-archivo text-ink truncate max-w-[90px] sm:max-w-[160px]">{session.email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-[11px] text-muted hover:text-primary transition-colors text-left cursor-pointer"
          >
            Çıkış Yap · {roleLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
