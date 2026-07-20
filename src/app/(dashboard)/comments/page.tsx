"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Comment, CommentStatus } from "@/types";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const STATUS_LABELS: Record<CommentStatus, string> = {
  PENDING: "Bekliyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
  SPAM: "Spam",
};

export default function CommentsPage() {
  const [items, setItems] = useState<Comment[]>([]);
  const [status, setStatus] = useState<CommentStatus | "">("PENDING");
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.comments.list({ status: status || undefined, pageSize: 100 }).then((result) => setItems(result.items));
  }

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [status]);

  async function handleAction(id: string, action: "approve" | "reject" | "markSpam") {
    await api.comments[action](id);
    await reload();
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Yorumlar</h1>

      <Select value={status} onChange={(e) => setStatus(e.target.value as CommentStatus | "")} className="mb-4 max-w-xs">
        <option value="">Tüm Durumlar</option>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      {loading ? (
        <p className="text-black/60">Yükleniyor...</p>
      ) : items.length === 0 ? (
        <p className="text-black/60">Yorum bulunamadı.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((comment) => (
            <li key={comment.id} className="rounded border border-black/10 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold">{comment.authorName}</span>
                  {comment.article && <span className="ml-2 text-xs text-black/40">{comment.article.title}</span>}
                </div>
                <span className="rounded bg-black/5 px-2 py-0.5 text-xs">{STATUS_LABELS[comment.status]}</span>
              </div>
              <p className="mb-3 text-sm text-black/70">{comment.content}</p>
              <div className="flex gap-2">
                <Button type="button" onClick={() => handleAction(comment.id, "approve")}>
                  Onayla
                </Button>
                <Button type="button" variant="secondary" onClick={() => handleAction(comment.id, "reject")}>
                  Reddet
                </Button>
                <Button type="button" variant="danger" onClick={() => handleAction(comment.id, "markSpam")}>
                  Spam
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
