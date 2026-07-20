"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Newspaper } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { name: "", coverImage: "", date: today() };

export default function NewspapersPage() {
  const [items, setItems] = useState<Newspaper[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.newspapers.list().then(setItems);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (editingId) {
      await api.newspapers.update(editingId, form);
    } else {
      await api.newspapers.create(form);
    }
    setForm(EMPTY);
    setEditingId(null);
    await reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu gazete kapağını silmek istediğinize emin misiniz?")) {
      return;
    }
    await api.newspapers.remove(id);
    await reload();
  }

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Gazeteler</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Gazete Adı">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Tarih">
            <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
        </div>
        <Field label="Kapak Görseli">
          <ImageUpload kind="article" value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} />
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
              <th className="py-2">Gazete</th>
              <th className="py-2">Tarih</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((newspaper) => (
              <tr key={newspaper.id} className="border-b border-black/5">
                <td className="py-2">{newspaper.name}</td>
                <td className="py-2 text-black/50">{new Date(newspaper.date).toLocaleDateString("tr-TR")}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(newspaper.id);
                      setForm({ name: newspaper.name, coverImage: newspaper.coverImage, date: newspaper.date.slice(0, 10) });
                    }}
                    className="mr-3 text-black/60 hover:text-black"
                  >
                    Düzenle
                  </button>
                  <button type="button" onClick={() => handleDelete(newspaper.id)} className="text-red-600">
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
