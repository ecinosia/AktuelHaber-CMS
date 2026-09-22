"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Author, AuthorPublishType, AuthorStatus } from "@/types";
import { omitEmptyStrings } from "@/lib/forms";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { CmsCard, CmsField, CmsInput, CmsSelect, CmsTextarea } from "@/components/ui/CmsCard";

type FormState = {
  slug: string; firstName: string; lastName: string; title: string; email: string;
  facebookUrl: string; twitterUrl: string; instagramUrl: string; youtubeUrl: string; avatarUrl: string;
  bio: string; publishType: AuthorPublishType; status: AuthorStatus;
};

const EMPTY: FormState = {
  slug: "", firstName: "", lastName: "", title: "", email: "",
  facebookUrl: "", twitterUrl: "", instagramUrl: "", youtubeUrl: "", avatarUrl: "",
  bio: "", publishType: "DIRECT", status: "ACTIVE",
};

function toForm(a: Author): FormState {
  return {
    slug: a.slug, firstName: a.firstName, lastName: a.lastName,
    title: a.title ?? "", email: a.email ?? "",
    facebookUrl: a.facebookUrl ?? "", twitterUrl: a.twitterUrl ?? "", instagramUrl: a.instagramUrl ?? "",
    youtubeUrl: a.youtubeUrl ?? "",
    avatarUrl: a.avatarUrl ?? "", bio: a.bio ?? "",
    publishType: a.publishType, status: a.status,
  };
}

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s]+/g, "-").replace(/-+/g, "-");
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[12px] text-down m-0" style={{ fontFamily: "var(--font-public-sans)" }}>
      {message}
    </p>
  );
}

export function AuthorForm({ author }: { author?: Author }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(author ? toForm(author) : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function clearFieldError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    clearFieldError(key);
  }

  function validate() {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = "Ad zorunludur.";
    if (!form.lastName.trim()) errors.lastName = "Soyad zorunludur.";
    if (!form.slug.trim()) errors.slug = "Slug zorunludur.";
    if (!form.title.trim()) errors.title = "Ünvan zorunludur.";
    if (!form.email.trim()) errors.email = "E-posta zorunludur.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Geçerli bir e-posta girin.";
    if (!form.bio.trim()) errors.bio = "Hakkında zorunludur.";
    return errors;
  }

  function handleNameChange(field: "firstName" | "lastName", value: string) {
    clearFieldError(field);
    clearFieldError("slug");
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (!author) {
        updated.slug = slugify(`${updated.firstName} ${updated.lastName}`);
      }
      return updated;
    });
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
      if (author) await api.authors.update(author.id, payload);
      else await api.authors.create({ ...payload, slug: form.slug, firstName: form.firstName, lastName: form.lastName });
      router.push("/authors");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yazar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="flex flex-col gap-4">
          <CmsCard title="Temel Bilgiler">
            <div className="flex flex-col gap-3">
              <label className="cms-label">Fotoğraf / Avatar</label>
              <ImageUpload kind="avatar" value={form.avatarUrl} onChange={(url) => set("avatarUrl", url)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CmsField label="Ad*">
                <CmsInput className={fieldErrors.firstName ? "cms-input-error" : undefined} value={form.firstName} onChange={(e) => handleNameChange("firstName", e.target.value)} />
                <FieldError message={fieldErrors.firstName} />
              </CmsField>
              <CmsField label="Soyad*">
                <CmsInput className={fieldErrors.lastName ? "cms-input-error" : undefined} value={form.lastName} onChange={(e) => handleNameChange("lastName", e.target.value)} />
                <FieldError message={fieldErrors.lastName} />
              </CmsField>
              <CmsField label="Slug (URL)*">
                <CmsInput className={fieldErrors.slug ? "cms-input-error" : undefined} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="ad-soyad" />
                <FieldError message={fieldErrors.slug} />
              </CmsField>
              <CmsField label="Ünvan*">
                <CmsInput className={fieldErrors.title ? "cms-input-error" : undefined} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="ör. Ekonomi Editörü" />
                <FieldError message={fieldErrors.title} />
              </CmsField>
              <CmsField label="E-posta*">
                <CmsInput type="email" className={fieldErrors.email ? "cms-input-error" : undefined} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="yazar@habermerkezi.com" />
                <FieldError message={fieldErrors.email} />
              </CmsField>
            </div>
            <CmsField label="Hakkında*">
              <CmsTextarea rows={3} className={fieldErrors.bio ? "cms-input-error" : undefined} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Yazar hakkında kısa bilgi..." />
              <FieldError message={fieldErrors.bio} />
            </CmsField>
          </CmsCard>

          <CmsCard title="Sosyal Medya">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CmsField label="Twitter / X">
                <CmsInput value={form.twitterUrl} onChange={(e) => set("twitterUrl", e.target.value)} placeholder="https://twitter.com/..." />
              </CmsField>
              <CmsField label="Instagram">
                <CmsInput value={form.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/..." />
              </CmsField>
              <CmsField label="Facebook">
                <CmsInput value={form.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/..." />
              </CmsField>
              <CmsField label="YouTube">
                <CmsInput value={form.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/..." />
              </CmsField>
            </div>
          </CmsCard>
        </div>

        <div className="flex flex-col gap-4">
          <CmsCard title="Yayın Ayarları">
            <CmsField label="Yayın Türü">
              <CmsSelect value={form.publishType} onChange={(e) => set("publishType", e.target.value as AuthorPublishType)}>
                <option value="DIRECT">Doğrudan Yayınla</option>
                <option value="REQUIRES_APPROVAL">Onay Gerekli</option>
              </CmsSelect>
            </CmsField>
            <CmsField label="Durum">
              <CmsSelect value={form.status} onChange={(e) => set("status", e.target.value as AuthorStatus)}>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Pasif</option>
              </CmsSelect>
            </CmsField>
          </CmsCard>

          {error && (
            <div className="flex items-center gap-1.5 text-down text-[13px] bg-down-bg border border-down/20 rounded-md px-4 py-3" style={{ fontFamily: "var(--font-public-sans)" }}>
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white text-[13.5px] font-extrabold font-archivo py-3 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Kaydediliyor..." : author ? "Güncelle" : "Kaydet"}
          </button>
          <a
            href="/authors"
            className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
          >
            İptal
          </a>
        </div>
      </div>
    </form>
  );
}
