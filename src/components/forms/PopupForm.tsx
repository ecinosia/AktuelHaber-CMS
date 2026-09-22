"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Popup, PopupStatus } from "@/types";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { CmsCard, CmsField, CmsInput, CmsSelect, CmsTextarea } from "@/components/ui/CmsCard";

type FormState = {
  title: string;
  companyName: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  displayDelay: number;
  displayOnce: boolean;
  status: PopupStatus;
  startDate: string;
  endDate: string;
};

const EMPTY: FormState = {
  title: "", companyName: "", content: "", imageUrl: "", linkUrl: "",
  displayDelay: 3, displayOnce: true,
  status: "ACTIVE", startDate: "", endDate: "",
};

// datetime-local wants "yyyy-mm-ddThh:mm" in local time.
const toLocalInput = (iso: string) => new Date(iso).toLocaleString("sv").slice(0, 16).replace(" ", "T");

function toForm(p: Popup): FormState {
  return {
    title: p.title, companyName: p.companyName ?? "", content: p.content ?? "", imageUrl: p.imageUrl ?? "",
    linkUrl: p.linkUrl ?? "", displayDelay: p.displayDelay,
    displayOnce: p.displayOnce, status: p.status,
    startDate: p.startDate ? toLocalInput(p.startDate) : "",
    endDate: p.endDate ? toLocalInput(p.endDate) : "",
  };
}

export function PopupForm({ popup }: { popup?: Popup }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(popup ? toForm(popup) : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        imageUrl: form.imageUrl || undefined,
        linkUrl: form.linkUrl || undefined,
        content: form.content || undefined,
        companyName: form.companyName || undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      };
      if (popup) await api.popup.update(popup.id, payload);
      else await api.popup.create(payload);
      router.push("/popup");
      router.refresh();
    } catch {
      setError("Pop-up kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="flex flex-col gap-4">
          <CmsCard title="Temel Bilgiler">
            <CmsField label="Başlık">
              <CmsInput required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="ör. Abone Ol" />
            </CmsField>
            <CmsField label="Firma Adı">
              <CmsInput required value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="ör. Aktüel Medya A.Ş." />
            </CmsField>
            <CmsField label="İçerik Metni">
              <CmsTextarea rows={3} value={form.content} onChange={(e) => set("content", e.target.value)} placeholder="Pop-up üzerinde gösterilecek metin..." />
            </CmsField>
            <CmsField label="Bağlantı URL">
              <CmsInput value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} placeholder="https://..." />
            </CmsField>
          </CmsCard>

          <CmsCard title="Görsel">
            <div className="flex flex-col gap-3">
              <label className="cms-label">Pop-up Görseli</label>
              <ImageUpload kind="banner" value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
            </div>
          </CmsCard>
        </div>

        <div className="flex flex-col gap-4">
          <CmsCard title="Görüntüleme Ayarları">
            <CmsField label="Durum">
              <CmsSelect value={form.status} onChange={(e) => set("status", e.target.value as PopupStatus)}>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Pasif</option>
              </CmsSelect>
            </CmsField>
            <CmsField label="Gecikme (saniye)">
              <CmsInput
                type="number"
                min="0"
                value={String(form.displayDelay)}
                onChange={(e) => set("displayDelay", Number(e.target.value))}
              />
            </CmsField>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                role="switch"
                aria-checked={form.displayOnce}
                onClick={() => set("displayOnce", !form.displayOnce)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.displayOnce ? "bg-primary" : "bg-surface-3"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.displayOnce ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <span className="text-[13px] font-bold font-archivo text-ink">Bir kez göster</span>
            </label>
          </CmsCard>

          <CmsCard title="Tarih ve Saat Aralığı">
            <CmsField label="Başlangıç">
              <CmsInput type="datetime-local" max={form.endDate || undefined} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </CmsField>
            <CmsField label="Bitiş">
              <CmsInput type="datetime-local" min={form.startDate || undefined} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </CmsField>
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
            {saving ? "Kaydediliyor..." : popup ? "Güncelle" : "Kaydet"}
          </button>
          <a
            href="/popup"
            className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
          >
            İptal
          </a>
        </div>
      </div>
    </form>
  );
}
