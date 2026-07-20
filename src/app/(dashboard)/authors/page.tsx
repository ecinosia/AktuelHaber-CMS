"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Author, AuthorPublishType, AuthorStatus } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { omitEmptyStrings } from "@/lib/forms";

type FormState = {
  slug: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  avatarUrl: string;
  bio: string;
  publishType: AuthorPublishType;
  status: AuthorStatus;
};

const EMPTY: FormState = {
  slug: "",
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  avatarUrl: "",
  bio: "",
  publishType: "DIRECT",
  status: "ACTIVE",
};

function toForm(author: Author): FormState {
  return {
    slug: author.slug,
    firstName: author.firstName,
    lastName: author.lastName,
    title: author.title ?? "",
    email: author.email ?? "",
    facebookUrl: author.facebookUrl ?? "",
    twitterUrl: author.twitterUrl ?? "",
    instagramUrl: author.instagramUrl ?? "",
    avatarUrl: author.avatarUrl ?? "",
    bio: author.bio ?? "",
    publishType: author.publishType,
    status: author.status,
  };
}

export default function AuthorsPage() {
  const [items, setItems] = useState<Author[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.authors.list().then(setItems);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = omitEmptyStrings(form);
    if (editingId) {
      await api.authors.update(editingId, payload);
    } else {
      await api.authors.create({ ...payload, slug: form.slug, firstName: form.firstName, lastName: form.lastName });
    }
    setForm(EMPTY);
    setEditingId(null);
    await reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu yazarı silmek istediğinize emin misiniz?")) {
      return;
    }
    await api.authors.remove(id);
    await reload();
  }

  return (
    <main className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Yazarlar</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <Field label="Avatar">
          <ImageUpload kind="avatar" value={form.avatarUrl} onChange={(url) => set("avatarUrl", url)} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ad">
            <Input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
          </Field>
          <Field label="Soyad">
            <Input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </Field>
          <Field label="Slug">
            <Input required value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Ünvan">
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="E-posta">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Facebook">
            <Input value={form.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} />
          </Field>
          <Field label="Twitter / X">
            <Input value={form.twitterUrl} onChange={(e) => set("twitterUrl", e.target.value)} />
          </Field>
          <Field label="Instagram">
            <Input value={form.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} />
          </Field>
          <Field label="Yayın Türü">
            <Select value={form.publishType} onChange={(e) => set("publishType", e.target.value as AuthorPublishType)}>
              <option value="DIRECT">Doğrudan Yayınla</option>
              <option value="REQUIRES_APPROVAL">Onay Gerekli</option>
            </Select>
          </Field>
          <Field label="Durum">
            <Select value={form.status} onChange={(e) => set("status", e.target.value as AuthorStatus)}>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Pasif</option>
            </Select>
          </Field>
        </div>

        <Field label="Hakkında">
          <Textarea rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
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
              <th className="py-2">Ad Soyad</th>
              <th className="py-2">Yayın Türü</th>
              <th className="py-2">Durum</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((author) => (
              <tr key={author.id} className="border-b border-black/5">
                <td className="py-2">
                  {author.firstName} {author.lastName}
                </td>
                <td className="py-2 text-black/50">
                  {author.publishType === "DIRECT" ? "Doğrudan" : "Onay Gerekli"}
                </td>
                <td className="py-2 text-black/50">{author.status === "ACTIVE" ? "Aktif" : "Pasif"}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(author.id);
                      setForm(toForm(author));
                    }}
                    className="mr-3 text-black/60 hover:text-black"
                  >
                    Düzenle
                  </button>
                  <button type="button" onClick={() => handleDelete(author.id)} className="text-red-600">
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
