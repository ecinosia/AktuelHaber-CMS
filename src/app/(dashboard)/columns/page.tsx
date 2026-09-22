"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { publicUrlFor } from "@/lib/forms";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Column, ArticleStatus, Author } from "@/types";

const STATUS_TABS = [
  { label: "Tümü", value: "" },
  { label: "Yayında", value: "PUBLISHED" },
  { label: "Taslak", value: "DRAFT" },
  { label: "Onay Bekliyor", value: "PENDING_REVIEW" },
  { label: "Zamanlanmış", value: "SCHEDULED" },
];

const STATUS_TR: Record<ArticleStatus, string> = {
  DRAFT: "Taslak", PENDING_REVIEW: "Onay Bekliyor", SCHEDULED: "Zamanlanmış", PUBLISHED: "Yayında", ARCHIVED: "Arşivlendi",
};
const STATUS_BG: Record<ArticleStatus, string> = {
  DRAFT: "bg-surface-2 text-muted", PENDING_REVIEW: "bg-pending-bg text-pending",
  SCHEDULED: "bg-blue-100 text-blue-700", PUBLISHED: "bg-up-bg text-up", ARCHIVED: "bg-surface-2 text-muted",
};

const SORT_OPTIONS = [
  { label: "Tarih (Yeniden Eskiye)", value: "date_desc" },
  { label: "Tarih (Eskiden Yeniye)", value: "date_asc" },
  { label: "Başlık (A-Z)", value: "title_asc" },
  { label: "Başlık (Z-A)", value: "title_desc" },
  { label: "Okunma (Çoktan Aza)", value: "views_desc" },
  { label: "Okunma (Azdan Çoğa)", value: "views_asc" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

type ColumnRow = Column & { id: string; status: string };

export default function ColumnsPage() {
  const [items, setItems] = useState<ColumnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorId, setAuthorId] = useState("");
  const [sort, setSort] = useState<SortValue>("date_desc");

  useEffect(() => {
    api.columns.adminList({ pageSize: 200 }).then((r) => {
      setItems(r.items as ColumnRow[]);
    }).finally(() => setLoading(false));
    api.authors.list().then(setAuthors);
  }, []);

  async function handleDelete(id: string) {
    await api.columns.remove(id);
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleStatusChange(id: string, next: ArticleStatus) {
    const prev = items.find((c) => c.id === id)?.status;
    setItems((all) => all.map((c) => (c.id === id ? { ...c, status: next } : c)));
    try {
      await api.columns.update(id, { status: next });
    } catch {
      setItems((all) => all.map((c) => (c.id === id ? { ...c, status: prev ?? c.status } : c)));
    }
  }

  const time = (c: ColumnRow) => new Date(c.publishedAt ?? c.createdAt).getTime();
  const filtered = items
    .filter((c) => !authorId || c.authorId === authorId)
    .sort((a, b) => {
      switch (sort) {
        case "title_asc": return a.title.localeCompare(b.title, "tr");
        case "title_desc": return b.title.localeCompare(a.title, "tr");
        case "views_asc": return a.viewCount - b.viewCount;
        case "views_desc": return b.viewCount - a.viewCount;
        case "date_asc": return time(a) - time(b);
        default: return time(b) - time(a);
      }
    });

  const selectCls = "px-3 py-1.5 border border-line-strong rounded-md text-[12px] text-body";

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Köşe Yazıları</h1>
      </div>

      <DataTable<ColumnRow>
        filterBar={
          <>
            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} className={selectCls}>
              <option value="">Tüm Yazarlar</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortValue)} className={selectCls}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => { setAuthorId(""); setSort("date_desc"); }}
              className="ml-auto px-5 py-1.5 border border-line-strong bg-primary text-[12px] font-bold font-archivo text-white rounded-md hover:bg-primary-hover transition-colors"
            >
              Filtreyi Temizle
            </button>
          </>
        }
        columns={[
          {
            key: "title",
            label: "Başlık",
            sortable: false,
            render: (row) => (
              <div>
                <Link href={`/columns/${row.id}`} className="text-[13px] font-bold font-archivo text-ink hover:text-primary line-clamp-1">
                  {row.title}
                </Link>
              </div>
            ),
          },
          {
            key: "author",
            label: "Yazar",
            sortable: false,
            render: (row) => (
              <span className="text-[13px] text-muted" style={{ fontFamily: "var(--font-public-sans)" }}>
                {row.author.firstName} {row.author.lastName}
              </span>
            ),
          },
          {
            key: "createdAt",
            label: "Tarih",
            sortable: false,
            render: (row) => (
              <span className="text-[12px] text-muted whitespace-nowrap" style={{ fontFamily: "var(--font-public-sans)" }}>
                {new Date(row.publishedAt ?? row.createdAt).toLocaleString("tr-TR", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            ),
          },
        ]}
        rows={filtered}
        addHref="/columns/new"
        addLabel="Yazı Ekle"
        searchPlaceholder="Yazı başlığı ara..."
        statusTabs={STATUS_TABS}
        showThumbnail
        thumbnailKey="coverImageUrl"
        loading={loading}
        emptyText="Henüz köşe yazısı eklenmemiş."
        editHref={(row) => `/columns/${row.id}`}
        viewHref={(row) => publicUrlFor({ kind: "column", slug: row.slug, legacyPath: row.legacyPath, author: { slug: row.author.slug } })}
        onDelete={handleDelete}
        deleteHint="Kalıcı silmek yerine durumu “Arşivlendi” yaparak geri alınabilir şekilde kaldırabilirsiniz."
        statusLabel={(status, row) => (
          <select
            value={status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleStatusChange(row.id, e.target.value as ArticleStatus)}
            className={`text-[11px] font-bold font-archivo px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_BG[status as ArticleStatus] ?? "bg-surface-2 text-muted"}`}
          >
            {(Object.keys(STATUS_TR) as ArticleStatus[]).map((s) => (
              // SCHEDULED needs a scheduledAt, so it's only settable from the edit page
              <option key={s} value={s} disabled={s === "SCHEDULED"}>{STATUS_TR[s]}</option>
            ))}
          </select>
        )}
      />
    </PageContainer>
  );
}
