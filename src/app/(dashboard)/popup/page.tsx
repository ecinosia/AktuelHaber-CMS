"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Popup } from "@/types";

export default function PopupPage() {
  const [items, setItems] = useState<(Omit<Popup, "status"> & { status: string })[]>([]);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.popup.list().then((all) =>
      setItems(all.map((p) => ({ ...p, status: p.status === "ACTIVE" ? "Aktif" : "Pasif" })))
    );
  }

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  async function handleDelete(id: string) {
    await api.popup.remove(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Pop-up</h1>
      <DataTable<Omit<Popup, "status"> & { status: string }>
        columns={[
          {
            key: "imageUrl",
            label: "Görsel",
            sortable: false,
            width: "80px",
            render: (row) =>
              row.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.imageUrl} alt="" className="h-9 w-14 object-cover rounded" />
              ) : (
                <div className="h-9 w-14 rounded bg-surface-3" />
              ),
          },
          {
            key: "title",
            label: "Başlık",
            render: (row) => (
              <span className="text-[13px] font-bold font-archivo text-ink">{row.title}</span>
            ),
          },
          {
            key: "displayDelay",
            label: "Gecikme",
            render: (row) => (
              <span className="text-[12.5px] text-muted" style={{ fontFamily: "var(--font-public-sans)" }}>
                {row.displayDelay}s
              </span>
            ),
          },
          {
            key: "startDate",
            label: "Tarihler",
            render: (row) => (
              <span className="text-[12px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
                {row.startDate
                  ? `${new Date(row.startDate).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })} – ${row.endDate ? new Date(row.endDate).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }) : "∞"}`
                  : "—"}
              </span>
            ),
          },
        ]}
        rows={items}
        addHref="/popup/new"
        addLabel="Pop-up Ekle"
        searchPlaceholder="Başlık ara..."
        statusTabs={[
          { label: "Tümü", value: "" },
          { label: "Aktif", value: "Aktif" },
          { label: "Pasif", value: "Pasif" },
        ]}
        loading={loading}
        emptyText="Henüz pop-up eklenmemiş."
        editHref={(row) => `/popup/${row.id}`}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
