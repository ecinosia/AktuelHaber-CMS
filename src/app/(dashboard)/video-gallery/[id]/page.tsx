"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Video } from "@/types";
import { VideoForm } from "@/components/forms/VideoForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function EditVideoPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.videoGallery.list(1, 200).then((r) => {
      setVideo(r.items.find((v) => v.id === id) ?? null);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageContainer><div className="h-10 rounded-lg bg-surface animate-pulse" /></PageContainer>;
  if (!video) return <p className="text-down text-[13px]" style={{ fontFamily: "var(--font-public-sans)" }}>Video bulunamadı.</p>;

  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/video-gallery" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Video Galeri</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">{video.title}</h1>
      </div>
      <VideoForm video={video} />
    </PageContainer>
  );
}
