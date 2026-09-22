"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { api, ApiError, type ColumnWritePayload } from "@/lib/api";
import { omitEmptyStrings } from "@/lib/forms";
import type { Author, Column, ArticleStatus } from "@/types";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { CmsCard, CmsField, CmsInput, CmsSelect, CmsTextarea } from "@/components/ui/CmsCard";
import { Toggle } from "@/components/ui/Toggle";

type FormState = {
  slug: string; title: string; spot: string; content: string;
  coverImageUrl: string; coverImageCardUrl: string; coverImageAlt: string; noIndex: boolean; commentsEnabled: boolean;
  status: ArticleStatus; scheduledAt: string; authorId: string;
};

const EMPTY: FormState = {
  slug: "", title: "", spot: "", content: "",
  coverImageUrl: "", coverImageCardUrl: "", coverImageAlt: "", noIndex: false, commentsEnabled: true,
  status: "DRAFT", scheduledAt: "", authorId: "",
};

const STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: "DRAFT", label: "Taslak" },
  { value: "PENDING_REVIEW", label: "Onay Bekliyor" },
  { value: "SCHEDULED", label: "Zamanlanmış" },
  { value: "PUBLISHED", label: "Yayınla" },
  { value: "ARCHIVED", label: "Arşivlendi" },
];

const STATUS_BG: Record<ArticleStatus, string> = {
  DRAFT: "bg-surface-2 text-muted", PENDING_REVIEW: "bg-pending-bg text-pending",
  SCHEDULED: "bg-blue-100 text-blue-700", PUBLISHED: "bg-up-bg text-up", ARCHIVED: "bg-surface-2 text-muted",
};

const STATUS_TR: Record<ArticleStatus, string> = {
  DRAFT: "Taslak", PENDING_REVIEW: "Onay Bekliyor", SCHEDULED: "Zamanlanmış", PUBLISHED: "Yayında", ARCHIVED: "Arşivlendi",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[12px] text-down m-0" style={{ fontFamily: "var(--font-public-sans)" }}>
      {message}
    </p>
  );
}

function toForm(c: Column): FormState {
  return {
    slug: c.slug, title: c.title, spot: c.spot ?? "", content: c.content,
    coverImageUrl: c.coverImageUrl ?? "", coverImageCardUrl: c.coverImageCardUrl ?? "", coverImageAlt: c.coverImageAlt ?? "",
    noIndex: c.noIndex, commentsEnabled: c.commentsEnabled,
    status: c.status,
    scheduledAt: c.scheduledAt ? c.scheduledAt.slice(0, 16) : "",
    authorId: c.authorId,
  };
}

