"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { publicUrlFor } from "@/lib/forms";
import type { Category } from "@/types";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories.list().then((cats) => {
      setCategory(cats.find((c) => c.id === id) ?? null);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageContainer><div className="h-10 rounded-lg bg-surface animate-pulse" /></PageContainer>;
  if (!category) return <p className="text-down text-[13px]" style={{ fontFamily: "var(--font-public-sans)" }}>Kategori bulunamadı.</p>;

  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/categories" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Kategoriler</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink flex-1">{category.name}</h1>
        <a
          href={publicUrlFor({ kind: "category", slug: category.slug })}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-[12.5px] font-bold font-archivo text-muted hover:text-primary transition-colors whitespace-nowrap"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Canlıda Gör
        </a>
      </div>
      <CategoryForm category={category} />
    </PageContainer>
  );
}
