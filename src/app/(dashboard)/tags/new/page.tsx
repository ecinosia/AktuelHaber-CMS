import Link from "next/link";
import { TagForm } from "@/components/forms/TagForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function NewTagPage() {
  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/tags" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Etiketler</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">Etiket Ekle</h1>
      </div>
      <TagForm />
    </PageContainer>
  );
}
