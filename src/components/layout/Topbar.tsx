"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Session } from "@/types";

export function Topbar({ session }: { session: Session }) {
  const router = useRouter();

  async function handleLogout() {
    await api.auth.logout().catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-3">
      <div className="text-sm text-black/60">
        {session.email} <span className="ml-2 rounded bg-black/5 px-2 py-0.5 text-xs">{session.role}</span>
      </div>
      <button type="button" onClick={handleLogout} className="text-sm text-black/60 hover:text-black">
        Çıkış Yap
      </button>
    </header>
  );
}
