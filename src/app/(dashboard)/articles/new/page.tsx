import Link from "next/link";
import { ArticleForm } from "@/components/forms/ArticleForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function NewArticlePage() {
  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/articles" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">
          Haberler
        </Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">Haber Ekle</h1>
      </div>
      <ArticleForm />
    </PageContainer>
  );
}
