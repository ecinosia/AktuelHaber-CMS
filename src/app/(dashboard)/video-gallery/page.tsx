"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import type { Video } from "@/types";

export default function VideoGalleryPage() {
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.videoGallery.list(1, 200).then((r) => setItems(r.items));
  }

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  async function handleDelete(id: string) {
    await api.videoGallery.remove(id);
    setItems((prev) => prev.filter((v) => v.id !== id));
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
            render: (row) => <span className="text-[13px] font-bold font-archivo text-ink line-clamp-2">{row.title}</span>,
          },
          {
            key: "publishedAt",
            label: "Eklenme Tarihi",
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
        hideStatus
        loading={loading}
        emptyText="Henüz video eklenmemiş."
        editHref={(row) => `/video-gallery/${row.id}`}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
