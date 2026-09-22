import { CategoryForm } from "@/components/forms/CategoryForm";
import { PageContainer } from "@/components/ui/PageContainer";
import Link from "next/link";

export default function NewCategoryPage() {
  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/categories" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">
          Kategoriler
        </Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">Kategori Ekle</h1>
      </div>
      <CategoryForm />
    </PageContainer>
  );
}
