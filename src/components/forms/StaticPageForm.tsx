"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { StaticPage } from "@/types";
import { CmsCard, CmsField, CmsInput, CmsTextarea } from "@/components/ui/CmsCard";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

// Shapes of StaticPage.data, one per FE layout. Keep in sync with AktuelHaber-BE pages.defaults.ts
// and AktuelHaber-FE types/index.ts. Slugs without an entry here fall back to a plain rich-text editor.
type Section = { title: string; text: string };
type Stat = { value: string; label: string };
type Pack = { name: string; size: string; desc: string; price: string };
type Faq = { q: string; a: string };
type Data = { faq?: Faq[]; intro?: string; heroImageUrl?: string; sections?: Section[]; stats?: Stat[]; packages?: Pack[] };

type Layout = { sections?: string; intro?: boolean; hero?: boolean; stats?: boolean; packages?: boolean; faq?: boolean };
const LAYOUTS: Record<string, Layout> = {
  hakkimizda: { intro: true, hero: true, sections: "Bölümler", stats: true },
  "reklam-verin": { intro: true, stats: true, packages: true },
  "geri-bildirim": { intro: true, faq: true },
  "gizlilik-politikasi": { sections: "Bölümler" },
  "kullanim-sartlari": { sections: "Bölümler" },
  "duzeltme-politikasi": { sections: "Bölümler" },
  "yayin-ilkeleri": { sections: "İlkeler" },
};

// Editable list: rows with per-row remove/move and an add button.
function ListEditor<T>({ title, items, blank, onChange, addLabel, children }: {
  title: string; items: T[]; blank: T; onChange: (next: T[]) => void; addLabel: string;
  children: (item: T, patch: (p: Partial<T>) => void) => React.ReactNode;
}) {
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const btn = "text-[12px] font-bold font-archivo text-muted hover:text-primary disabled:opacity-30 cursor-pointer";
  return (
    <CmsCard title={title}>
      {items.map((item, i) => (
        <div key={i} className="border border-line rounded-md p-3.5 flex flex-col gap-3">
          {children(item, (p) => onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x))))}
          <div className="flex gap-4">
            <button type="button" className={btn} disabled={i === 0} onClick={() => move(i, -1)}>↑ Yukarı</button>
            <button type="button" className={btn} disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓ Aşağı</button>
            <button type="button" className={`${btn} ml-auto hover:!text-down`} onClick={() => onChange(items.filter((_, j) => j !== i))}>Kaldır</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, blank])} className="self-start text-[13px] font-extrabold font-archivo text-primary cursor-pointer">
        + {addLabel}
      </button>
    </CmsCard>
  );
}

export function StaticPageForm({ page }: { page: StaticPage }) {
  const router = useRouter();
  const layout = page.data ? LAYOUTS[page.slug] : undefined;
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [data, setData] = useState<Data>((page.data as Data | null) ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Data>(key: K, value: Data[K]) => setData((d) => ({ ...d, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.pages.update(page.id, layout ? { title, data } : { title, content });
      router.push("/pages");
      router.refresh();
    } catch {
      setError("Sayfa kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="flex flex-col gap-4">
          <CmsCard title="Temel Bilgiler">
            <CmsField label="Sayfa Başlığı">
              <CmsInput required value={title} onChange={(e) => setTitle(e.target.value)} />
            </CmsField>
            {layout?.intro && (
              <CmsField label="Giriş Metni">
                <CmsTextarea rows={3} value={data.intro ?? ""} onChange={(e) => set("intro", e.target.value)} />
              </CmsField>
            )}
            {layout?.hero && (
              <div>
                <label className="cms-label">Kapak Görseli</label>
                <ImageUpload kind="banner" value={data.heroImageUrl} onChange={(url) => set("heroImageUrl", url)} />
              </div>
            )}
          </CmsCard>

          {!layout && (
            <div className="bg-surface border border-line rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-line">
                <h2 className="text-[13px] font-extrabold font-archivo text-ink">İçerik</h2>
              </div>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          )}

          {layout?.stats && (
            <ListEditor<Stat> title="İstatistikler" addLabel="İstatistik Ekle" blank={{ value: "", label: "" }} items={data.stats ?? []} onChange={(v) => set("stats", v)}>
              {(s, patch) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CmsField label="Değer"><CmsInput value={s.value} onChange={(e) => patch({ value: e.target.value })} placeholder="2,4M" /></CmsField>
                  <CmsField label="Etiket"><CmsInput value={s.label} onChange={(e) => patch({ label: e.target.value })} placeholder="Aylık Okuyucu" /></CmsField>
                </div>
              )}
            </ListEditor>
          )}

          {layout?.sections && (
            <ListEditor<Section> title={layout.sections} addLabel="Bölüm Ekle" blank={{ title: "", text: "" }} items={data.sections ?? []} onChange={(v) => set("sections", v)}>
              {(s, patch) => (
                <>
                  <CmsField label="Başlık"><CmsInput value={s.title} onChange={(e) => patch({ title: e.target.value })} /></CmsField>
                  <CmsField label="Metin"><CmsTextarea rows={5} value={s.text} onChange={(e) => patch({ text: e.target.value })} /></CmsField>
                </>
              )}
            </ListEditor>
          )}

          {layout?.faq && (
            <ListEditor<Faq> title="Sık Sorulanlar" addLabel="Soru Ekle" blank={{ q: "", a: "" }} items={data.faq ?? []} onChange={(v) => set("faq", v)}>
              {(f, patch) => (
                <>
                  <CmsField label="Soru"><CmsInput value={f.q} onChange={(e) => patch({ q: e.target.value })} /></CmsField>
                  <CmsField label="Cevap"><CmsTextarea rows={3} value={f.a} onChange={(e) => patch({ a: e.target.value })} /></CmsField>
                </>
              )}
            </ListEditor>
          )}

          {layout?.packages && (
            <ListEditor<Pack> title="Reklam Alanları" addLabel="Paket Ekle" blank={{ name: "", size: "", desc: "", price: "" }} items={data.packages ?? []} onChange={(v) => set("packages", v)}>
              {(p, patch) => (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <CmsField label="Ad"><CmsInput value={p.name} onChange={(e) => patch({ name: e.target.value })} /></CmsField>
                    <CmsField label="Ölçü"><CmsInput value={p.size} onChange={(e) => patch({ size: e.target.value })} placeholder="970 x 120" /></CmsField>
                    <CmsField label="Fiyat"><CmsInput value={p.price} onChange={(e) => patch({ price: e.target.value })} placeholder="₺45.000 / hafta" /></CmsField>
                  </div>
                  <CmsField label="Açıklama"><CmsTextarea rows={3} value={p.desc} onChange={(e) => patch({ desc: e.target.value })} /></CmsField>
                </>
              )}
            </ListEditor>
          )}
        </div>

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
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <Link
            href="/pages"
            className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
          >
            İptal
          </Link>
        </div>
      </div>
    </form>
  );
}
