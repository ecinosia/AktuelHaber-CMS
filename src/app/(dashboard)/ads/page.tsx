"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdBanner, AdBannerType } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { omitEmptyStrings } from "@/lib/forms";

type FormState = {
  slot: string;
  type: AdBannerType;
  imageUrl: string;
  linkUrl: string;
  adUnitCode: string;
  active: boolean;
};

const EMPTY: FormState = { slot: "", type: "STATIC", imageUrl: "", linkUrl: "", adUnitCode: "", active: true };

function toForm(banner: AdBanner): FormState {
  return {
    slot: banner.slot,
    type: banner.type,
    imageUrl: banner.imageUrl ?? "",
    linkUrl: banner.linkUrl ?? "",
    adUnitCode: banner.adUnitCode ?? "",
    active: banner.active,
  };
}

export default function AdsPage() {
  const [items, setItems] = useState<AdBanner[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.ads.adminList().then(setItems);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = omitEmptyStrings(form);
    if (editingId) {
      await api.ads.update(editingId, payload);
    } else {
      await api.ads.create({ ...payload, slot: form.slot, type: form.type });
    }
    setForm(EMPTY);
    setEditingId(null);
    await reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu reklamı silmek istediğinize emin misiniz?")) {
      return;
    }
    await api.ads.remove(id);
    await reload();
  }

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Reklamlar</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Slot">
            <Input
              required
              placeholder="header-728x90, sidebar-300x250, ..."
              value={form.slot}
              onChange={(e) => set("slot", e.target.value)}
            />
          </Field>
          <Field label="Tür">
            <Select value={form.type} onChange={(e) => set("type", e.target.value as AdBannerType)}>
              <option value="STATIC">Statik (Görsel)</option>
              <option value="ADSENSE">AdSense / GPT</option>
            </Select>
          </Field>
        </div>

        {form.type === "STATIC" ? (
          <>
            <Field label="Görsel">
              <ImageUpload kind="banner" value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
            </Field>
            <Field label="Bağlantı URL">
              <Input value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} />
            </Field>
          </>
        ) : (
          <Field label="AdSense / GPT Kodu">
            <Textarea rows={4} value={form.adUnitCode} onChange={(e) => set("adUnitCode", e.target.value)} />
          </Field>
        )}

        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
          Aktif
        </label>

        <div className="flex gap-2">
          <Button type="submit">{editingId ? "Güncelle" : "Ekle"}</Button>
          {editingId && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY);
              }}
            >
              Vazgeç
            </Button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-black/60">Yükleniyor...</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              <th className="py-2">Slot</th>
              <th className="py-2">Tür</th>
              <th className="py-2">Önizleme</th>
              <th className="py-2">Durum</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((banner) => (
              <tr key={banner.id} className="border-b border-black/5">
                <td className="py-2">{banner.slot}</td>
                <td className="py-2 text-black/50">{banner.type === "STATIC" ? "Statik" : "AdSense"}</td>
                <td className="py-2">
                  {banner.type === "STATIC" && banner.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={banner.imageUrl} alt="" className="h-10 w-20 object-cover" />
                  ) : (
                    <span className="text-black/40">—</span>
                  )}
                </td>
                <td className="py-2 text-black/50">{banner.active ? "Aktif" : "Pasif"}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(banner.id);
                      setForm(toForm(banner));
                    }}
                    className="mr-3 text-black/60 hover:text-black"
                  >
                    Düzenle
                  </button>
                  <button type="button" onClick={() => handleDelete(banner.id)} className="text-red-600">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
