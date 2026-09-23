"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Tag } from "@/types";
import { CmsCard, CmsField, CmsInput } from "@/components/ui/CmsCard";

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s]+/g, "-").replace(/-+/g, "-");
}

type FormState = { name: string; slug: string };
const EMPTY: FormState = { name: "", slug: "" };
const toForm = (t: Tag): FormState => ({ name: t.name, slug: t.slug });

export function TagForm({ tag }: { tag?: Tag }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(tag ? toForm(tag) : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setForm((prev) => ({ name: value, slug: tag ? prev.slug : slugify(value) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (tag) await api.tags.update(tag.id, form);
      else await api.tags.create(form);
      router.push("/tags");
      router.refresh();
    } catch {
      setError("Etiket kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <CmsCard title="Etiket Bilgileri">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CmsField label="Ad">
              <CmsInput
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="ör. Ekonomi"
              />
            </CmsField>
            <CmsField label="Slug (URL)">
              <CmsInput
                required
                readOnly={!!tag}
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="ekonomi"
              />
            </CmsField>
          </div>
        </CmsCard>

        <div className="flex flex-col gap-4">
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
            {saving ? "Kaydediliyor..." : tag ? "Güncelle" : "Kaydet"}
          </button>
          <Link
            href="/tags"
            className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
          >
            İptal
          </Link>
        </div>
      </div>
    </form>
  );
}
