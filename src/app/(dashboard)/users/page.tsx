"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { PageContainer } from "@/components/ui/PageContainer";
import type { AdminUser } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  editor: "Editör",
  reporter: "Muhabir",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-primary/10 text-primary",
  editor: "bg-pending-bg text-pending",
  reporter: "bg-surface-3 text-muted",
};

export default function UsersPage() {
  const [items, setItems] = useState<(AdminUser & { status: string })[]>([]);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.users.list().then((all) =>
      setItems(all.map((u) => ({ ...u, status: u.enabled ? "Aktif" : "Pasif" })))
    );
  }

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  async function handleDelete(id: string) {
    await api.users.remove(id);
    setItems((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink">Kullanıcılar</h1>
      <DataTable<AdminUser & { status: string }>
        columns={[
          {
            key: "firstName",
            label: "Ad",
            render: (row) => (
              <span className="text-[13px] font-bold font-archivo text-ink">{row.firstName} {row.lastName}</span>
            ),
          },
          {
            key: "email",
            label: "E-posta",
            render: (row) => (
              <span className="text-[12.5px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>{row.email}</span>
            ),
          },
          {
            key: "realmRoles",
            label: "Rol",
            render: (row) => {
              const role = row.realmRoles[0] ?? "";
              return (
                <span className={`text-[11px] font-bold font-archivo px-2.5 py-1 rounded-full ${ROLE_COLORS[role] ?? "bg-surface-3 text-muted"}`}>
                  {ROLE_LABELS[role] ?? role}
                </span>
              );
            },
          },
          {
            key: "createdTimestamp",
            label: "Oluşturulma Tarihi",
            render: (row) => (
              <span className="text-[12px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
                {new Date(row.createdTimestamp).toLocaleDateString("tr-TR")}
              </span>
            ),
          },
        ]}
        rows={items}
        addHref="/users/new"
        addLabel="Kullanıcı Ekle"
        searchPlaceholder="Ad, soyad veya e-posta ara..."
        statusTabs={[
          { label: "Tümü", value: "" },
          { label: "Aktif", value: "Aktif" },
          { label: "Pasif", value: "Pasif" },
        ]}
        loading={loading}
        emptyText="Henüz kullanıcı yok."
        editHref={(row) => `/users/${row.id}`}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
