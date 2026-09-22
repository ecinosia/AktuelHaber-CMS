"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Loader2, Plus, X } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import type { Menu, MenuItem, MenuLocation, MenuStatus } from "@/types";
import { CmsCard, CmsField, CmsInput, CmsSelect } from "@/components/ui/CmsCard";

type Draft = { label: string; url: string };

const ICON_BTN =
  "w-8 h-8 flex items-center justify-center border border-line-head rounded text-muted hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default";

export function MenuForm({ menu }: { menu?: Menu & { items: MenuItem[] } }) {
  const router = useRouter();
  const [name, setName] = useState(menu?.name ?? "");
  const [location, setLocation] = useState<MenuLocation>(menu?.location ?? "MAIN");
  const [status, setStatus] = useState<MenuStatus>(menu?.status ?? "ACTIVE");
  const [items, setItems] = useState<Draft[]>(menu?.items.map(({ label, url }) => ({ label, url })) ?? []);
  const [draft, setDraft] = useState<Draft>({ label: "", url: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAdd = draft.label.trim() !== "" && draft.url.trim() !== "";

  function addItem() {
    if (!canAdd) return;
    setItems((prev) => [...prev, { label: draft.label.trim(), url: draft.url.trim() }]);
    setDraft({ label: "", url: "" });
  }

  // Enter in the add-row adds the item instead of submitting the whole menu.
  function onDraftKey(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    addItem();
  }

  function move(i: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const dto = { name: name.trim(), location, status, items };
      if (menu) await api.menu.update(menu.id, dto);
      else await api.menu.create(dto);
      router.push("/menu");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Menü kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="flex flex-col gap-4">
          <CmsCard title="Menü Bilgileri">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CmsField label="Menü Adı *">
                <CmsInput required value={name} onChange={(e) => setName(e.target.value)} placeholder="ör. Ana Menü" />
              </CmsField>
              <CmsField label="Menü Konumu *">
                <CmsSelect value={location} onChange={(e) => setLocation(e.target.value as MenuLocation)}>
                  <option value="MAIN">Header</option>
                  <option value="FOOTER">Footer</option>
                </CmsSelect>
              </CmsField>
              <CmsField label="Durum">
                <CmsSelect value={status} onChange={(e) => setStatus(e.target.value as MenuStatus)}>
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                </CmsSelect>
              </CmsField>
            </div>
          </CmsCard>

          <CmsCard title="Menü Öğeleri">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <CmsField label="Menü Başlığı">
                <CmsInput
                  value={draft.label}
                  onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                  onKeyDown={onDraftKey}
                  placeholder="ör. Haberler"
                />
              </CmsField>
              <CmsField label="URL">
                <CmsInput
                  value={draft.url}
                  onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
                  onKeyDown={onDraftKey}
                  placeholder="/haberler"
                />
              </CmsField>
              <button
                type="button"
                onClick={addItem}
                disabled={!canAdd}
                className="flex items-center justify-center gap-1.5 bg-primary text-white text-[13px] font-extrabold font-archivo px-4 h-[38px] rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Ekle
              </button>
            </div>

            {items.length === 0 ? (
              <p className="m-0 py-8 text-center text-[13px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
                Henüz menü öğesi eklenmedi.
              </p>
            ) : (
              <ul className="m-0 p-0 list-none border border-line rounded-md divide-y divide-line-soft">
                {items.map((it, i) => (
                  <li key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="w-6 text-[12.5px] font-bold text-muted-2 text-center">{i + 1}</span>
                    <span className="flex-1 min-w-0 truncate text-[13px] font-bold font-archivo text-ink">{it.label}</span>
                    <span className="flex-1 min-w-0 truncate text-[13px] text-muted" style={{ fontFamily: "var(--font-public-sans)" }}>
                      {it.url}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button type="button" className={ICON_BTN} disabled={i === 0} onClick={() => move(i, -1)} title="Yukarı taşı">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" className={ICON_BTN} disabled={i === items.length - 1} onClick={() => move(i, 1)} title="Aşağı taşı">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className={`${ICON_BTN} !text-down hover:!bg-down-bg`}
                        onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                        title="Kaldır"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CmsCard>
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
            {saving ? "Kaydediliyor..." : menu ? "Güncelle" : "Kaydet"}
          </button>
          <a
            href="/menu"
            className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
          >
            İptal
          </a>
        </div>
      </div>
    </form>
  );
}
