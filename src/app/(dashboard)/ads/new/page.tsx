import Link from "next/link";
import { AdsForm } from "@/components/forms/AdsForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function NewAdPage() {
  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/ads" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Reklamlar</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">Reklam Ekle</h1>
      </div>
      <AdsForm />
    </PageContainer>
  );
}
