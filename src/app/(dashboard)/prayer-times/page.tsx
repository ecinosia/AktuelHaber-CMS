"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PrayerTime } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/providers/ConfirmProvider";

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { city: "", date: today(), imsak: "", gunes: "", ogle: "", ikindi: "", aksam: "", yatsi: "" };

export default function PrayerTimesPage() {
  const [items, setItems] = useState<PrayerTime[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const confirmDialog = useConfirm();

  function reload() {
    return api.prayerTimes.list().then((all) =>
      setItems(all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
    );
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await api.prayerTimes.upsert(form);
    setForm({ ...EMPTY, city: form.city });
    await reload();
  }

  async function handleDelete(id: string) {
    if (!(await confirmDialog("Bu kaydı silmek istediğinize emin misiniz?"))) {
      return;
    }
    await api.prayerTimes.remove(id);
    await reload();
  }

  return (
    <main className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Namaz Vakitleri</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Şehir">
            <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Field label="Tarih">
            <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {(["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"] as const).map((key) => (
            <Field key={key} label={key}>
              <Input required value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder="05:30" />
            </Field>
          ))}
        </div>
        <Button type="submit">Kaydet</Button>
      </form>

      {loading ? (
        <p className="text-black/60">Yükleniyor...</p>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              <th className="py-2">Şehir</th>
              <th className="py-2">Tarih</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((entry) => (
              <tr key={entry.id} className="border-b border-black/5">
                <td className="py-2">{entry.city}</td>
                <td className="py-2 text-black/50">{new Date(entry.date).toLocaleDateString("tr-TR")}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        city: entry.city,
                        date: entry.date.slice(0, 10),
                        imsak: entry.imsak,
                        gunes: entry.gunes,
                        ogle: entry.ogle,
                        ikindi: entry.ikindi,
                        aksam: entry.aksam,
                        yatsi: entry.yatsi,
                      })
                    }
                    className="mr-3 text-black/60 hover:text-black"
                  >
                    Düzenle
                  </button>
                  <button type="button" onClick={() => handleDelete(entry.id)} className="text-red-600">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </main>
  );
}
