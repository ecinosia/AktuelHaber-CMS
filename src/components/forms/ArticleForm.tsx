"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ArticleWritePayload } from "@/lib/api";
import { omitEmptyStrings } from "@/lib/forms";
import type { Article, ArticlePlacement, ArticleStatus, Author, Category, Tag } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";

type FormState = {
  slug: string;
  title: string;
  spot: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  source: string;
  canonicalUrl: string;
  isBreaking: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  noIndex: boolean;
  status: ArticleStatus;
  scheduledAt: string;
  placement: ArticlePlacement;
  placementOrder: string;
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
  coverImageAlt: "",
  source: "",
  canonicalUrl: "",
  isBreaking: false,
  isFeatured: false,
  isSponsored: false,
  noIndex: false,
  status: "DRAFT",
  scheduledAt: "",
  placement: "NONE",
  placementOrder: "",
  categoryId: "",
  authorId: "",
  tagIds: [],
  pinnedRelatedArticleIds: [],
};

function toForm(article: Article): FormState {
  return {
    slug: article.slug,
    title: article.title,
    spot: article.spot,
    content: article.content,
    coverImageUrl: article.coverImageUrl ?? "",
    coverImageAlt: article.coverImageAlt ?? "",
    source: article.source ?? "",
    canonicalUrl: article.canonicalUrl ?? "",
    isBreaking: article.isBreaking,
    isFeatured: article.isFeatured,
    isSponsored: article.isSponsored,
    noIndex: article.noIndex,
    status: article.status,
    scheduledAt: article.scheduledAt ? article.scheduledAt.slice(0, 16) : "",
    placement: article.placement,
    placementOrder: article.placementOrder?.toString() ?? "",
    categoryId: article.categoryId,
    authorId: article.authorId,
    tagIds: article.tags.map((t) => t.id),
    pinnedRelatedArticleIds: article.pinnedRelatedArticleIds,
  };
}

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(article ? toForm(article) : EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [relatedCandidates, setRelatedCandidates] = useState<Article[]>([]);
  const [relatedFilter, setRelatedFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.categories.list().then(setCategories);
    api.authors.list().then(setAuthors);
    api.tags.list().then(setTags);
    api.articles.adminList({ pageSize: 100 }).then((result) => setRelatedCandidates(result.items));
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(id: string) {
    set("tagIds", form.tagIds.includes(id) ? form.tagIds.filter((t) => t !== id) : [...form.tagIds, id]);
  }

  function toggleRelated(id: string) {
    set(
      "pinnedRelatedArticleIds",
      form.pinnedRelatedArticleIds.includes(id)
        ? form.pinnedRelatedArticleIds.filter((r) => r !== id)
        : [...form.pinnedRelatedArticleIds, id],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const { placementOrder, scheduledAt, ...rest } = form;
    const payload: ArticleWritePayload = {
      ...omitEmptyStrings(rest),
      slug: form.slug,
      title: form.title,
      spot: form.spot,
      content: form.content,
      categoryId: form.categoryId,
      authorId: form.authorId,
      placementOrder: placementOrder ? Number(placementOrder) : undefined,
      scheduledAt: form.status === "SCHEDULED" && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
    };

    try {
      if (article) {
        await api.articles.update(article.id, payload);
      } else {
        await api.articles.create(payload);
      }
      router.push("/articles");
      router.refresh();
    } catch {
      setError("Haber kaydedilemedi. Zorunlu alanları kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  const filteredRelated = relatedCandidates
    .filter((a) => a.id !== article?.id)
    .filter((a) => a.title.toLowerCase().includes(relatedFilter.toLowerCase()));

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <Field label="Başlık">
        <Input required value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Slug">
        <Input required value={form.slug} onChange={(e) => set("slug", e.target.value)} />
      </Field>
      <Field label="Spot">
        <Textarea required rows={2} value={form.spot} onChange={(e) => set("spot", e.target.value)} />
      </Field>
      <Field label="İçerik (HTML)">
        <Textarea required rows={10} value={form.content} onChange={(e) => set("content", e.target.value)} />
      </Field>

      <Field label="Kapak Görseli">
        <ImageUpload kind="article" value={form.coverImageUrl} onChange={(url) => set("coverImageUrl", url)} />
      </Field>
      <Field label="Kapak Görseli Alt Metni">
        <Input value={form.coverImageAlt} onChange={(e) => set("coverImageAlt", e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Kategori">
          <Select required value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            <option value="">Seçin</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Yazar">
          <Select required value={form.authorId} onChange={(e) => set("authorId", e.target.value)}>
            <option value="">Seçin</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.firstName} {a.lastName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Kaynak">
          <Input value={form.source} onChange={(e) => set("source", e.target.value)} placeholder="AA, İHA, ..." />
        </Field>
        <Field label="Canonical URL">
          <Input value={form.canonicalUrl} onChange={(e) => set("canonicalUrl", e.target.value)} />
        </Field>
      </div>

      <Field label="Etiketler">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${
                form.tagIds.includes(tag.id) ? "border-black bg-black text-white" : "border-black/20"
              }`}
            >
              <input type="checkbox" className="hidden" checked={form.tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
              {tag.name}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Yerleşim (Manşet)">
          <Select value={form.placement} onChange={(e) => set("placement", e.target.value as ArticlePlacement)}>
            <option value="NONE">Yok</option>
            <option value="UST_MANSET_1">Üst Manşet 1</option>
            <option value="UST_MANSET_2">Üst Manşet 2</option>
            <option value="ANA_MANSET">Ana Manşet</option>
            <option value="ALT_MANSET">Alt Manşet</option>
          </Select>
        </Field>
        <Field label="Yerleşim Sırası">
          <Input
            type="number"
            value={form.placementOrder}
            onChange={(e) => set("placementOrder", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Durum">
          <Select value={form.status} onChange={(e) => set("status", e.target.value as ArticleStatus)}>
            <option value="DRAFT">Taslak</option>
            <option value="PENDING_REVIEW">Onay Bekliyor</option>
            <option value="SCHEDULED">Zamanlanmış</option>
            <option value="PUBLISHED">Yayınla</option>
            <option value="ARCHIVED">Arşivlendi</option>
          </Select>
        </Field>
        {form.status === "SCHEDULED" && (
          <Field label="Yayın Zamanı">
            <Input
              type="datetime-local"
              required
              value={form.scheduledAt}
              onChange={(e) => set("scheduledAt", e.target.value)}
            />
          </Field>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isBreaking} onChange={(e) => set("isBreaking", e.target.checked)} />
          Son Dakika
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
          Öne Çıkan
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isSponsored} onChange={(e) => set("isSponsored", e.target.checked)} />
          Sponsorlu İçerik
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.noIndex} onChange={(e) => set("noIndex", e.target.checked)} />
          Arama Motorlarından Gizle (noindex)
        </label>
      </div>

      <Field label="İlgili Haberler (manuel seçim — boş bırakılırsa otomatik hesaplanır)">
        <Input
          placeholder="Haber başlığında ara..."
          value={relatedFilter}
          onChange={(e) => setRelatedFilter(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-40 overflow-y-auto rounded border border-black/10 p-2">
          {filteredRelated.slice(0, 20).map((candidate) => (
            <label key={candidate.id} className="flex items-center gap-2 py-1 text-sm">
              <input
                type="checkbox"
                checked={form.pinnedRelatedArticleIds.includes(candidate.id)}
                onChange={() => toggleRelated(candidate.id)}
              />
              {candidate.title}
            </label>
          ))}
        </div>
      </Field>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Kaydediliyor..." : article ? "Güncelle" : "Oluştur"}
      </Button>
    </form>
  );
}
