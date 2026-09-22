import Link from "next/link";
import { MenuForm } from "@/components/forms/MenuForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function NewMenuPage() {
  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/menu" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Menüler</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">Menü Ekle</h1>
      </div>
      <MenuForm />
    </PageContainer>
  );
}
