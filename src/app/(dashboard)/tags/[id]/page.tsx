"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Tag } from "@/types";
import { TagForm } from "@/components/forms/TagForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function EditTagPage() {
  const { id } = useParams<{ id: string }>();
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tags.byId(id).then(setTag).catch(() => setTag(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageContainer><div className="h-10 rounded-lg bg-surface animate-pulse" /></PageContainer>;
  if (!tag) return <p className="text-down text-[13px]" style={{ fontFamily: "var(--font-public-sans)" }}>Etiket bulunamadı.</p>;

  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/tags" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Etiketler</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">{tag.name}</h1>
      </div>
      <TagForm tag={tag} />
    </PageContainer>
  );
}
