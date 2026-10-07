"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { api, ApiError, type ArticleWritePayload } from "@/lib/api";
import { omitEmptyStrings } from "@/lib/forms";
import type {
  Article,
  ArticlePlacement,
  ArticleStatus,
  Author,
  Category,
  Tag,
} from "@/types";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  CmsCard,
  CmsField,
  CmsInput,
  CmsSelect,
  CmsTextarea,
} from "@/components/ui/CmsCard";
import { Toggle } from "@/components/ui/Toggle";
import { TagInput } from "@/components/ui/TagInput";
import { GooglePreview } from "@/components/ui/GooglePreview";
import { useConfirm } from "@/components/providers/ConfirmProvider";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[şŞ]/g, "s")
    .replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type FormState = {
  slug: string;
  title: string;
  spot: string;
  content: string;
  coverImageUrl: string;
  coverImageCardUrl: string;
  coverImageAlt: string;
  source: string;
  canonicalUrl: string;
  metaTitle: string;
  metaDescription: string;
  videoUrl: string;
  isBreaking: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  noIndex: boolean;
  commentsEnabled: boolean;
  status: ArticleStatus;
  scheduledAt: string;
  placement: ArticlePlacement;
  categoryId: string;
  authorId: string;
  tagIds: string[];
  pinnedRelatedArticleIds: string[];
};

const EMPTY: FormState = {
  slug: "",
  title: "",
  spot: "",
  content: "",
  coverImageUrl: "",
  coverImageCardUrl: "",
  coverImageAlt: "",
  source: "",
  canonicalUrl: "",
  metaTitle: "",
  metaDescription: "",
  videoUrl: "",
  isBreaking: false,
  isFeatured: false,
  isSponsored: false,
  noIndex: false,
  commentsEnabled: true,
  status: "DRAFT",
  scheduledAt: "",
  placement: "NONE",
  categoryId: "",
  authorId: "",
  tagIds: [],
  pinnedRelatedArticleIds: [],
};

const STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: "DRAFT", label: "Taslak" },
  { value: "PENDING_REVIEW", label: "Onay Bekliyor" },
  { value: "SCHEDULED", label: "Zamanlanmış" },
  { value: "PUBLISHED", label: "Yayınla" },
  { value: "ARCHIVED", label: "Arşivlendi" },
];

const STATUS_BG: Record<ArticleStatus, string> = {
  DRAFT: "bg-surface-2 text-muted",
  PENDING_REVIEW: "bg-pending-bg text-pending",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-up-bg text-up",
  ARCHIVED: "bg-surface-2 text-muted",
};

const STATUS_TR: Record<ArticleStatus, string> = {
  DRAFT: "Taslak",
  PENDING_REVIEW: "Onay Bekliyor",
  SCHEDULED: "Zamanlanmış",
  PUBLISHED: "Yayında",
  ARCHIVED: "Arşivlendi",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[12px] text-down m-0" style={{ fontFamily: "var(--font-public-sans)" }}>
      {message}
    </p>
  );
}

// Google truncates title tags past ~60 chars and meta descriptions past ~155
// in search results — this just warns before the editor finds out live.
function CharCount({ length, max }: { length: number; max: number }) {
  return (
    <p
      className={`text-[12px] m-0 ${length > max ? "text-down" : "text-muted-2"}`}
      style={{ fontFamily: "var(--font-public-sans)" }}
    >
      {length} / {max} karakter{length > max ? " — Google'da kesilebilir" : ""}
    </p>
  );
}

