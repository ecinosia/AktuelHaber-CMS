"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HoroscopeEntry } from "@/types";
import { ZODIAC_SIGNS } from "@/lib/zodiac";
import { Field } from "@/components/ui/Field";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY: { sign: string; date: string; text: string } = { sign: ZODIAC_SIGNS[0].slug, date: today(), text: "" };

export default function HoroscopePage() {
  const [items, setItems] = useState<HoroscopeEntry[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.horoscope.list().then((all) =>
      setItems(all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
    );
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await api.horoscope.upsert(form);
    setForm({ ...EMPTY, sign: form.sign });
    await reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
      return;
    }
    await api.horoscope.remove(id);
    await reload();
  }

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Burç Yorumları</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Burç">
            <Select value={form.sign} onChange={(e) => setForm({ ...form, sign: e.target.value })}>
              {ZODIAC_SIGNS.map((sign) => (
                <option key={sign.slug} value={sign.slug}>
                  {sign.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tarih">
            <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
        </div>
        <Field label="Yorum">
          <Textarea required rows={4} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
        </Field>
        <Button type="submit">Kaydet</Button>
      </form>

      {loading ? (
        <p className="text-black/60">Yükleniyor...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between rounded border border-black/10 bg-white p-3 text-sm">
              <div>
                <p className="font-semibold">
                  {ZODIAC_SIGNS.find((s) => s.slug === entry.sign)?.name ?? entry.sign} —{" "}
                  {new Date(entry.date).toLocaleDateString("tr-TR")}
                </p>
                <p className="mt-1 text-black/60">{entry.text}</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button type="button" onClick={() => setForm({ sign: entry.sign, date: entry.date.slice(0, 10), text: entry.text })} className="text-black/60 hover:text-black">
                  Düzenle
                </button>
                <button type="button" onClick={() => handleDelete(entry.id)} className="text-red-600">
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
