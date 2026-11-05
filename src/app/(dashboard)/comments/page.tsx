"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { publicUrlFor } from "@/lib/forms";
import { DataTable } from "@/components/ui/DataTable";
import { usePersistedPageSize } from "@/lib/use-persisted-page-size";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Comment, CommentStatus } from "@/types";

const STATUS_TABS = [
  { label: "Tümü", value: "" },
  { label: "Bekleyen", value: "PENDING" },
  { label: "Onaylanan", value: "APPROVED" },
  { label: "Reddedilen", value: "REJECTED" },
  { label: "Spam", value: "SPAM" },
];

const STATUS_TR: Record<CommentStatus, string> = {
  PENDING: "Bekleyen",
  APPROVED: "Onaylanan",
  REJECTED: "Reddedilen",
  SPAM: "Spam",
};
const STATUS_BG: Record<CommentStatus, string> = {
  PENDING: "bg-pending-bg text-pending",
  APPROVED: "bg-up-bg text-up",
  REJECTED: "bg-surface-2 text-muted",
  SPAM: "bg-down-bg text-down",
};
const STATUS_ACTION = { APPROVED: "approve", REJECTED: "reject", SPAM: "markSpam" } as const;
type ModeratedStatus = keyof typeof STATUS_ACTION;

const TYPE_OPTIONS = [
  { label: "Tüm İçerikler", value: "" },
  { label: "Haber", value: "article" },
  { label: "Köşe Yazısı", value: "column" },
];

const SORT_OPTIONS = [
  { label: "Tarih (Yeniden Eskiye)", value: "date_desc" },
  { label: "Tarih (Eskiden Yeniye)", value: "date_asc" },
  { label: "Yazar (A-Z)", value: "author_asc" },
  { label: "Yazar (Z-A)", value: "author_desc" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const fieldCls = "px-3 py-1.5 border border-line-strong rounded-md text-[12px] text-body";

export default function CommentsPage() {
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [sort, setSort] = useState<SortValue>("date_desc");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize, sizeReady] = usePersistedPageSize("comments", 25);
  const [total, setTotal] = useState(0);
  const [reload, setReload] = useState(0);
  const change = <V,>(set: (v: V) => void) => (v: V) => { set(v); setPage(1); };

  // Filtered, sorted and paged on the server (like Haberler), so every comment is reachable - not only the newest 200.
  useEffect(() => {
    let current = true;
    if (!sizeReady) return;
    const [sortBy, sortDir] = sort.split("_") as ["date" | "author", "asc" | "desc"];
    const timer = setTimeout(() => {
      setLoading(true);
      api.comments
        .list({ page, pageSize, q, status: (tab || undefined) as CommentStatus | undefined, type: (type || undefined) as "article" | "column" | undefined, sortBy, sortDir })
        .then((r) => {
          if (!current) return;
          setItems(r.items);
          setTotal(r.total);
        })
        .catch(() => undefined)
        .finally(() => {
          if (current) setLoading(false);
        });
    }, q ? 300 : 0);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [page, pageSize, sizeReady, q, tab, type, sort, reload]);

  async function handleAction(id: string, action: (typeof STATUS_ACTION)[ModeratedStatus]) {
    await api.comments[action](id);
    setReload((n) => n + 1);
  }

  async function handleDelete(id: string) {
    await api.comments.remove(id);
    setItems((prev) => prev.filter((c) => c.id !== id));
    setReload((n) => n + 1);
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Yorumlar</h1>
      </div>

      <DataTable<Comment>
        filterBar={
          <>
            <select value={type} onChange={(e) => change(setType)(e.target.value)} className={fieldCls}>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => change(setSort)(e.target.value as SortValue)} className={fieldCls}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setType("");
                setSort("date_desc");
                setPage(1);
              }}
              className="ml-auto px-5 py-1.5 border border-line-strong bg-primary text-[12px] font-bold font-archivo text-white rounded-md hover:bg-primary-hover transition-colors"
            >
              Filtreyi Temizle
            </button>
          </>
        }
        columns={[
          {
            key: "authorName",
            label: "Yorum Yapan",
            sortable: false,
            render: (row) => <span className="text-[13px] font-bold font-archivo text-ink whitespace-nowrap">{row.authorName}</span>,
          },
          {
            key: "email",
            label: "E-posta",
            sortable: false,
            render: (row) => <span className="text-[12.5px] text-muted-2 whitespace-nowrap">{row.email ?? "—"}</span>,
          },
          {
            key: "content",
            label: "Yorum",
            sortable: false,
            width: "320px",
            render: (row) => <span className="text-[13px] text-body line-clamp-2">{row.content}</span>,
          },
          {
            key: "article",
            label: "İlgili İçerik",
            sortable: false,
            render: (row) => {
              const target = row.article
                ? { title: row.article.title, href: publicUrlFor({ kind: "article", ...row.article }) }
                : row.column
                  ? { title: row.column.title, href: publicUrlFor({ kind: "column", ...row.column }) }
                  : null;
              return target ? (
                <a href={target.href} target="_blank" rel="noreferrer" className="text-[12.5px] text-muted-2 hover:text-primary line-clamp-1">
                  {target.title}
                </a>
              ) : (
                "—"
              );
            },
          },
          {
            key: "createdAt",
            label: "Tarih",
            sortable: false,
            render: (row) => (
              <span className="text-[12px] text-muted whitespace-nowrap">
                {new Date(row.createdAt).toLocaleString("tr-TR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ),
          },
        ]}
        rows={items}
        searchPlaceholder="Yorum veya yazar ara..."
        onSearchChange={(v) => { setQ(v); setPage(1); }}
        statusTabs={STATUS_TABS}
        server={{ total, page, pageSize, activeTab: tab, onTabChange: change(setTab), onPageChange: setPage, onPageSizeChange: (n) => { setPageSize(n); setPage(1); } }}
        loading={loading}
        emptyText="Yorum bulunamadı."
        onDelete={handleDelete}
        statusLabel={(status, row) =>
          status === "PENDING" ? (
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-bold font-archivo px-2.5 py-1 rounded-full ${STATUS_BG.PENDING}`}>{STATUS_TR.PENDING}</span>
              <button type="button" onClick={() => handleAction(row.id, "approve")} className="text-[11px] font-bold font-archivo text-white bg-up px-2.5 py-1 rounded cursor-pointer">
                Onayla
              </button>
              <button type="button" onClick={() => handleAction(row.id, "reject")} className="text-[11px] font-bold font-archivo text-down bg-surface border border-down px-2.5 py-1 rounded cursor-pointer">
                Reddet
              </button>
              <button type="button" onClick={() => handleAction(row.id, "markSpam")} className="text-[11px] font-bold font-archivo text-muted bg-surface border border-line-head px-2.5 py-1 rounded cursor-pointer hover:bg-surface-2">
                Spam
              </button>
            </div>
          ) : (
            <select
              value={status}
              onChange={(e) => handleAction(row.id, STATUS_ACTION[e.target.value as ModeratedStatus])}
              className={`text-[11px] font-bold font-archivo px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_BG[status as CommentStatus]}`}
            >
              {(Object.keys(STATUS_ACTION) as ModeratedStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_TR[s]}</option>
              ))}
            </select>
          )
        }
      />
    </PageContainer>
  );
}