function toForm(a: Article): FormState {
  return {
    slug: a.slug,
    title: a.title,
    spot: a.spot,
    content: a.content,
    coverImageUrl: a.coverImageUrl ?? "",
    coverImageCardUrl: a.coverImageCardUrl ?? "",
    coverImageAlt: a.coverImageAlt ?? "",
    source: a.source ?? "",
    canonicalUrl: a.canonicalUrl ?? "",
    metaTitle: a.metaTitle ?? "",
    metaDescription: a.metaDescription ?? "",
    videoUrl: a.videoUrl ?? "",
    isBreaking: a.isBreaking,
    isFeatured: a.isFeatured,
    isSponsored: a.isSponsored,
    noIndex: a.noIndex,
    commentsEnabled: a.commentsEnabled,
    status: a.status,
    scheduledAt: a.scheduledAt ? a.scheduledAt.slice(0, 16) : "",
    placement: a.placement,
    categoryId: a.categoryId,
    authorId: a.authorId,
    tagIds: a.tags.map((t) => t.id),
    pinnedRelatedArticleIds: a.pinnedRelatedArticleIds,
  };
}

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleString("tr-TR") : "—";

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    article ? toForm(article) : EMPTY,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [relatedCandidates, setRelatedCandidates] = useState<Article[]>([]);
  const [relatedFilter, setRelatedFilter] = useState("");
  const [canPublish, setCanPublish] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(article?.tags ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const confirmDialog = useConfirm();

  // Browser-level leave (tab close, refresh, typing a new address) has no DOM
  // click to intercept, and browsers block custom UI inside this event for
  // phishing-prevention reasons — every browser shows its own generic prompt
  // here regardless, ignoring whatever text is set. Can't be branded.
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // In-app navigation (sidebar links, the Cancel button) never fires
  // beforeunload — Next's <Link> does a client-side transition, and even the
  // plain <a> below doesn't unload until after this handler runs. Catching
  // the click lets us block it and show the shared branded dialog instead of
  // the browser's native confirm().
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!isDirty) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.isContentEditable) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      confirmDialog({
        title: "Kaydedilmemiş değişiklikler",
        message: "Bu sayfadan ayrılırsanız yaptığınız değişiklikler kaybolacak. Yine de ayrılmak istiyor musunuz?",
        confirmLabel: "Sayfadan Ayrıl",
      }).then((ok) => {
        if (ok) {
          setIsDirty(false);
          router.push(href);
        }
      });
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty, confirmDialog, router]);

  useEffect(() => {
    api.categories.list().then(setCategories);
    api.authors.list().then(setAuthors);
    api.auth.me().then((s) => setCanPublish(s.canPublish)).catch(() => undefined);
    api.articles
      .publishedList({ pageSize: 100 })
      .then((r) => setRelatedCandidates(r.items));
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    clearFieldError(key);
  }

  function clearFieldError(key: string) {
    setFieldErrors((prev) => {
      if (!(key in prev)) return prev;
      const rest = { ...prev };
      delete rest[key];
      return rest;
    });
  }

  function handleTagsChange(next: Tag[]) {
    setSelectedTags(next);
    set(
      "tagIds",
      next.map((t) => t.id),
    );
  }

  function toggleRelated(id: string) {
    set(
      "pinnedRelatedArticleIds",
      form.pinnedRelatedArticleIds.includes(id)
        ? form.pinnedRelatedArticleIds.filter((r) => r !== id)
        : [...form.pinnedRelatedArticleIds, id],
    );
  }

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Başlık zorunludur.";
    if (!form.slug.trim()) errors.slug = "Slug zorunludur.";
    if (!form.spot.trim()) errors.spot = "Spot zorunludur.";
    if (!form.content.replace(/<[^>]+>/g, "").trim()) errors.content = "İçerik zorunludur.";
    if (selectedTags.length === 0) errors.tagIds = "En az bir etiket ekleyin.";
    if (!form.coverImageUrl) errors.coverImageUrl = "Kapak görseli zorunludur.";
    if (form.coverImageUrl && !form.coverImageAlt.trim()) errors.coverImageAlt = "Görsel alt metni zorunludur.";
    if (!form.metaTitle.trim()) errors.metaTitle = "Meta başlık zorunludur.";
    if (!form.metaDescription.trim()) errors.metaDescription = "Meta açıklama zorunludur.";
    if (!form.categoryId) errors.categoryId = "Kategori seçin.";
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
    const payload: ArticleWritePayload = {
      ...omitEmptyStrings(rest),
      slug: form.slug,
      title: form.title,
      spot: form.spot,
      content: form.content,
      categoryId: form.categoryId,
      authorId: form.authorId,
      scheduledAt:
        form.status === "SCHEDULED" && scheduledAt
          ? new Date(scheduledAt).toISOString()
          : undefined,
    };
    try {
      if (article) await api.articles.update(article.id, payload);
      else await api.articles.create(payload);
      setIsDirty(false);
      router.push("/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Haber kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  const allText = form.content.replace(/<[^>]+>/g, "");
  const wordCount = allText.trim() ? allText.trim().split(/\s+/).length : 0;
  const charCount = allText.length;
  const imageCount = (form.content.match(/<img/g) ?? []).length;
  const linkCount = (form.content.match(/<a /g) ?? []).length;
  const headingCount = (form.content.match(/<h[1-6]/g) ?? []).length;
  const readingTime = wordCount ? Math.max(1, Math.ceil(wordCount / 200)) : 0;
  const filteredRelated = relatedCandidates.filter(
    (a) =>
      a.id !== article?.id &&
      a.title.toLowerCase().includes(relatedFilter.toLowerCase()),
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Save bar */}
      <div className="flex items-center justify-between mb-5">
        <span
          className={`text-[18px] font-bold font-archivo px-3 py-1 rounded-full ${STATUS_BG[form.status]}`}
        >
          {STATUS_TR[form.status]}
        </span>
        <div className="flex items-center gap-3">
          {error && (
            <div
              className="flex items-center gap-1.5 text-[13px] text-down"
              style={{ fontFamily: "var(--font-public-sans)" }}
            >
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white text-[13.5px] font-extrabold font-archivo px-5 py-2.5 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Kaydediliyor..." : article ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Main column */}
        <div className="flex flex-col gap-4">
          {/* Basic info */}
          <CmsCard title="Temel Bilgiler">
            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
              <CmsField label="Başlık*">
                <CmsInput
                  required
                  className={fieldErrors.title ? "cms-input-error" : undefined}
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      title,
                      ...(article ? {} : { slug: generateSlug(title) }),
                    }));
                    setIsDirty(true);
                    clearFieldError("title");
                    clearFieldError("slug");
                  }}
                  placeholder="Haber başlığını girin"
                />
                <FieldError message={fieldErrors.title} />
              </CmsField>
              <CmsField label="Slug*">
                <CmsInput
                  required
                  className={fieldErrors.slug ? "cms-input-error" : undefined}
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="haber-basligi"
                />
                <FieldError message={fieldErrors.slug} />
              </CmsField>
            </div>
            <CmsField
              label="Spot (Özet)*"
              description="Haber detay sayfasında başlığın altında gösterilir."
            >
              <CmsTextarea
                required
                className={fieldErrors.spot ? "cms-input-error" : undefined}
                rows={2}
                value={form.spot}
                onChange={(e) => set("spot", e.target.value)}
                placeholder="Kısa özet..."
              />
              <FieldError message={fieldErrors.spot} />
            </CmsField>
            <CmsField label="Meta Başlık*">
              <CmsInput
                className={fieldErrors.metaTitle ? "cms-input-error" : undefined}
                value={form.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder="Arama motorları için başlık"
              />
              <CharCount length={form.metaTitle.length} max={60} />
              <FieldError message={fieldErrors.metaTitle} />
            </CmsField>
            <CmsField label="Meta Açıklama*">
              <CmsTextarea
                className={fieldErrors.metaDescription ? "cms-input-error" : undefined}
                rows={2}
                value={form.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                placeholder="Arama motorları için açıklama"
              />
              <CharCount length={form.metaDescription.length} max={155} />
              <FieldError message={fieldErrors.metaDescription} />
            </CmsField>
            <CmsField
              label="Canonical URL"
              description="Boş bırakın — normal haberlerde Google'a gösterilecek adres otomatik hesaplanır. Sadece bu haber başka bir kaynaktan (AA, İHA vb.) birebir alınmışsa ve Google'ın orijinal kaynağı indekslemesini istiyorsanız o kaynağın adresini buraya girin."
            >
              <CmsInput
                value={form.canonicalUrl}
                onChange={(e) => set("canonicalUrl", e.target.value)}
                placeholder="https://..."
              />
            </CmsField>
            <CmsField label="Kaynak">
              <CmsInput
                value={form.source}
                onChange={(e) => set("source", e.target.value)}
                placeholder="AA, İHA, Reuters..."
              />
            </CmsField>
            {/* Tags */}
            <CmsField label="Etiketler*">
              <TagInput
                selected={selectedTags}
                onChange={(next) => {
                  handleTagsChange(next);
                  clearFieldError("tagIds");
                }}
              />
              <FieldError message={fieldErrors.tagIds} />
            </CmsField>
          </CmsCard>

          {/* Cover image */}
          <CmsCard title="Kapak Görseli*">
            <div className={fieldErrors.coverImageUrl ? "rounded-lg ring-1 ring-down" : undefined}>
              <ImageUpload
                kind="article"
                value={form.coverImageUrl}
                onChange={(url) => set("coverImageUrl", url)}
                onCardChange={(url) => set("coverImageCardUrl", url)}
              />
            </div>
            <FieldError message={fieldErrors.coverImageUrl} />
            {form.coverImageUrl && (
              <CmsField label="Görsel Alt Metni*">
                <CmsInput
                  className={fieldErrors.coverImageAlt ? "cms-input-error" : undefined}
                  value={form.coverImageAlt}
                  onChange={(e) => set("coverImageAlt", e.target.value)}
                  placeholder="Görseli tanımlayan kısa metin"
                />
                <FieldError message={fieldErrors.coverImageAlt} />
              </CmsField>
            )}
          </CmsCard>

          {/* Content / Rich text editor */}
          <CmsCard title="İçerik*">
            <div className={`border-t mt-4 ${fieldErrors.content ? "border-down" : "border-line"}`}>
              <RichTextEditor
                value={form.content}
                onChange={(html) => set("content", html)}
                placeholder="Haber içeriğini buraya yazın..."
              />
            </div>
            <FieldError message={fieldErrors.content} />
          </CmsCard>

          {/* Video */}
          <CmsCard title="Video">
            <CmsField
              label="Video URL"
              description="Bu video haber detay sayfasının en üstünde gösterilir — video galerisi haberi değildir."
            >
              <CmsInput
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="https://..."
              />
            </CmsField>
          </CmsCard>

          {/* Related articles */}
          <CmsCard title="İlgili Haberler (maks. 6)">
            <p
              className="text-[12px] text-muted-2 m-0"
              style={{ fontFamily: "var(--font-public-sans)" }}
            >
              Boş bırakılırsa otomatik hesaplanır.
            </p>
            <CmsInput
              placeholder="Başlıkta ara..."
              value={relatedFilter}
              onChange={(e) => setRelatedFilter(e.target.value)}
            />
            <div className="max-h-40 overflow-y-auto rounded-md border border-line divide-y divide-line-soft">
              {filteredRelated.slice(0, 20).map((candidate) => (
                <label
                  key={candidate.id}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-page transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.pinnedRelatedArticleIds.includes(
                      candidate.id,
                    )}
                    onChange={() => toggleRelated(candidate.id)}
                    className="accent-primary"
                    disabled={
                      !form.pinnedRelatedArticleIds.includes(candidate.id) &&
                      form.pinnedRelatedArticleIds.length >= 6
                    }
                  />
                  <span
                    className="text-[12.5px] text-body truncate"
                    style={{ fontFamily: "var(--font-public-sans)" }}
                  >
                    {candidate.title}
                  </span>
                </label>
              ))}
            </div>
          </CmsCard>

          {/* URL history — view-only, not part of FormState/payload. Shows
              why an old link still resolves; editing happens by changing the
              slug above, not here. */}
          {article && article.previousSlugs.length > 0 && (
            <CmsCard title="URL Geçmişi">
              <p
                className="text-[12px] text-muted-2 m-0"
                style={{ fontFamily: "var(--font-public-sans)" }}
              >
                Bu haberin önceki slug değerleri — eski bağlantılar otomatik
                olarak güncel adrese yönlendirilir.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {article.previousSlugs.map((slug) => (
                  <span
                    key={slug}
                    className="rounded-full border border-line-strong px-2.5 py-0.5 text-[12px] font-mono text-muted-2"
                  >
                    {slug}
                  </span>
                ))}
              </div>
            </CmsCard>
          )}
        </div>

        {/* Sidebar column */}
        <div className="flex flex-col gap-4">
          {/* Publish settings */}
          <CmsCard title="Yayın Ayarları">
            <CmsField label="Durum">
              <CmsSelect
                value={form.status}
                onChange={(e) => set("status", e.target.value as ArticleStatus)}
              >
                {STATUS_OPTIONS.filter(
                  (s) =>
                    canPublish ||
                    s.value === form.status ||
                    (s.value !== "PUBLISHED" && s.value !== "SCHEDULED"),
                ).map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </CmsSelect>
            </CmsField>
            {form.status === "SCHEDULED" && (
              <CmsField label="Yayın Zamanı">
                <CmsInput
                  type="datetime-local"
                  required
                  value={form.scheduledAt}
                  onChange={(e) => set("scheduledAt", e.target.value)}
                />
              </CmsField>
            )}
            <CmsField label="Kategori*">
              <CmsSelect
                required
                className={fieldErrors.categoryId ? "cms-input-error" : undefined}
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
              >
                <option value="">Seçin</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </CmsSelect>
              <FieldError message={fieldErrors.categoryId} />
            </CmsField>
            <CmsField label="Yazar*">
              <CmsSelect
                required
                className={fieldErrors.authorId ? "cms-input-error" : undefined}
                value={form.authorId}
                onChange={(e) => set("authorId", e.target.value)}
              >
                <option value="">Seçin</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName}
                  </option>
                ))}
              </CmsSelect>
              <FieldError message={fieldErrors.authorId} />
            </CmsField>
          </CmsCard>

          {/* Placement */}
          <CmsCard title="Manşet Yerleşimi">
            <CmsField label="Yerleşim">
              <CmsSelect
                value={form.placement}
                onChange={(e) =>
                  set("placement", e.target.value as ArticlePlacement)
                }
              >
                <option value="NONE">Yok</option>
                <option value="UST_MANSET_1">Üst Manşet 1</option>
                <option value="UST_MANSET_2">Üst Manşet 2</option>
                <option value="ANA_MANSET">Ana Manşet</option>
                <option value="ALT_MANSET">Alt Manşet</option>
              </CmsSelect>
            </CmsField>
          </CmsCard>

          {/* Flags */}
          <CmsCard title="İşaretler">
            <Toggle
              checked={form.isBreaking}
              onChange={(v) => set("isBreaking", v)}
              label="Son Dakika"
            />
            <Toggle
              checked={form.isFeatured}
              onChange={(v) => set("isFeatured", v)}
              label="Öne Çıkan"
            />
            <Toggle
              checked={form.isSponsored}
              onChange={(v) => set("isSponsored", v)}
              label="Sponsorlu İçerik"
            />
            <Toggle
              checked={form.noIndex}
              onChange={(v) => set("noIndex", v)}
              label="Arama Motorlarından Gizle"
            />
            <Toggle
              checked={form.commentsEnabled}
              onChange={(v) => set("commentsEnabled", v)}
              label="Yorumlara Açık"
            />
          </CmsCard>

          {/* Article info (read-only, existing articles only) */}
          {article && (
            <CmsCard title="Haber Bilgileri">
              {[
                ["Görüntülenme", article.viewCount.toLocaleString("tr-TR")],
                ["Planlanan Tarih", fmtDate(article.scheduledAt)],
                ["Yayın Tarihi", fmtDate(article.publishedAt)],
                ["Legacy Kaynak ID", article.legacySourceId ?? "—"],
                ["Legacy Yol", article.legacyPath ?? "—"],
                ["İçe Aktarıldı", article.legacySourceId ? "Evet" : "Hayır"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start gap-3">
                  <span
                    className="text-[12.5px] text-muted-2 shrink-0"
                    style={{ fontFamily: "var(--font-public-sans)" }}
                  >
                    {label}
                  </span>
                  <strong className="text-[12.5px] font-bold font-archivo text-ink text-right break-all">
                    {value}
                  </strong>
                </div>
              ))}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-line">
                <span
                  className="text-[12.5px] text-muted-2"
                  style={{ fontFamily: "var(--font-public-sans)" }}
                >
                  Eski Slug&apos;lar ({article.previousSlugs.length})
                </span>
                {article.previousSlugs.length ? (
                  article.previousSlugs.map((s) => (
                    <code
                      key={s}
                      className="text-[11.5px] text-ink bg-black/5 rounded px-2 py-1 break-all"
                    >
                      /{s}
                    </code>
                  ))
                ) : (
                  <span className="text-[12.5px] text-ink">—</span>
                )}
              </div>
            </CmsCard>
          )}

          {/* Google preview */}
          <CmsCard title="Google Önizleme">
            <GooglePreview
              title={form.title}
              metaTitle={form.metaTitle}
              metaDescription={form.metaDescription}
              spot={form.spot}
              slug={form.slug}
            />
          </CmsCard>

          {/* Content stats */}
          <CmsCard title="İçerik İstatistikleri">
            {[
              { label: "Başlık Karakter", value: form.title.length },
              { label: "Kelime Sayısı", value: wordCount },
              { label: "Karakter Sayısı", value: charCount },
              { label: "Başlık (H1-H6)", value: headingCount },
              { label: "Görsel", value: imageCount },
              { label: "Bağlantı", value: linkCount },
              { label: "Okuma Süresi", value: `${readingTime} dk` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span
                  className="text-[12.5px] text-muted-2"
                  style={{ fontFamily: "var(--font-public-sans)" }}
                >
                  {label}
                </span>
                <strong className="text-[12.5px] font-bold font-archivo text-ink">
                  {value}
                </strong>
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
              {saving ? "Kaydediliyor..." : article ? "Güncelle" : "Kaydet"}
            </button>
            <Link
              href="/articles"
              className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
            >
              İptal
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
