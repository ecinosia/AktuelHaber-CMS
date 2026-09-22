"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import { slotLabel } from "@/lib/ad-slots";
import type { AdBanner } from "@/types";

type Row = AdBanner & { status: string };

// Pasif wins; otherwise the date window decides.
function statusOf(b: AdBanner): string {
  const now = Date.now();
  if (!b.active) return "Pasif";
  if (b.startsAt && new Date(b.startsAt).getTime() > now) return "Planlı";
  if (b.endsAt && new Date(b.endsAt).getTime() < now) return "Süresi Doldu";
  return "Aktif";
}

const BADGE: Record<string, string> = {
  Aktif: "bg-up-bg text-up",
  Planlı: "bg-pending-bg text-pending",
  "Süresi Doldu": "bg-down-bg text-down",
  Pasif: "bg-surface-2 text-muted",
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }) : "—";
const cell = { fontFamily: "var(--font-public-sans)" };

export default function AdsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.ads.adminList().then((all) => setItems(all.map((b) => ({ ...b, status: statusOf(b) }))));
  }

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  async function handleDelete(id: string) {
    await api.ads.remove(id);
    setItems((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Reklamlar</h1>
      <DataTable<Row>
        columns={[
          {
            key: "imageUrl",
            label: "Görsel",
            sortable: false,
            render: (row) =>
              row.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.imageUrl} alt="" className="h-9 w-16 object-cover rounded" />
              ) : (
                <div className="h-9 w-16 rounded bg-surface-3" />
              ),
          },
          {
            key: "name",
            label: "Reklam",
            render: (row) => (
              <div>
                <div className="text-[13px] font-bold font-archivo text-ink">{row.name || "—"}</div>
              </div>
            ),
          },
          { key: "company", label: "Firma", render: (row) => <span style={cell}>{row.company || "—"}</span> },
          { key: "slot", label: "Konum", render: (row) => <span className="text-[12.5px] text-muted" style={cell}>{row.slots.map(slotLabel).join(", ")}</span> },
          {
            key: "status",
            label: "Durum",
            render: (row) => (
              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-archivo whitespace-nowrap ${BADGE[row.status]}`}>
                {row.status}
              </span>
            ),
          },
          {
            key: "startsAt",
            label: "Tarihler",
            render: (row) => (
              <span className="text-[12.5px] text-muted whitespace-nowrap" style={cell}>
                {fmt(row.startsAt)} – {fmt(row.endsAt)}
              </span>
            ),
          },
        ]}
        rows={items}
        hideStatus
        addHref="/ads/new"
        addLabel="Reklam Ekle"
        searchPlaceholder="Reklam, firma veya konum ara..."
        statusTabs={[
          { label: "Tümü", value: "" },
          { label: "Aktif", value: "Aktif" },
          { label: "Planlı", value: "Planlı" },
          { label: "Süresi Doldu", value: "Süresi Doldu" },
          { label: "Pasif", value: "Pasif" },
        ]}
        loading={loading}
        emptyText="Henüz reklam eklenmemiş."
        editHref={(row) => `/ads/${row.id}`}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
