"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { BrandSettings } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { omitEmptyStrings } from "@/lib/forms";

type FormState = Partial<Omit<BrandSettings, "id" | "updatedAt">>;

export default function BrandSettingsPage() {
  const [form, setForm] = useState<FormState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .brand.get()
      .then((settings) => setForm(settings ?? {}))
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await api.brand.update(omitEmptyStrings(form));
      setForm(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-black/60">Yükleniyor...</p>;
  }

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Ayarlar</h1>

      <form onSubmit={handleSubmit}>
        <Field label="Logo">
          <ImageUpload kind="logo" value={form.logoUrl} onChange={(url) => set("logoUrl", url)} />
        </Field>

        <Field label="Marka Adı">
          <Input required value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />
        </Field>

        <Field label="Açıklama">
          <Textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="E-posta">
            <Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Telefon">
            <Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
          </Field>
        </div>

        <Field label="Adres">
          <Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Facebook">
            <Input value={form.facebookUrl ?? ""} onChange={(e) => set("facebookUrl", e.target.value)} />
          </Field>
          <Field label="Twitter / X">
            <Input value={form.twitterUrl ?? ""} onChange={(e) => set("twitterUrl", e.target.value)} />
          </Field>
          <Field label="Instagram">
            <Input value={form.instagramUrl ?? ""} onChange={(e) => set("instagramUrl", e.target.value)} />
          </Field>
          <Field label="YouTube">
            <Input value={form.youtubeUrl ?? ""} onChange={(e) => set("youtubeUrl", e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Ana Renk">
            <Input type="color" value={form.primaryColor ?? "#000000"} onChange={(e) => set("primaryColor", e.target.value)} />
          </Field>
          <Field label="İkincil Renk">
            <Input type="color" value={form.secondaryColor ?? "#000000"} onChange={(e) => set("secondaryColor", e.target.value)} />
          </Field>
          <Field label="Vurgu Rengi">
            <Input type="color" value={form.accentColor ?? "#000000"} onChange={(e) => set("accentColor", e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Dil">
            <Input value={form.language ?? "tr"} onChange={(e) => set("language", e.target.value)} />
          </Field>
          <Field label="Hava Durumu Şehri">
            <Input value={form.weatherCity ?? ""} onChange={(e) => set("weatherCity", e.target.value)} />
          </Field>
        </div>

        <Field label="ads.txt İçeriği">
          <Textarea
            rows={4}
            placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
            value={form.adsTxtContent ?? ""}
            onChange={(e) => set("adsTxtContent", e.target.value)}
          />
        </Field>

        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
          {saved && <span className="text-sm text-green-600">Kaydedildi.</span>}
        </div>
      </form>
    </main>
  );
}
