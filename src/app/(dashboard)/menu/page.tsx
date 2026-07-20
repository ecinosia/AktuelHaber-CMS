"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { MenuItem, MenuLocation } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type FormState = { label: string; url: string; position: number; location: MenuLocation };
const EMPTY: FormState = { label: "", url: "", position: 0, location: "MAIN" };

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.menu.list().then((all) => setItems(all.sort((a, b) => a.position - b.position)));
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (editingId) {
      await api.menu.update(editingId, form);
    } else {
      await api.menu.create(form);
    }
    setForm(EMPTY);
    setEditingId(null);
    await reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu menü öğesini silmek istediğinize emin misiniz?")) {
      return;
    }
    await api.menu.remove(id);
    await reload();
  }

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Menü</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Etiket">
            <Input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </Field>
          <Field label="URL">
            <Input required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </Field>
          <Field label="Sıra">
            <Input
              type="number"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
            />
          </Field>
          <Field label="Konum">
            <Select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value as MenuLocation })}
            >
              <option value="MAIN">Ana Menü</option>
              <option value="FOOTER">Footer</option>
            </Select>
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
              <th className="py-2">Etiket</th>
              <th className="py-2">URL</th>
              <th className="py-2">Konum</th>
              <th className="py-2">Sıra</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-black/5">
                <td className="py-2">{item.label}</td>
                <td className="py-2 text-black/50">{item.url}</td>
                <td className="py-2 text-black/50">{item.location === "MAIN" ? "Ana Menü" : "Footer"}</td>
                <td className="py-2 text-black/50">{item.position}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setForm({ label: item.label, url: item.url, position: item.position, location: item.location });
                    }}
                    className="mr-3 text-black/60 hover:text-black"
                  >
                    Düzenle
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="text-red-600">
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
