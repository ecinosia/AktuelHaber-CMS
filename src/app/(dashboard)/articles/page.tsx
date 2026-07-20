"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Article, ArticleStatus, Author, Category } from "@/types";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT: "Taslak",
  PENDING_REVIEW: "Onay Bekliyor",
  SCHEDULED: "Zamanlanmış",
  PUBLISHED: "Yayında",
  ARCHIVED: "Arşivlendi",
};

export default function ArticlesPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories.list().then(setCategories);
    api.authors.list().then(setAuthors);
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .articles.adminList({
        status: (status || undefined) as ArticleStatus | undefined,
        categoryId: categoryId || undefined,
        authorId: authorId || undefined,
        pageSize: 50,
      })
      .then((result) => setItems(result.items))
      .finally(() => setLoading(false));
  }, [status, categoryId, authorId]);

  async function handleDelete(id: string) {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) {
      return;
    }
    await api.articles.remove(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Haberler</h1>
        <Link href="/articles/new">
          <Button type="button">Yeni Haber</Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-3">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-xs">
          <option value="">Tüm Durumlar</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="max-w-xs">
          <option value="">Tüm Kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={authorId} onChange={(e) => setAuthorId(e.target.value)} className="max-w-xs">
          <option value="">Tüm Yazarlar</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.firstName} {a.lastName}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p className="text-black/60">Yükleniyor...</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              <th className="py-2">Başlık</th>
              <th className="py-2">Kategori</th>
              <th className="py-2">Yazar</th>
              <th className="py-2">Durum</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((article) => (
              <tr key={article.id} className="border-b border-black/5">
                <td className="py-2">{article.title}</td>
                <td className="py-2 text-black/50">{article.category.name}</td>
                <td className="py-2 text-black/50">
                  {article.author.firstName} {article.author.lastName}
                </td>
                <td className="py-2 text-black/50">{STATUS_LABELS[article.status]}</td>
                <td className="py-2 text-right">
                  <Link href={`/articles/${article.id}`} className="mr-3 text-black/60 hover:text-black">
                    Düzenle
                  </Link>
                  <button type="button" onClick={() => handleDelete(article.id)} className="text-red-600">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
