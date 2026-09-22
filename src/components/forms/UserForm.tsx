"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminUser } from "@/types";
import { CmsCard, CmsField, CmsInput, CmsSelect } from "@/components/ui/CmsCard";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editör" },
  { value: "reporter", label: "Muhabir" },
];

type CreateForm = {
  firstName: string; lastName: string; email: string;
  role: string; password: string; enabled: boolean;
};
type EditForm = {
  firstName: string; lastName: string; email: string;
  role: string; password: string; enabled: boolean;
};

const EMPTY_CREATE: CreateForm = {
  firstName: "", lastName: "", email: "", role: "editor", password: "", enabled: true,
};

function toEditForm(u: AdminUser): EditForm {
  return {
    firstName: u.firstName, lastName: u.lastName, email: u.email,
    role: u.realmRoles[0] ?? "editor", password: "", enabled: u.enabled,
  };
}

export function UserForm({ user }: { user?: AdminUser }) {
  const router = useRouter();
  const [form, setForm] = useState<CreateForm | EditForm>(user ? toEditForm(user) : EMPTY_CREATE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof (CreateForm & EditForm)>(key: K, value: (CreateForm & EditForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (user) {
        const { password, ...rest } = form as EditForm;
        await api.users.update(user.id, rest);
        if (password) await api.users.resetPassword(user.id, password);
      } else {
        await api.users.create(form as CreateForm);
      }
      router.push("/users");
      router.refresh();
    } catch {
      setError("Kullanıcı kaydedilemedi. Keycloak bağlantısını ve yetkileri kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="flex flex-col gap-4">
          <CmsCard title="Kişisel Bilgiler">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CmsField label="Ad">
                <CmsInput required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="ör. Ahmet" />
              </CmsField>
              <CmsField label="Soyad">
                <CmsInput required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="ör. Yılmaz" />
              </CmsField>
            </div>
            <CmsField label="E-posta">
              <CmsInput
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="ahmet.yilmaz@haber.com"
              />
            </CmsField>
            <CmsField label="Şifre">
              <CmsInput
                type="password"
                required={!user}
                minLength={8}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={user ? "Değiştirmek için yeni şifre girin" : "En az 8 karakter"}
              />
            </CmsField>
          </CmsCard>
        </div>

        <div className="flex flex-col gap-4">
          <CmsCard title="Rol & Durum">
            <CmsField label="Rol">
              <CmsSelect value={form.role} onChange={(e) => set("role", e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </CmsSelect>
            </CmsField>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                role="switch"
                aria-checked={form.enabled}
                onClick={() => set("enabled", !form.enabled)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.enabled ? "bg-primary" : "bg-surface-3"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.enabled ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <span className="text-[13px] font-bold font-archivo text-ink">{form.enabled ? "Aktif" : "Devre dışı"}</span>
            </label>
          </CmsCard>

          {error && (
            <div className="text-down text-[13px] bg-down-bg border border-down/20 rounded-md px-4 py-3" style={{ fontFamily: "var(--font-public-sans)" }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white text-[13.5px] font-extrabold font-archivo py-3 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Kaydediliyor..." : user ? "Güncelle" : "Kullanıcı Oluştur"}
          </button>
          <a
            href="/users"
            className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
          >
            İptal
          </a>
        </div>
      </div>
    </form>
  );
}
