"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { publicUrlFor } from "@/lib/forms";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Category } from "@/types";

const SORT_OPTIONS = [
  { label: "Ad (A-Z)", value: "name_asc" },
  { label: "Ad (Z-A)", value: "name_desc" },
  { label: "Tarih (Yeniden Eskiye)", value: "date_desc" },
  { label: "Tarih (Eskiden Yeniye)", value: "date_asc" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

type CategoryRow = Category & { id: string; status: string; articleCount?: number };

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortValue>("name_asc");

  function reload() {
    return api.categories.list().then((cats) =>
      setItems(cats.map((c) => ({ ...c, status: "Aktif" })))
    );
  }

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  async function handleDelete(id: string) {
    await api.categories.remove(id);
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  const sorted = [...items].sort((a, b) => {
    switch (sort) {
      case "name_desc":
        return b.name.localeCompare(a.name, "tr");
      case "date_asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "date_desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return a.name.localeCompare(b.name, "tr");
    }
  });

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Kategoriler</h1>
      </div>
      <DataTable<CategoryRow>
        filterBar={
          <>
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
              onClick={() => setSort("name_asc")}
              className="ml-auto px-5 py-1.5 border border-line-strong bg-primary text-[12px] font-bold font-archivo text-white rounded-md hover:bg-primary-hover transition-colors"
            >
              Filtreyi Temizle
            </button>
          </>
        }
        columns={[
          {
            key: "name",
            label: "Kategori Adı",
            sortable: false,
          },
          {
            key: "color",
            label: "Renk",
            sortable: false,
            render: (row) =>
              row.color ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded border border-line-strong" style={{ background: row.color }} />
                  <span className="text-muted-2 font-mono text-[12px]">{row.color}</span>
                </span>
              ) : (
                <span className="text-muted-2">—</span>
              ),
          },
          { key: "slug", label: "Slug", sortable: false, render: (row) => <span className="text-muted-2 font-mono text-[12px]">{row.slug}</span> },
        ]}
        rows={sorted}
        addHref="/categories/new"
        addLabel="Kategori Ekle"
        searchPlaceholder="Kategori ara..."
        loading={loading}
        emptyText="Henüz kategori eklenmemiş."
        editHref={(row) => `/categories/${row.id}`}
        viewHref={(row) => publicUrlFor({ kind: "category", slug: row.slug })}
        onDelete={handleDelete}
        hideStatus
      />
    </PageContainer>
  );
}
