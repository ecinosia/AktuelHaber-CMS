"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Article } from "@/types";
import { Button } from "@/components/ui/Button";

export default function ReviewQueuePage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  function reload() {
    return api.articles
      .reviewQueue()
      .then(setItems)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          setForbidden(true);
        } else {
          throw err;
        }
      });
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: string) {
    await api.articles.approve(id);
    await reload();
  }

  async function handleReject(id: string) {
    await api.articles.reject(id);
    await reload();
  }

  if (forbidden) {
    return <p className="text-black/60">Onay kuyruğunu görüntülemek için admin yetkisi gerekiyor.</p>;
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Onay Bekleyenler</h1>

      {loading ? (
        <p className="text-black/60">Yükleniyor...</p>
      ) : items.length === 0 ? (
        <p className="text-black/60">Onay bekleyen haber yok.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((article) => (
            <li key={article.id} className="flex items-center justify-between rounded border border-black/10 bg-white p-4">
              <div>
                <Link href={`/articles/${article.id}`} className="font-semibold hover:underline">
                  {article.title}
                </Link>
                <p className="text-sm text-black/50">
                  {article.author.firstName} {article.author.lastName} — {article.category.name}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={() => handleApprove(article.id)}>
                  Onayla
                </Button>
                <Button type="button" variant="danger" onClick={() => handleReject(article.id)}>
                  Reddet
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
