"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { StaticPage } from "@/types";
import { StaticPageForm } from "@/components/forms/StaticPageForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function EditStaticPage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.pages.list().then((all) => {
      setPage(all.find((p) => p.id === id) ?? null);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageContainer><div className="h-10 rounded-lg bg-surface animate-pulse" /></PageContainer>;
  if (!page) return <p className="text-down text-[13px]" style={{ fontFamily: "var(--font-public-sans)" }}>Sayfa bulunamadı.</p>;

  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/pages" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Sabit Sayfalar</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">Sayfayı Düzenle</h1>
      </div>
      <StaticPageForm page={page} />
    </PageContainer>
  );
}
