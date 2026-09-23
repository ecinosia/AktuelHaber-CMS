"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Article, Column } from "@/types";

type QueueItem = {
  id: string;
  kind: "article" | "column";
  title: string;
  href: string;
  meta: string;
  spot: string | null;
  coverImageUrl: string | null;
};

const fromArticle = (a: Article): QueueItem => ({
  id: a.id,
  kind: "article",
  title: a.title,
  href: `/articles/${a.id}`,
  meta: `${a.author.firstName} ${a.author.lastName} · ${a.category.name} · ${new Date(a.createdAt).toLocaleDateString("tr-TR")}`,
  spot: a.spot,
  coverImageUrl: a.coverImageUrl,
});

const fromColumn = (c: Column): QueueItem => ({
  id: c.id,
  kind: "column",
  title: c.title,
  href: `/columns/${c.id}`,
  meta: `${c.author.firstName} ${c.author.lastName} · Köşe yazısı · ${new Date(c.createdAt).toLocaleDateString("tr-TR")}`,
  spot: c.spot,
  coverImageUrl: c.coverImageUrl,
});

export default function ReviewQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  function reload() {
    return Promise.all([api.articles.reviewQueue(), api.columns.reviewQueue()])
      .then(([articles, columns]) => setItems([...articles.map(fromArticle), ...columns.map(fromColumn)]))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) setForbidden(true);
        else throw err;
      });
  }

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  async function handleApprove(item: QueueItem) {
    await (item.kind === "article" ? api.articles.approve(item.id) : api.columns.approve(item.id));
    await reload();
  }

  async function handleReject(item: QueueItem) {
    await (item.kind === "article" ? api.articles.reject(item.id) : api.columns.reject(item.id));
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
            Onay bekleyen haber veya köşe yazısı yok.
          </div>
        ) : (
          <ul className="divide-y divide-line-soft">
            {items.map((item) => (
              <li key={`${item.kind}-${item.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-page transition-colors">
                {item.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverImageUrl} alt="" className="h-14 w-20 object-cover rounded shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <Link href={item.href} className="text-[13.5px] font-bold font-archivo text-ink hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </Link>
                  <p className="text-[12px] text-muted-2 mt-0.5" style={{ fontFamily: "var(--font-public-sans)" }}>
                    {item.meta}
                  </p>
                  {item.spot && (
                    <p className="text-[12px] text-muted mt-1 line-clamp-1" style={{ fontFamily: "var(--font-public-sans)" }}>{item.spot}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApprove(item)}
                    className="text-[11.5px] font-bold font-archivo text-white bg-up px-3 py-1.5 rounded cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(item)}
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
