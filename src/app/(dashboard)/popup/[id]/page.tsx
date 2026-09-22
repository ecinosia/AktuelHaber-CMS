"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Popup } from "@/types";
import { PopupForm } from "@/components/forms/PopupForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function EditPopupPage() {
  const { id } = useParams<{ id: string }>();
  const [popup, setPopup] = useState<Popup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.popup.list().then((all) => {
      setPopup(all.find((p) => p.id === id) ?? null);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageContainer><div className="h-10 rounded-lg bg-surface animate-pulse" /></PageContainer>;
  if (!popup) return <p className="text-down text-[13px]" style={{ fontFamily: "var(--font-public-sans)" }}>Pop-up bulunamadı.</p>;

  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/popup" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Pop-up</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">{popup.title}</h1>
      </div>
      <PopupForm popup={popup} />
    </PageContainer>
  );
}
