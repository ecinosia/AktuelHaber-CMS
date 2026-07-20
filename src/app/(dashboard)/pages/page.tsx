"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { StaticPage } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const EMPTY = { slug: "", title: "", content: "" };

// Backs Hakkımızda, Gizlilik Politikası, Çerez Politikası, Kullanım
// Şartları, Yayın İlkeleri, Etik İlkeler, Düzeltme Politikası, Kaynak
// Politikası, Geri Bildirim — one model, one screen, one FE catch-all route.
export default function PagesPage() {
  const [items, setItems] = useState<StaticPage[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.pages.list().then(setItems);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (editingId) {
      await api.pages.update(editingId, form);
    } else {
      await api.pages.create(form);
    }
    setForm(EMPTY);
    setEditingId(null);
    await reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu sayfayı silmek istediğinize emin misiniz?")) {
      return;
    }
    await api.pages.remove(id);
    await reload();
  }

  return (
    <main className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Sayfalar</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Başlık">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Slug">
            <Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </Field>
        </div>
        <Field label="İçerik (HTML)">
          <Textarea required rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
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
              <th className="py-2">Başlık</th>
              <th className="py-2">Slug</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((page) => (
              <tr key={page.id} className="border-b border-black/5">
                <td className="py-2">{page.title}</td>
                <td className="py-2 text-black/50">/{page.slug}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(page.id);
                      setForm({ slug: page.slug, title: page.title, content: page.content });
                    }}
                    className="mr-3 text-black/60 hover:text-black"
                  >
                    Düzenle
                  </button>
                  <button type="button" onClick={() => handleDelete(page.id)} className="text-red-600">
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
