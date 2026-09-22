"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Tag } from "@/types";

export default function TagsPage() {
  const [items, setItems] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tags.list().then(setItems).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await api.tags.remove(id);
    setItems((prev) => prev.filter((t) => t.id !== id));
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
        hideStatus
        loading={loading}
        emptyText="Henüz etiket eklenmemiş."
        editHref={(row) => `/tags/${row.id}`}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
