"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { publicUrlFor } from "@/lib/forms";
import type { Article } from "@/types";
import { ArticleForm } from "@/components/forms/ArticleForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.articles.byId(id).then(setArticle).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageContainer className="gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-surface animate-pulse" />)}
      </PageContainer>
    );
  }

  if (!article) {
    return (
      <div className="bg-down-bg border border-down/20 text-down rounded-lg px-5 py-4 text-[13px]" style={{ fontFamily: "var(--font-public-sans)" }}>
        Haber bulunamadı.
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/articles" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">
          Haberler
        </Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink line-clamp-1 flex-1">{article.title}</h1>
        <a
          href={publicUrlFor({ kind: "article", slug: article.slug, legacyPath: article.legacyPath })}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-[12.5px] font-bold font-archivo text-muted hover:text-primary transition-colors whitespace-nowrap"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Canlıda Gör
        </a>
      </div>
      <ArticleForm article={article} />
    </PageContainer>
  );
}
