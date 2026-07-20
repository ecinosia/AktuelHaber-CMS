"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const EMPTY = { slug: "", name: "" };

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.categories.list().then(setItems);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (editingId) {
      await api.categories.update(editingId, form);
    } else {
      await api.categories.create(form);
    }
    setForm(EMPTY);
    setEditingId(null);
    await reload();
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({ slug: category.slug, name: category.name });
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
      return;
    }
    await api.categories.remove(id);
    await reload();
  }

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Kategoriler</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ad">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Slug">
            <Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </Field>
        </div>
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
              <th className="py-2">Ad</th>
              <th className="py-2">Slug</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((category) => (
              <tr key={category.id} className="border-b border-black/5">
                <td className="py-2">{category.name}</td>
                <td className="py-2 text-black/50">{category.slug}</td>
                <td className="py-2 text-right">
                  <button type="button" onClick={() => startEdit(category)} className="mr-3 text-black/60 hover:text-black">
                    Düzenle
                  </button>
                  <button type="button" onClick={() => handleDelete(category.id)} className="text-red-600">
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
