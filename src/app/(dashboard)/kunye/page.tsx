"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { MastheadMember } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const EMPTY = { name: "", title: "" };

export default function MastheadPage() {
  const [items, setItems] = useState<MastheadMember[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.masthead.list().then((all) => setItems(all.sort((a, b) => a.order - b.order)));
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (editingId) {
      await api.masthead.update(editingId, form);
    } else {
      await api.masthead.create(form);
    }
    setForm(EMPTY);
    setEditingId(null);
    await reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kişiyi silmek istediğinize emin misiniz?")) {
      return;
    }
    await api.masthead.remove(id);
    await reload();
  }

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) {
      return;
    }
    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setItems(reordered);
    await api.masthead.reorder(reordered.map((item) => item.id));
    await reload();
  }

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Künye</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ad Soyad">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Ünvan">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
        <ul className="flex flex-col gap-2">
          {items.map((member, index) => (
            <li key={member.id} className="flex items-center justify-between rounded border border-black/10 bg-white p-3">
              <div>
                <span className="font-semibold">{member.name}</span>
                <span className="ml-2 text-sm text-black/50">{member.title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="disabled:opacity-30">
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(member.id);
                    setForm({ name: member.name, title: member.title });
                  }}
                  className="text-black/60 hover:text-black"
                >
                  Düzenle
                </button>
                <button type="button" onClick={() => handleDelete(member.id)} className="text-red-600">
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
