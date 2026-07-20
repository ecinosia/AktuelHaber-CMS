"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Article } from "@/types";
import { ArticleForm } from "@/components/forms/ArticleForm";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .articles.byId(id)
      .then(setArticle)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-black/60">Yükleniyor...</p>;
  }
  if (!article) {
    return <p className="text-red-600">Haber bulunamadı.</p>;
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Haberi Düzenle</h1>
      <ArticleForm article={article} />
    </main>
  );
}
