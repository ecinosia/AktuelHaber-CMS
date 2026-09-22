"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Menu } from "@/types";

const LOCATION_LABELS = { MAIN: "Header", FOOTER: "Footer" } as const;

export default function MenuPage() {
  const [rows, setRows] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.menu.list().then(setRows).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await api.menu.remove(id);
    setRows((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Menüler</h1>
      <DataTable<Menu>
        columns={[
          {
            key: "name",
            label: "Menü",
            render: (row) => <span className="text-[13px] font-bold font-archivo text-ink">{row.name}</span>,
          },
          {
            key: "location",
            label: "Konum",
            render: (row) => <span className="text-[12.5px] text-muted">{LOCATION_LABELS[row.location]}</span>,
          },
          {
            key: "_count",
            label: "Öğe Sayısı",
            sortable: false,
            render: (row) => <span className="text-[12.5px] text-muted">{row._count?.items ?? 0}</span>,
          },
        ]}
        rows={rows}
        addHref="/menu/new"
        addLabel="Menü Ekle"
        searchPlaceholder="Menü ara..."
        loading={loading}
        emptyText="Menü bulunamadı."
        editHref={(row) => `/menu/${row.id}`}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
