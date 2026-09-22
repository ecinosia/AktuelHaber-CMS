"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { AdBanner } from "@/types";
import { AdsForm } from "@/components/forms/AdsForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function EditAdPage() {
  const { id } = useParams<{ id: string }>();
  const [banner, setBanner] = useState<AdBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.ads.adminList().then((all) => {
      setBanner(all.find((b) => b.id === id) ?? null);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageContainer><div className="h-10 rounded-lg bg-surface animate-pulse" /></PageContainer>;
  if (!banner) return <p className="text-down text-[13px]" style={{ fontFamily: "var(--font-public-sans)" }}>Reklam bulunamadı.</p>;

  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/ads" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Reklamlar</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">{banner.name}</h1>
      </div>
      <AdsForm banner={banner} />
    </PageContainer>
  );
}
