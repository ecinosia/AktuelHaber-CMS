"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Category } from "@/types";
import { omitEmptyStrings } from "@/lib/forms";
import { CmsCard, CmsField, CmsInput, CmsTextarea } from "@/components/ui/CmsCard";

type FormState = { name: string; slug: string; color: string; metaDescription: string };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-");
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[12px] text-down m-0" style={{ fontFamily: "var(--font-public-sans)" }}>
      {message}
    </p>
  );
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    color: category?.color ?? "",
    metaDescription: category?.metaDescription ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!(key in prev)) return prev;
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }

  // Slug follows the name on create only; on edit it's locked (public URL).
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    set("name", name);
    if (!category) set("slug", slugify(name));
  }

  function validate() {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Kategori adı zorunludur.";
    if (!form.slug.trim()) errors.slug = "Slug zorunludur.";
    if (form.color && !HEX.test(form.color)) errors.color = "Geçerli bir renk kodu girin (ör. #1A73E8).";
    if (!form.metaDescription.trim()) errors.metaDescription = "Meta açıklama zorunludur.";
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Zorunlu alanları kontrol edin.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = omitEmptyStrings(form);
      if (category) await api.categories.update(category.id, payload);
      else await api.categories.create({ ...payload, name: form.name, slug: form.slug });
      router.push("/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kategori kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <CmsCard title="Kategori Bilgileri">
          <CmsField label="Kategori Adı*">
            <CmsInput
              className={fieldErrors.name ? "cms-input-error" : undefined}
              value={form.name}
              onChange={handleNameChange}
              placeholder="ör. Ekonomi"
            />
            <FieldError message={fieldErrors.name} />
          </CmsField>
          <CmsField
            label="Slug (URL)*"
            description={category ? "Yayındaki adresi ve SEO'yu bozmamak için mevcut kategorilerde slug değiştirilemez." : "Addan otomatik üretilir; isterseniz düzenleyebilirsiniz."}
          >
            <CmsInput
              className={fieldErrors.slug ? "cms-input-error" : undefined}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              readOnly={Boolean(category)}
              placeholder="ekonomi"
            />
            <FieldError message={fieldErrors.slug} />
          </CmsField>
          <CmsField label="Renk" description="Haber etiketlerinde kullanılır. Boş bırakılırsa gri gösterilir.">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={HEX.test(form.color) ? form.color : "#9CA3AF"}
                onChange={(e) => set("color", e.target.value)}
                className="h-10 w-12 p-1 rounded-md border border-line-strong bg-surface cursor-pointer"
              />
              <CmsInput
                className={`font-mono max-w-[140px] ${fieldErrors.color ? "cms-input-error" : ""}`}
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                placeholder="#1A73E8"
                maxLength={7}
              />
              {form.color && (
                <button type="button" onClick={() => set("color", "")} className="text-[12px] text-muted hover:text-down cursor-pointer">
                  Temizle
                </button>
              )}
            </div>
            <FieldError message={fieldErrors.color} />
          </CmsField>
          <CmsField label="Meta Açıklama*">
            <CmsTextarea
              className={fieldErrors.metaDescription ? "cms-input-error" : undefined}
              rows={3}
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              placeholder="Arama motorları için açıklama"
            />
            <FieldError message={fieldErrors.metaDescription} />
          </CmsField>
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
            {saving ? "Kaydediliyor..." : category ? "Güncelle" : "Kaydet"}
          </button>
          <Link
            href="/categories"
            className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
          >
            İptal
          </Link>
        </div>
      </div>
    </form>
  );
}
