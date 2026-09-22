import Link from "next/link";
import { PopupForm } from "@/components/forms/PopupForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function NewPopupPage() {
  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/popup" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Pop-up</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">Pop-up Ekle</h1>
      </div>
      <PopupForm />
    </PageContainer>
  );
}
