"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { BrandSettings } from "@/types";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { CmsCard, CmsField, CmsInput, CmsSelect, CmsTextarea } from "@/components/ui/CmsCard";
import { PageContainer } from "@/components/ui/PageContainer";
import { omitEmptyStrings } from "@/lib/forms";
import { TURKEY_CITIES } from "@/lib/turkey-cities";

type FormState = Partial<Omit<BrandSettings, "id" | "updatedAt">>;

// What the color/language inputs display when nothing is saved yet — kept in
// state so what the editor sees is what actually gets sent.
const FORM_DEFAULTS: FormState = {
  language: "tr",
  primaryColor: "#C6172E",
  secondaryColor: "#000000",
  accentColor: "#000000",
};

export default function BrandSettingsPage() {
  const [form, setForm] = useState<FormState>(FORM_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Merge over defaults so unsaved brands show (and save) the same values.
    api.brand
      .get()
      .then((settings) => setForm((prev) => ({ ...prev, ...settings })))
      .catch(() => setError("Ayarlar yüklenemedi."))
      .finally(() => setLoading(false));
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
      const updated = await api.brand.update({ ...omitEmptyStrings(form), mapEmbedUrl: form.mapEmbedUrl });
      setForm(updated);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Ayarlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageContainer className="gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-surface animate-pulse" />
        ))}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink mb-5">Ayarlar</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div className="flex flex-col gap-4">
            {/* Site Bilgileri */}
            <CmsCard title="Site Bilgileri">
              <div className="flex flex-col gap-3">
                <label className="cms-label">Logo</label>
                <ImageUpload kind="logo" value={form.logoUrl} onChange={(url) => set("logoUrl", url)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-3">
                  <label className="cms-label">Beyaz Logo (footer)</label>
                  <ImageUpload kind="logo" value={form.logoDarkUrl ?? undefined} onChange={(url) => set("logoDarkUrl", url)} />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="cms-label">Favicon (PNG)</label>
                  <ImageUpload kind="logo" value={form.faviconUrl ?? undefined} onChange={(url) => set("faviconUrl", url)} />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="cms-label">Varsayılan paylaşım görseli</label>
                  <ImageUpload kind="banner" value={form.ogImageUrl ?? undefined} onChange={(url) => set("ogImageUrl", url)} />
                </div>
              </div>
              <CmsField label="Site Adı">
                <CmsInput required value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="ör. Aktüel Haber" />
              </CmsField>
              <CmsField label="Açıklama">
                <CmsTextarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Sitenizin kısa açıklaması..." />
              </CmsField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CmsField label="Dil">
                  <CmsInput value={form.language ?? "tr"} onChange={(e) => set("language", e.target.value)} placeholder="tr" />
                </CmsField>
                <CmsField label="Hava Durumu Şehri">
                  <CmsSelect value={form.weatherCity ?? ""} onChange={(e) => set("weatherCity", e.target.value)}>
                    <option value="">Seçiniz</option>
                    {TURKEY_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </CmsSelect>
                </CmsField>
              </div>
            </CmsCard>

            {/* İletişim */}
            <CmsCard title="İletişim">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CmsField label="E-posta">
                  <CmsInput required type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="iletisim@site.com" />
                </CmsField>
                <CmsField label="Telefon">
                  <CmsInput required value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+90 212 000 00 00" />
                </CmsField>
              </div>
              <CmsField label="Adres">
                <CmsInput required value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} placeholder="Örnek Mah. Örnek Sk. No:1 İstanbul" />
              </CmsField>
              <CmsField label="Harita Bağlantısı" description="Google Haritalar'da konumu açıp Paylaş > Harita yerleştir bölümündeki bağlantıyı yapıştırın. Boş bırakılırsa harita adrese göre gösterilir.">
                <CmsInput value={form.mapEmbedUrl ?? ""} onChange={(e) => set("mapEmbedUrl", e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
              </CmsField>
            </CmsCard>

            {/* Sosyal Medya */}
            <CmsCard title="Sosyal Medya">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CmsField label="Facebook">
                  <CmsInput value={form.facebookUrl ?? ""} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/..." />
                </CmsField>
                <CmsField label="Twitter / X">
                  <CmsInput value={form.twitterUrl ?? ""} onChange={(e) => set("twitterUrl", e.target.value)} placeholder="https://twitter.com/..." />
                </CmsField>
                <CmsField label="Instagram">
                  <CmsInput value={form.instagramUrl ?? ""} onChange={(e) => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/..." />
                </CmsField>
                <CmsField label="YouTube">
                  <CmsInput value={form.youtubeUrl ?? ""} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/..." />
                </CmsField>
              </div>
            </CmsCard>

            {/* Google News / Reklam */}
            <CmsCard title="Reklam & SEO">
              <CmsField label="ads.txt İçeriği">
                <CmsTextarea
                  rows={5}
                  placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                  value={form.adsTxtContent ?? ""}
                  onChange={(e) => set("adsTxtContent", e.target.value)}
                />
              </CmsField>
            </CmsCard>
          </div>

          <div className="flex flex-col gap-4">
            {/* Renk Şeması */}
            <CmsCard title="Renk Şeması">
              <CmsField label="Ana Renk">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.primaryColor ?? "#C6172E"}
                    onChange={(e) => set("primaryColor", e.target.value)}
                    className="h-9 w-9 rounded cursor-pointer border border-line-strong"
                  />
                  <CmsInput
                    value={form.primaryColor ?? "#C6172E"}
                    onChange={(e) => set("primaryColor", e.target.value)}
                    placeholder="#C6172E"
                    className="font-mono"
                  />
                </div>
              </CmsField>
              <CmsField label="İkincil Renk">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.secondaryColor ?? "#000000"}
                    onChange={(e) => set("secondaryColor", e.target.value)}
                    className="h-9 w-9 rounded cursor-pointer border border-line-strong"
                  />
                  <CmsInput
                    value={form.secondaryColor ?? "#000000"}
                    onChange={(e) => set("secondaryColor", e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </CmsField>
              <CmsField label="Vurgu Rengi">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.accentColor ?? "#000000"}
                    onChange={(e) => set("accentColor", e.target.value)}
                    className="h-9 w-9 rounded cursor-pointer border border-line-strong"
                  />
                  <CmsInput
                    value={form.accentColor ?? "#000000"}
                    onChange={(e) => set("accentColor", e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </CmsField>
            </CmsCard>

            {error && (
              <div className="text-down text-[13px] bg-down-bg border border-down/20 rounded-md px-4 py-3" style={{ fontFamily: "var(--font-public-sans)" }}>
                {error}
              </div>
            )}
            {saved && (
              <div className="text-up text-[13px] bg-up-bg border border-up/20 rounded-md px-4 py-3" style={{ fontFamily: "var(--font-public-sans)" }}>
                Ayarlar kaydedildi.
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white text-[13.5px] font-extrabold font-archivo py-3 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-60 cursor-pointer"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
