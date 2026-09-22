"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Pharmacy } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/providers/ConfirmProvider";

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { name: "", district: "", address: "", phone: "", date: today() };

export default function PharmaciesPage() {
  const [items, setItems] = useState<Pharmacy[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const confirmDialog = useConfirm();

  function reload() {
    return api.pharmacies.list().then(setItems);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (editingId) {
      await api.pharmacies.update(editingId, form);
    } else {
      await api.pharmacies.create(form);
    }
    setForm(EMPTY);
    setEditingId(null);
    await reload();
  }

  async function handleDelete(id: string) {
    if (!(await confirmDialog("Bu eczaneyi silmek istediğinize emin misiniz?"))) {
      return;
    }
    await api.pharmacies.remove(id);
    await reload();
  }

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Nöbetçi Eczaneler</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Eczane Adı">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="İlçe">
            <Input required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          </Field>
          <Field label="Adres">
            <Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Telefon">
            <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Tarih">
            <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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
        <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              <th className="py-2">Ad</th>
              <th className="py-2">İlçe</th>
              <th className="py-2">Tarih</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((pharmacy) => (
              <tr key={pharmacy.id} className="border-b border-black/5">
                <td className="py-2">{pharmacy.name}</td>
                <td className="py-2 text-black/50">{pharmacy.district}</td>
                <td className="py-2 text-black/50">{new Date(pharmacy.date).toLocaleDateString("tr-TR")}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(pharmacy.id);
                      setForm({
                        name: pharmacy.name,
                        district: pharmacy.district,
                        address: pharmacy.address,
                        phone: pharmacy.phone,
                        date: pharmacy.date.slice(0, 10),
                      });
                    }}
                    className="mr-3 text-black/60 hover:text-black"
                  >
                    Düzenle
                  </button>
                  <button type="button" onClick={() => handleDelete(pharmacy.id)} className="text-red-600">
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
