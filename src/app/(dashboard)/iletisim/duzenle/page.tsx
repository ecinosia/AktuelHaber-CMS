"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { BrandSettings } from "@/types";
import { CmsCard, CmsField, CmsInput } from "@/components/ui/CmsCard";
import { PageContainer } from "@/components/ui/PageContainer";
import { omitEmptyStrings } from "@/lib/forms";

type FormState = {
  email: string;
  phone: string;
  address: string;
  mapEmbedUrl: string;
};

export default function EditContactPage() {
  const [form, setForm] = useState<FormState>({ email: "", phone: "", address: "", mapEmbedUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.brand.get().then((settings) => {
      if (settings) {
        setForm({
          email: settings.email ?? "",
          phone: settings.phone ?? "",
          address: settings.address ?? "",
          mapEmbedUrl: settings.mapEmbedUrl ?? "",
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // mapEmbedUrl stays outside omitEmptyStrings — "" is how the map is cleared.
      await api.brand.update({
        ...omitEmptyStrings(form),
        mapEmbedUrl: form.mapEmbedUrl,
      } as Partial<Omit<BrandSettings, "id" | "updatedAt">>);
      setSaved(true);
    } catch {
      setError("Bilgiler kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageContainer><div className="h-10 rounded-lg bg-surface animate-pulse" /></PageContainer>;

  return (
    <PageContainer>
      <div className="flex items-baseline gap-2 mb-5">
        <Link href="/iletisim" className="text-[13px] font-bold font-archivo text-muted hover:text-primary transition-colors">İletişim</Link>
        <span className="text-muted-2">/</span>
        <h1 className="m-0 text-[24px] font-black font-archivo text-ink">Bilgileri Düzenle</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div className="flex flex-col gap-4">
            <CmsCard title="İletişim Bilgileri">
              <CmsField label="E-posta">
                <CmsInput required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="iletisim@habermerkezi.com" />
              </CmsField>
              <CmsField label="Telefon">
                <CmsInput required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+90 212 000 00 00" />
              </CmsField>
              <CmsField label="Adres">
                <CmsInput required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Örnek Mahallesi, Örnek Sokak No:1, İstanbul" />
              </CmsField>
              <CmsField
                label="Harita Bağlantısı"
                description="Google Haritalar'da konumu açıp Paylaş > Harita yerleştir bölümündeki bağlantıyı yapıştırın. Boş bırakılırsa harita adrese göre gösterilir."
              >
                <CmsInput value={form.mapEmbedUrl} onChange={(e) => set("mapEmbedUrl", e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
              </CmsField>
            </CmsCard>
          </div>

          <div className="flex flex-col gap-4">
            {error && (
              <div className="text-down text-[13px] bg-down-bg border border-down/20 rounded-md px-4 py-3" style={{ fontFamily: "var(--font-public-sans)" }}>
                {error}
              </div>
            )}
            {saved && (
              <div className="text-up text-[13px] bg-up-bg border border-up/20 rounded-md px-4 py-3" style={{ fontFamily: "var(--font-public-sans)" }}>
                Bilgiler kaydedildi.
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white text-[13.5px] font-extrabold font-archivo py-3 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-60 cursor-pointer"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <a
              href="/iletisim"
              className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
            >
              İptal
            </a>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
