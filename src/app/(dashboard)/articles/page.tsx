"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { publicUrlFor } from "@/lib/forms";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import {
  applySourceFilter,
  type SourceFilterValue,
} from "@/components/ui/SourceFilter";
import type {
  Article,
  ArticlePlacement,
  ArticleStatus,
  Author,
  Category,
} from "@/types";

const STATUS_TABS = [
  { label: "Tümü", value: "" },
  { label: "Yayında", value: "PUBLISHED" },
  { label: "Taslak", value: "DRAFT" },
  { label: "Onay Bekliyor", value: "PENDING_REVIEW" },
  { label: "Zamanlanmış", value: "SCHEDULED" },
];

const STATUS_TR: Record<ArticleStatus, string> = {
  DRAFT: "Taslak",
  PENDING_REVIEW: "Onay Bekliyor",
  SCHEDULED: "Zamanlanmış",
  PUBLISHED: "Yayında",
  ARCHIVED: "Arşivlendi",
};
const STATUS_BG: Record<ArticleStatus, string> = {
  DRAFT: "bg-surface-2 text-muted",
  PENDING_REVIEW: "bg-pending-bg text-pending",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-up-bg text-up",
  ARCHIVED: "bg-surface-2 text-muted",
};

const PLACEMENT_TR: Record<ArticlePlacement, string> = {
  NONE: "Yok",
  UST_MANSET_1: "Üst Manşet 1",
  UST_MANSET_2: "Üst Manşet 2",
  ANA_MANSET: "Ana Manşet",
  ALT_MANSET: "Alt Manşet",
};
const PLACEMENTS = Object.keys(PLACEMENT_TR) as ArticlePlacement[];

const SOURCE_OPTIONS: { label: string; value: SourceFilterValue }[] = [
  { label: "Tüm Kaynaklar", value: "" },
  { label: "İçe Aktarılan", value: "migrated" },
  { label: "Yerli", value: "native" },
];

