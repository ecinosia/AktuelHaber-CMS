import Link from "next/link";
import { UserForm } from "@/components/forms/UserForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function NewUserPage() {
  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/users" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Kullanıcılar</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">Kullanıcı Ekle</h1>
      </div>
      <UserForm />
    </PageContainer>
  );
}
