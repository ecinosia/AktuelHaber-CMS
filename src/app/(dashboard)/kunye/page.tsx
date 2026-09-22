"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Masthead } from "@/types";
import { CmsCard, CmsField, CmsInput, CmsTextarea } from "@/components/ui/CmsCard";
import { PageContainer } from "@/components/ui/PageContainer";

type Key = keyof Masthead;
type FieldDef = [key: Key, label: string, kind?: "textarea"];

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Şirket Bilgileri",
    fields: [
      ["companyName", "Şirket Adı"], ["foundedYear", "Kuruluş Yılı"], ["address", "Adres"],
      ["phone", "Telefon"], ["fax", "Fax"], ["email", "E-posta"], ["website", "Website"],
    ],
  },
  {
    title: "Resmi Bilgiler",
    fields: [
      ["tradeRegistryNo", "Ticaret Sicil No"], ["taxOffice", "Vergi Dairesi"], ["taxNo", "Vergi No"],
      ["mersisNo", "Mersis No"], ["kepAddress", "Elektronik Tebligat Adresi"],
    ],
  },
  {
    title: "Kadro",
    fields: [
      ["owner", "İmtiyaz Sahibi"], ["generalCoordinator", "Genel Koordinatör"],
      ["editorInChief", "Genel Yayın Yönetmeni"], ["newsEditor", "Haber Müdürü"],
      ["softwareDevelopment", "Yazılım Geliştirme"], ["legalAdvisor", "Hukuk Danışmanı"],
      ["responsibleEditor", "Sorumlu Editör"],
    ],
  },
  {
    title: "Altyapı",
    fields: [["hostingProvider", "Hosting Sağlayıcı"], ["domainProvider", "Alan Adı Sağlayıcı"]],
  },
  {
    title: "Diğer Siteler",
    fields: [["otherSites", "Bünyesindeki Diğer Siteler (her satıra bir site)", "textarea"]],
  },
];

export default function KunyePage() {
  const [form, setForm] = useState<Masthead>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.masthead.get().then(setForm).finally(() => setLoading(false));
  }, []);

  function set(key: Key, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      setForm(await api.masthead.update(form));
      setSaved(true);
    } catch {
      setError("Künye kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageContainer><div className="h-10 rounded-lg bg-surface animate-pulse" /></PageContainer>;

  return (
    <PageContainer>
      <h1 className="m-0 mb-5 text-[26px] font-black font-archivo text-ink">Künye</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div className="flex flex-col gap-4">
            {SECTIONS.map((section) => (
              <CmsCard key={section.title} title={section.title}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map(([key, label, kind]) => (
                    <div key={key} className={kind === "textarea" || key === "address" ? "sm:col-span-2" : undefined}>
                      <CmsField label={label}>
                        {kind === "textarea" ? (
                          <CmsTextarea rows={5} value={form[key] ?? ""} onChange={(e) => set(key, e.target.value)} />
                        ) : (
                          <CmsInput value={form[key] ?? ""} onChange={(e) => set(key, e.target.value)} />
                        )}
                      </CmsField>
                    </div>
                  ))}
                </div>
              </CmsCard>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {error && (
              <div className="text-down text-[13px] bg-down-bg border border-down/20 rounded-md px-4 py-3" style={{ fontFamily: "var(--font-public-sans)" }}>
                {error}
              </div>
            )}
            {saved && (
              <div className="text-up text-[13px] bg-up-bg border border-up/20 rounded-md px-4 py-3" style={{ fontFamily: "var(--font-public-sans)" }}>
                Künye kaydedildi.
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
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