const SORT_OPTIONS = [
  { label: "Tarih (Yeniden Eskiye)", value: "date_desc" },
  { label: "Tarih (Eskiden Yeniye)", value: "date_asc" },
  { label: "Başlık (A-Z)", value: "title_asc" },
  { label: "Başlık (Z-A)", value: "title_desc" },
  { label: "Okunma (Çoktan Aza)", value: "views_desc" },
  { label: "Okunma (Azdan Çoğa)", value: "views_asc" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

type ArticleRow = Article & { id: string; status: string };

export default function ArticlesPage() {
  return (
    <Suspense>
      <ArticlesContent />
    </Suspense>
  );
}

function ArticlesContent() {
  const initialStatus = useSearchParams().get("status") ?? "";
  const [items, setItems] = useState<ArticleRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<SourceFilterValue>("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [placement, setPlacement] = useState("");
  const [sort, setSort] = useState<SortValue>("date_desc");
  const [canPublish, setCanPublish] = useState(false);

  useEffect(() => {
    api.auth.me().then((s) => setCanPublish(s.canPublish)).catch(() => undefined);
    api.articles
      .adminList({ pageSize: 200 })
      .then((r) => {
        setItems(r.items as ArticleRow[]);
      })
      .finally(() => setLoading(false));
    api.categories.list().then(setCategories);
    api.authors.list().then(setAuthors);
  }, []);

  async function handleDelete(id: string) {
    await api.articles.remove(id);
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  async function handlePlacementChange(id: string, next: ArticlePlacement) {
    setItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, placement: next } : a)),
    );
    await api.articles.update(id, { placement: next });
  }

  async function handleStatusChange(id: string, next: ArticleStatus) {
    const prev = items.find((a) => a.id === id)?.status;
    setItems((all) => all.map((a) => (a.id === id ? { ...a, status: next } : a)));
    try {
      await api.articles.update(id, { status: next });
    } catch {
      setItems((all) =>
        all.map((a) => (a.id === id ? { ...a, status: prev ?? a.status } : a)),
      );
    }
  }

  const filtered =applySourceFilter(items, source)
    .filter((a) => !categoryId || a.categoryId === categoryId)
    .filter((a) => !authorId || a.authorId === authorId)
    .filter((a) => !placement || a.placement === placement)
    .sort((a, b) => {
      switch (sort) {
        case "title_asc":
          return a.title.localeCompare(b.title, "tr");
        case "title_desc":
          return b.title.localeCompare(a.title, "tr");
        case "views_asc":
          return a.viewCount - b.viewCount;
        case "views_desc":
          return b.viewCount - a.viewCount;
        case "date_asc":
          return (
            new Date(a.publishedAt ?? a.createdAt).getTime() -
            new Date(b.publishedAt ?? b.createdAt).getTime()
          );
        default:
          return (
            new Date(b.publishedAt ?? b.createdAt).getTime() -
            new Date(a.publishedAt ?? a.createdAt).getTime()
          );
      }
    });

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-[26px] font-black font-archivo text-ink">
          Haberler
        </h1>
      </div>

      <DataTable<ArticleRow>
        filterBar={
          <>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-3 py-1.5 border border-line-strong rounded-md text-[12px] text-body"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="px-3 py-1.5 border border-line-strong rounded-md text-[12px] text-body"
            >
              <option value="">Tüm Yazarlar</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName} {a.lastName}
                </option>
              ))}
            </select>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              className="px-3 py-1.5 border border-line-strong rounded-md text-[12px] text-body"
            >
              <option value="">Tüm Yerleşimler</option>
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>
                  {PLACEMENT_TR[p]}
                </option>
              ))}
            </select>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as SourceFilterValue)}
              className="px-3 py-1.5 border border-line-strong rounded-md text-[12px] text-body"
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="px-3 py-1.5 border border-line-strong rounded-md text-[12px] text-body"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setCategoryId("");
                setAuthorId("");
                setPlacement("");
                setSource("");
                setSort("date_desc");
              }}
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
            width: "450px",
            render: (row) => (
              <div className="min-w-0">
                <Link
                  href={`/articles/${row.id}`}
                  className="text-[13px] font-bold font-archivo text-ink hover:text-primary line-clamp-1"
                >
                  {row.title}
                </Link>
              </div>
            ),
          },
          {
            key: "category",
            label: "Kategori",
            sortable: false,
            width: "120px",
            render: (row) => (
              <span
                className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-archivo text-white whitespace-nowrap"
                style={{ backgroundColor: row.category.color ?? "#9CA3AF" }}
              >
                {row.category.name}
              </span>
            ),
          },
          {
            key: "author",
            label: "Yazar",
            sortable: false,
            render: (row) => (
              <span
                className="text-[13px] text-muted"
                style={{ fontFamily: "var(--font-public-sans)" }}
              >
                {row.author.firstName} {row.author.lastName}
              </span>
            ),
          },
          {
            key: "placement",
            label: "Yerleşim",
            sortable: false,
            render: (row) => (
              <select
                value={row.placement}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  handlePlacementChange(
                    row.id,
                    e.target.value as ArticlePlacement,
                  )
                }
                className="px-2 py-1 border border-line-strong rounded text-[12px] text-body bg-surface cursor-pointer"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p} value={p}>
                    {PLACEMENT_TR[p]}
                  </option>
                ))}
              </select>
            ),
          },
          {
            key: "viewCount",
            label: "Okunma",
            sortable: false,
            render: (row) => (
              <span className="text-[12px] text-muted whitespace-nowrap">
                {row.viewCount.toLocaleString("tr-TR")}
              </span>
            ),
          },
          {
            key: "createdAt",
            label: "Tarih",
            sortable: false,
            render: (row) => (
              <span
                className="text-[12px] text-muted whitespace-nowrap"
                style={{ fontFamily: "var(--font-public-sans)" }}
              >
                {new Date(row.publishedAt ?? row.createdAt).toLocaleString(
                  "tr-TR",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </span>
            ),
          },
        ]}
        rows={filtered}
        addHref="/articles/new"
        addLabel="Haber Ekle"
        searchPlaceholder="Haber başlığı ara..."
        statusTabs={STATUS_TABS}
        initialTab={initialStatus}
        showThumbnail
        thumbnailKey="coverImageUrl"
        loading={loading}
        emptyText="Henüz haber eklenmemiş."
        editHref={(row) => `/articles/${row.id}`}
        viewHref={(row) =>
          publicUrlFor({
            kind: "article",
            slug: row.slug,
            legacyPath: row.legacyPath,
          })
        }
        onDelete={handleDelete}
        deleteHint="Kalıcı silmek yerine durumu “Arşivlendi” yaparak geri alınabilir şekilde kaldırabilirsiniz."
        statusLabel={(status, row) => (
          <select
            value={status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              handleStatusChange(row.id, e.target.value as ArticleStatus)
            }
            className={`text-[11px] font-bold font-archivo px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_BG[status as ArticleStatus] ?? "bg-surface-2 text-muted"}`}
          >
            {(Object.keys(STATUS_TR) as ArticleStatus[]).map((s) => (
              // SCHEDULED needs a scheduledAt, so it's only settable from the edit page
              // Without direct-publish rights the BE turns Yayında into Onay Bekliyor, so don't offer it
              <option key={s} value={s} disabled={s === "SCHEDULED" || (s === "PUBLISHED" && !canPublish && status !== "PUBLISHED")}>
                {STATUS_TR[s]}
              </option>
            ))}
          </select>
        )}
      />
    </PageContainer>
  );
}
