"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { AdBanner } from "@/types";
import { omitEmptyStrings } from "@/lib/forms";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { AD_SLOTS } from "@/lib/ad-slots";
import { CmsCard, CmsField, CmsInput,  } from "@/components/ui/CmsCard";

type FormState = {
  name: string;
  company: string;
  startsAt: string; // datetime-local
  endsAt: string;
  slots: string[];
  imageUrl: string;
  linkUrl: string;
  active: boolean;
};

const EMPTY: FormState = { name: "", company: "", startsAt: "", endsAt: "", slots: [], imageUrl: "", linkUrl: "", active: true };

// datetime-local wants "yyyy-mm-ddThh:mm" in local time.
const toLocalInput = (iso: string) => new Date(iso).toLocaleString("sv").slice(0, 16).replace(" ", "T");

function toForm(b: AdBanner): FormState {
  return {
    name: b.name ?? "", company: b.company ?? "",
    startsAt: toLocalInput(b.startsAt),
    endsAt: toLocalInput(b.endsAt),
    slots: b.slots,
    imageUrl: b.imageUrl ?? "", linkUrl: b.linkUrl ?? "",
    active: b.active,
  };
}

export function AdsForm({ banner }: { banner?: AdBanner }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(banner ? toForm(banner) : EMPTY);
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
      if (!form.slots.length) throw new Error("En az bir slot seçin.");
      const payload = {
        ...omitEmptyStrings(form),
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      };
      if (banner) await api.ads.update(banner.id, payload);
      else await api.ads.create({ ...payload, name: form.name, company: form.company, slots: form.slots });
      router.push("/ads");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Reklam kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="flex flex-col gap-4">
          <CmsCard title="Temel Bilgiler">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CmsField label="Reklam Adı">
                <CmsInput required value={form.name} onChange={(e) => set("name", e.target.value)} />
              </CmsField>
              <CmsField label="Firma">
                <CmsInput required value={form.company} onChange={(e) => set("company", e.target.value)} />
              </CmsField>
            </div>
          </CmsCard>

          <CmsCard title="Yayın Alanları (Slot)">
            <div className="flex flex-col gap-3">
              {AD_SLOTS.map((s) => (
                <label key={s.key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={form.slots.includes(s.key)}
                    onChange={(e) =>
                      set("slots", e.target.checked ? [...form.slots, s.key] : form.slots.filter((k) => k !== s.key))
                    }
                  />
                  <span className="text-[13px] font-bold font-archivo text-ink">
                    {s.label}
                    <span className="ml-2 font-normal text-muted">({s.size})</span>
                    {"hint" in s && (
                      <span className="block text-[12px] font-normal text-muted" style={{ fontFamily: "var(--font-public-sans)" }}>{s.hint}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </CmsCard>

          <CmsCard title="Reklam Görseli">
              <div className="flex flex-col gap-3">
                <label className="cms-label">Görsel</label>
                <ImageUpload kind="banner" value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
              </div>
              <CmsField label="Bağlantı URL">
                <CmsInput value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} placeholder="https://..." />
              </CmsField>
            </CmsCard>
        </div>

        <div className="flex flex-col gap-4">
          <CmsCard title="Yayın Tarihleri">
            <CmsField label="Başlangıç">
              <CmsInput type="datetime-local" required value={form.startsAt} max={form.endsAt || undefined} onChange={(e) => set("startsAt", e.target.value)} />
            </CmsField>
            <CmsField label="Bitiş">
              <CmsInput type="datetime-local" required value={form.endsAt} min={form.startsAt || undefined} onChange={(e) => set("endsAt", e.target.value)} />
            </CmsField>
          </CmsCard>

          <CmsCard title="Durum">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                role="switch"
                aria-checked={form.active}
                onClick={() => set("active", !form.active)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? "bg-primary" : "bg-surface-3"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.active ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <span className="text-[13px] font-bold font-archivo text-ink">{form.active ? "Aktif" : "Pasif"}</span>
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
            {saving ? "Kaydediliyor..." : banner ? "Güncelle" : "Kaydet"}
          </button>
          <Link
            href="/ads"
            className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
          >
            İptal
          </Link>
        </div>
      </div>
    </form>
  );
}
