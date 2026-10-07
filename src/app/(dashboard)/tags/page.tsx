"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Tag } from "@/types";

export default function TagsPage() {
  const [items, setItems] = useState<Tag[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // one of the table's page-size options
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  // Only the newest request may write the table: a slow earlier page must not overwrite it.
  const latest = useRef(0);

  useEffect(() => {
    const ticket = ++latest.current;
    setLoading(true);
    const timer = setTimeout(() => {
      api.tags
        .list({ page, pageSize, ...(q.trim() && { q: q.trim() }) })
        .then((res) => {
          if (ticket !== latest.current) return;
          setItems(res.items);
          setTotal(res.total);
        })
        .finally(() => {
          if (ticket === latest.current) setLoading(false);
        });
    }, q ? 300 : 0); // debounce typing, but page clicks answer at once
    return () => clearTimeout(timer);
  }, [page, pageSize, q]);

  async function handleDelete(id: string) {
    await api.tags.remove(id);
    setItems((prev) => prev.filter((t) => t.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
  }

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Etiketler</h1>
      <DataTable<Tag>
        columns={[
          {
            key: "name",
            label: "Etiket",
            render: (row) => (
              <span className="text-[13px] font-bold font-archivo text-ink">{row.name}</span>
            ),
          },
          {
            key: "slug",
            label: "Slug",
            render: (row) => (
              <span className="text-[13px] text-muted" style={{ fontFamily: "var(--font-public-sans)" }}>/{row.slug}</span>
            ),
          },
          {
            key: "createdAt",
            label: "Eklenme",
            render: (row) => (
              <span className="text-[12px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
                {new Date(row.createdAt).toLocaleDateString("tr-TR")}
              </span>
            ),
          },
        ]}
        rows={items}
        addHref="/tags/new"
        addLabel="Etiket Ekle"
        searchPlaceholder="Etiket ara..."
        onSearchChange={(value) => {
          setQ(value);
          setPage(1);
        }}
        hideStatus
        loading={loading}
        emptyText={q ? "Bu aramayla etiket bulunamadı." : "Henüz etiket eklenmemiş."}
        editHref={(row) => `/tags/${row.id}`}
        onDelete={handleDelete}
        server={{
          total,
          page,
          pageSize,
          activeTab: "all",
          onTabChange: () => undefined,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
      />
    </PageContainer>
  );
}
