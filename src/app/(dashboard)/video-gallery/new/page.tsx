import Link from "next/link";
import { VideoForm } from "@/components/forms/VideoForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function NewVideoPage() {
  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link
          href="/video-gallery"
          className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors"
        >
          Video Galeri
        </Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">
          Video Ekle
        </h1>
      </div>
      <VideoForm />
    </PageContainer>
  );
}
