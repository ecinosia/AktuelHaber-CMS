"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Article } from "@/types";

export default function ReviewQueuePage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  function reload() {
    return api.articles.reviewQueue().then(setItems).catch((err) => {
      if (err instanceof ApiError && err.status === 403) setForbidden(true);
      else throw err;
    });
  }

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  async function handleApprove(id: string) {
    await api.articles.approve(id);
    await reload();
  }

  async function handleReject(id: string) {
    await api.articles.reject(id);
    await reload();
  }

  if (forbidden) {
    return (
      <PageContainer>
        <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Onay Bekleyenler</h1>
        <div className="bg-surface border border-line rounded-lg px-5 py-12 text-center text-[13px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
          Onay kuyruğunu görüntülemek için admin yetkisi gerekiyor.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Onay Bekleyenler</h1>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="divide-y divide-line-soft">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4">
                <div className="h-4 w-2/3 rounded bg-surface-3 animate-pulse mb-2" />
                <div className="h-3 w-1/3 rounded bg-surface-3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
            Onay bekleyen haber yok.
          </div>
        ) : (
          <ul className="divide-y divide-line-soft">
            {items.map((article) => (
              <li key={article.id} className="flex items-center gap-4 px-5 py-4 hover:bg-page transition-colors">
                {article.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImageUrl} alt="" className="h-14 w-20 object-cover rounded shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/articles/${article.id}`} className="text-[13.5px] font-bold font-archivo text-ink hover:text-primary transition-colors line-clamp-1">
                    {article.title}
                  </Link>
                  <p className="text-[12px] text-muted-2 mt-0.5" style={{ fontFamily: "var(--font-public-sans)" }}>
                    {article.author.firstName} {article.author.lastName} · {article.category.name} · {new Date(article.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                  {article.spot && (
                    <p className="text-[12px] text-muted mt-1 line-clamp-1" style={{ fontFamily: "var(--font-public-sans)" }}>{article.spot}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApprove(article.id)}
                    className="text-[11.5px] font-bold font-archivo text-white bg-up px-3 py-1.5 rounded cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(article.id)}
                    className="text-[11.5px] font-bold font-archivo text-down bg-surface border border-down px-3 py-1.5 rounded cursor-pointer hover:bg-down-bg transition-colors"
                  >
                    Reddet
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}
