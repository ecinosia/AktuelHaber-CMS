"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { publicUrlFor } from "@/lib/forms";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Author } from "@/types";

type AuthorRow = Omit<Author, "status"> & { id: string; status: string };

const PUBLISH_LABELS: Record<string, string> = {
  DIRECT: "Doğrudan",
  REQUIRES_APPROVAL: "Onay Gerekli",
};

const SORTS: Record<string, [string, (a: AuthorRow, b: AuthorRow) => number]> = {
  "name-asc": ["Ad A → Z", (a, b) => a.firstName.localeCompare(b.firstName, "tr")],
  "name-desc": ["Ad Z → A", (a, b) => b.firstName.localeCompare(a.firstName, "tr")],
  "count-desc": ["En çok haber", (a, b) => (b.articleCount ?? 0) - (a.articleCount ?? 0)],
  "count-asc": ["En az haber", (a, b) => (a.articleCount ?? 0) - (b.articleCount ?? 0)],
  "new": ["En yeni eklenen", (a, b) => b.createdAt.localeCompare(a.createdAt)],
  "old": ["En eski eklenen", (a, b) => a.createdAt.localeCompare(b.createdAt)],
};

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1.5 border border-line-strong rounded-md text-[12px] text-body"
    >
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

export default function AuthorsPage() {
  const [items, setItems] = useState<AuthorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [publishType, setPublishType] = useState("");

  function reload() {
    return api.authors.list().then((authors) =>
      setItems(authors.map((a) => ({ ...a, status: a.status === "ACTIVE" ? "Aktif" : "Pasif" })))
    );
  }

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  async function handleDelete(id: string) {
    await api.authors.remove(id);
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  const rows = items
    .filter((a) => (!status || a.status === status) && (!publishType || a.publishType === publishType))
    .sort(SORTS[sort][1]);

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Yazarlar</h1>
      </div>
      <DataTable<AuthorRow>
        columns={[
          {
            key: "firstName",
            label: "Ad Soyad",
            render: (row) => (
              <div className="flex items-center gap-2.5">
                {row.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-surface-3 flex items-center justify-center text-[11px] font-bold font-archivo text-muted shrink-0">
                    {row.firstName[0]}{row.lastName[0]}
                  </div>
                )}
                <div>
                  <span className="text-[13px] font-bold font-archivo text-ink">{row.firstName} {row.lastName}</span>
                  {row.title && <p className="text-[11px] text-muted-2 m-0" style={{ fontFamily: "var(--font-public-sans)" }}>{row.title}</p>}
                </div>
              </div>
            ),
          },
          { key: "email", label: "E-posta", render: (row) => <span className="text-[13px] text-muted" style={{ fontFamily: "var(--font-public-sans)" }}>{row.email ?? "—"}</span> },
          {
            key: "publishType",
            label: "Yayın Türü",
            render: (row) => <span className="text-[12.5px] text-muted" style={{ fontFamily: "var(--font-public-sans)" }}>{PUBLISH_LABELS[row.publishType] ?? row.publishType}</span>,
          },
          { key: "articleCount", label: "Haber Sayısı", render: (row) => <span className="text-[13px] text-muted">{row.articleCount ?? 0}</span> },
        ]}
        filterBar={
          <>
            <Select value={status} onChange={setStatus} options={[["", "Tüm Durumlar"], ["Aktif", "Aktif"], ["Pasif", "Pasif"]]} />
            <Select value={publishType} onChange={setPublishType} options={[["", "Tüm Yayın Türleri"], ...Object.entries(PUBLISH_LABELS)]} />
            <Select value={sort} onChange={setSort} options={Object.entries(SORTS).map(([v, [l]]) => [v, l])} />
          </>
        }
        rows={rows}
        addHref="/authors/new"
        addLabel="Yazar Ekle"
        searchPlaceholder="Yazar adı veya e-posta ara..."
        loading={loading}
        emptyText="Henüz yazar eklenmemiş."
        editHref={(row) => `/authors/${row.id}`}
        viewHref={(row) => publicUrlFor({ kind: "author", slug: row.slug })}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
