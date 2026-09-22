"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Menu, MenuItem } from "@/types";
import { MenuForm } from "@/components/forms/MenuForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function EditMenuPage() {
  const { id } = useParams<{ id: string }>();
  const [menu, setMenu] = useState<(Menu & { items: MenuItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.menu.get(id).then(setMenu).catch((e) => setError(e instanceof Error ? e.message : "Menü yüklenemedi.")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageContainer><div className="h-10 rounded-lg bg-surface animate-pulse" /></PageContainer>;
  if (!menu) return <p className="text-down text-[13px]" style={{ fontFamily: "var(--font-public-sans)" }}>{error ?? "Menü bulunamadı."}</p>;

  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/menu" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Menüler</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">{menu.name}</h1>
      </div>
      <MenuForm menu={menu} />
    </PageContainer>
  );
}
