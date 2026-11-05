"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import { usePersistedPageSize } from "@/lib/use-persisted-page-size";
import type { Video } from "@/types";

export default function VideoGalleryPage() {
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize, sizeReady] = usePersistedPageSize("videos", 25);
  const [total, setTotal] = useState(0);
  const [reload, setReload] = useState(0);

  // Searched and paged on the server, so every video is reachable - not only the newest 200.
  useEffect(() => {
    let current = true;
    if (!sizeReady) return;
    const timer = setTimeout(() => {
      setLoading(true);
      api.videoGallery
        .list(page, pageSize, q)
        .then((r) => {
          if (!current) return;
          setItems(r.items);
          setTotal(r.total);
        })
        .catch(() => undefined)
        .finally(() => {
          if (current) setLoading(false);
        });
    }, q ? 300 : 0);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [page, pageSize, sizeReady, q, reload]);

  async function handleDelete(id: string) {
    await api.videoGallery.remove(id);
    setItems((prev) => prev.filter((v) => v.id !== id));
    setReload((n) => n + 1);
  }

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Video Galeri</h1>
      <DataTable<Video>
        columns={[
          {
            key: "thumbnailUrl",
            label: "Thumbnail",
            sortable: false,
            render: (row) =>
              row.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.thumbnailUrl} alt="" className="h-10 w-16 object-cover rounded" />
              ) : (
                <div className="h-10 w-16 rounded bg-surface-3 flex items-center justify-center">
                  <span className="text-[10px] text-muted-2">▶</span>
                </div>
              ),
          },
          {
            key: "title",
            label: "Başlık",
            sortable: false,
            render: (row) => <span className="text-[13px] font-bold font-archivo text-ink line-clamp-2">{row.title}</span>,
          },
          {
            key: "publishedAt",
            label: "Eklenme Tarihi",
            sortable: false,
            render: (row) => (
              <span className="text-[12px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
                {new Date(row.publishedAt).toLocaleDateString("tr-TR")}
              </span>
            ),
          },
        ]}
        rows={items}
        addHref="/video-gallery/new"
        addLabel="Video Ekle"
        searchPlaceholder="Video başlığı ara..."
        onSearchChange={(v) => { setQ(v); setPage(1); }}
        hideStatus
        server={{ total, page, pageSize, activeTab: "", onTabChange: () => undefined, onPageChange: setPage, onPageSizeChange: (n) => { setPageSize(n); setPage(1); } }}
        loading={loading}
        emptyText="Henüz video eklenmemiş."
        editHref={(row) => `/video-gallery/${row.id}`}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
