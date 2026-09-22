import Link from "next/link";
import { AuthorForm } from "@/components/forms/AuthorForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function NewAuthorPage() {
  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/authors" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Yazarlar</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">Yazar Ekle</h1>
      </div>
      <AuthorForm />
    </PageContainer>
  );
}
