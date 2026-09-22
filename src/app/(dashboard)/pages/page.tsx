"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import type { StaticPage } from "@/types";

export default function PagesPage() {
  const [items, setItems] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.pages.list().then(setItems).finally(() => setLoading(false)); }, []);

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Sabit Sayfalar</h1>
      <DataTable<StaticPage>
        columns={[
          {
            key: "title",
            label: "Sayfa Adı",
            render: (row) => (
              <span className="text-[13px] font-bold font-archivo text-ink">{row.title}</span>
            ),
          },
          {
            key: "updatedAt",
            label: "Son Güncelleme",
            render: (row) => (
              <span className="text-[12px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
                {new Date(row.updatedAt).toLocaleDateString("tr-TR")}
              </span>
            ),
          },
        ]}
        rows={items}
        searchPlaceholder="Sayfa ara..."
        hideStatus
        loading={loading}
        emptyText="Sayfa bulunamadı."
        editHref={(row) => `/pages/${row.id}`}
      />
    </PageContainer>
  );
}
