import Link from "next/link";
import { ColumnForm } from "@/components/forms/ColumnForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function NewColumnPage() {
  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/columns" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">
          Köşe Yazıları
        </Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">Yazı Ekle</h1>
      </div>
      <ColumnForm />
    </PageContainer>
  );
}