export function ColumnForm({ column }: { column?: Column }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(column ? toForm(column) : EMPTY);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.authors.list().then(setAuthors);
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!(key in prev)) return prev;
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Başlık zorunludur.";
    if (!form.slug.trim()) errors.slug = "Slug zorunludur.";
    if (!form.spot.trim()) errors.spot = "Spot zorunludur.";
    if (!form.coverImageUrl) errors.coverImageUrl = "Kapak görseli zorunludur.";
    if (form.coverImageUrl && !form.coverImageAlt.trim()) errors.coverImageAlt = "Görsel alt metni zorunludur.";
    if (!form.content.replace(/<[^>]+>/g, "").trim()) errors.content = "İçerik zorunludur.";
    if (!form.authorId) errors.authorId = "Yazar seçin.";
    return errors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Zorunlu alanları kontrol edin.");
      return;
    }
    setSaving(true);
    setError(null);
    const { scheduledAt, ...rest } = form;
    const payload: ColumnWritePayload = {
      ...omitEmptyStrings(rest),
      slug: form.slug, title: form.title, spot: form.spot, content: form.content, authorId: form.authorId,
      scheduledAt: form.status === "SCHEDULED" && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
    };
    try {
      if (column) await api.columns.update(column.id, payload);
      else await api.columns.create(payload);
      router.push("/columns");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Köşe yazısı kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  const allText = form.content.replace(/<[^>]+>/g, "");
  const wordCount = allText.trim() ? allText.trim().split(/\s+/).length : 0;
  const charCount = allText.length;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Save bar */}
      <div className="flex items-center justify-between mb-5">
        <span className={`text-[11px] font-bold font-archivo px-3 py-1 rounded-full ${STATUS_BG[form.status]}`}>
          {STATUS_TR[form.status]}
        </span>
        <div className="flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-1.5 text-[13px] text-down" style={{ fontFamily: "var(--font-public-sans)" }}>
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white text-[13.5px] font-extrabold font-archivo px-5 py-2.5 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Kaydediliyor..." : column ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Main column */}
        <div className="flex flex-col gap-4">
          <CmsCard title="Temel Bilgiler">
            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
              <CmsField label="Başlık*">
                <CmsInput required className={fieldErrors.title ? "cms-input-error" : undefined} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Yazı başlığını girin" />
                <FieldError message={fieldErrors.title} />
              </CmsField>
              <CmsField label="Slug*">
                <CmsInput required className={fieldErrors.slug ? "cms-input-error" : undefined} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="yazi-basligi" />
                <FieldError message={fieldErrors.slug} />
              </CmsField>
            </div>
            <CmsField label="Spot (Özet)*">
              <CmsTextarea required className={fieldErrors.spot ? "cms-input-error" : undefined} rows={2} value={form.spot} onChange={(e) => set("spot", e.target.value)} placeholder="Kısa özet..." />
              <FieldError message={fieldErrors.spot} />
            </CmsField>
          </CmsCard>

          {/* Content / Rich text editor */}
          <CmsCard title="İçerik*">
            <div className={`border-t mt-4 ${fieldErrors.content ? "border-down" : "border-line"}`}>
              <RichTextEditor
                value={form.content}
                onChange={(html) => set("content", html)}
                placeholder="Yazı içeriğini buraya yazın..."
              />
            </div>
            <FieldError message={fieldErrors.content} />
          </CmsCard>

          {/* Cover image */}
          <CmsCard title="Kapak Görseli*">
            <div className={fieldErrors.coverImageUrl ? "rounded-lg ring-1 ring-down" : undefined}>
              <ImageUpload kind="article" value={form.coverImageUrl} onChange={(url) => set("coverImageUrl", url)} onCardChange={(url) => set("coverImageCardUrl", url)} />
            </div>
            <FieldError message={fieldErrors.coverImageUrl} />
            {form.coverImageUrl && (
              <CmsField label="Görsel Alt Metni*">
                <CmsInput className={fieldErrors.coverImageAlt ? "cms-input-error" : undefined} value={form.coverImageAlt} onChange={(e) => set("coverImageAlt", e.target.value)} placeholder="Görseli tanımlayan kısa metin" />
                <FieldError message={fieldErrors.coverImageAlt} />
              </CmsField>
            )}
          </CmsCard>
        </div>

        {/* Sidebar column */}
        <div className="flex flex-col gap-4">
          {/* Publish settings */}
          <CmsCard title="Yayın Ayarları">
            <CmsField label="Durum">
              <CmsSelect value={form.status} onChange={(e) => set("status", e.target.value as ArticleStatus)}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </CmsSelect>
            </CmsField>
            {form.status === "SCHEDULED" && (
              <CmsField label="Yayın Zamanı">
                <CmsInput type="datetime-local" required value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} />
              </CmsField>
            )}
            <CmsField label="Yazar*">
              <CmsSelect required className={fieldErrors.authorId ? "cms-input-error" : undefined} value={form.authorId} onChange={(e) => set("authorId", e.target.value)}>
                <option value="">Seçin</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
              </CmsSelect>
              <FieldError message={fieldErrors.authorId} />
            </CmsField>
          </CmsCard>

          {/* Flags */}
          <CmsCard title="İşaretler">
            <Toggle checked={form.commentsEnabled} onChange={(v) => set("commentsEnabled", v)} label="Yorumlara Açık" />
            <Toggle checked={form.noIndex} onChange={(v) => set("noIndex", v)} label="Arama Motorlarından Gizle" />
          </CmsCard>

          {/* Content stats */}
          <CmsCard title="İçerik İstatistikleri">
            {[
              { label: "Başlık Karakter", value: form.title.length },
              { label: "Kelime Sayısı", value: wordCount },
              { label: "Karakter Sayısı", value: charCount },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-[12.5px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>{label}</span>
                <strong className="text-[12.5px] font-bold font-archivo text-ink">{value}</strong>
              </div>
            ))}
          </CmsCard>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white text-[13.5px] font-extrabold font-archivo py-3 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Kaydediliyor..." : column ? "Güncelle" : "Kaydet"}
            </button>
            <a
              href="/columns"
              className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
            >
              İptal
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}
