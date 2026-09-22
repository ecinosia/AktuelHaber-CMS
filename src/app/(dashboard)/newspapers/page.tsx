"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Newspaper } from "@/types";

export default function NewspapersPage() {
  const [items, setItems] = useState<Newspaper[]>([]);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.newspapers.list().then(setItems);
  }

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  async function toggle(row: Newspaper) {
    const updated = await api.newspapers.setActive(row.id, !row.active);
    setItems((prev) => prev.map((n) => (n.id === row.id ? updated : n)));
  }

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Gazeteler</h1>
      <DataTable<Newspaper>
        columns={[
          {
            key: "coverImage",
            label: "Görsel",
            sortable: false,
            render: (row) =>
              row.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.coverImage} alt="" className="h-12 w-9 object-cover rounded" />
              ) : (
                <div className="h-12 w-9 rounded bg-surface-3" />
              ),
          },
          {
            key: "name",
            label: "Ad",
            render: (row) => <span className="text-[13px] font-bold font-archivo text-ink">{row.name}</span>,
          },
          {
            key: "date",
            label: "Tarih",
            render: (row) => (
              <span className="text-[12.5px] text-muted" style={{ fontFamily: "var(--font-public-sans)" }}>
                {new Date(row.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            ),
          },
        ]}
        rows={items.map((n) => ({ ...n, status: n.active ? "ACTIVE" : "INACTIVE" }))}
        searchPlaceholder="Gazete adı ara..."
        loading={loading}
        emptyText="Henüz gazete yok."
        actions={[{ label: "Gizle / Göster", onClick: toggle }]}
      />
    </PageContainer>
  );
}
