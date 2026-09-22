"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { FootballStanding } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/providers/ConfirmProvider";

const EMPTY = { matchweek: 1, position: 1, teamName: "", played: 0, won: 0, drawn: 0, lost: 0, points: 0 };

export default function FootballPage() {
  const [items, setItems] = useState<FootballStanding[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const confirmDialog = useConfirm();

  function reload() {
    return api.football.list().then((all) => setItems(all.sort((a, b) => a.position - b.position)));
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (editingId) {
      await api.football.update(editingId, form);
    } else {
      await api.football.create(form);
    }
    setForm({ ...EMPTY, matchweek: form.matchweek });
    setEditingId(null);
    await reload();
  }

  async function handleDelete(id: string) {
    if (!(await confirmDialog("Bu satırı silmek istediğinize emin misiniz?"))) {
      return;
    }
    await api.football.remove(id);
    await reload();
  }

  const numberFields = ["matchweek", "position", "played", "won", "drawn", "lost", "points"] as const;

  return (
    <main className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Süper Lig Puan Durumu</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <Field label="Takım">
          <Input required value={form.teamName} onChange={(e) => set("teamName", e.target.value)} />
        </Field>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
          {numberFields.map((key) => (
            <Field key={key} label={key}>
              <Input type="number" value={form[key]} onChange={(e) => set(key, Number(e.target.value))} />
            </Field>
          ))}
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
        <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              <th className="py-2">Hafta</th>
              <th className="py-2">#</th>
              <th className="py-2">Takım</th>
              <th className="py-2">Puan</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-black/5">
                <td className="py-2">{row.matchweek}</td>
                <td className="py-2">{row.position}</td>
                <td className="py-2">{row.teamName}</td>
                <td className="py-2 font-bold">{row.points}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(row.id);
                      setForm({
                        matchweek: row.matchweek,
                        position: row.position,
                        teamName: row.teamName,
                        played: row.played,
                        won: row.won,
                        drawn: row.drawn,
                        lost: row.lost,
                        points: row.points,
                      });
                    }}
                    className="mr-3 text-black/60 hover:text-black"
                  >
                    Düzenle
                  </button>
                  <button type="button" onClick={() => handleDelete(row.id)} className="text-red-600">
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
