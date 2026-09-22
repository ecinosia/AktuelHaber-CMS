"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { AdminUser } from "@/types";
import { UserForm } from "@/components/forms/UserForm";
import { PageContainer } from "@/components/ui/PageContainer";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.users.findOne(id).then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageContainer><div className="h-10 rounded-lg bg-surface animate-pulse" /></PageContainer>;
  if (!user) return <p className="text-down text-[13px]" style={{ fontFamily: "var(--font-public-sans)" }}>Kullanıcı bulunamadı.</p>;

  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/users" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">Kullanıcılar</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">{user.firstName} {user.lastName}</h1>
      </div>
      <UserForm user={user} />
    </PageContainer>
  );
}
