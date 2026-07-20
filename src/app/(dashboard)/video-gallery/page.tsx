"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Video } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { omitEmptyStrings } from "@/lib/forms";

const EMPTY = { title: "", videoUrl: "", thumbnailUrl: "" };

export default function VideoGalleryPage() {
  const [items, setItems] = useState<Video[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    return api.videoGallery.list(1, 100).then((result) => setItems(result.items));
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = omitEmptyStrings(form);
    if (editingId) {
      await api.videoGallery.update(editingId, payload);
    } else {
      await api.videoGallery.create({ ...payload, title: form.title, videoUrl: form.videoUrl });
    }
    setForm(EMPTY);
    setEditingId(null);
    await reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu videoyu silmek istediğinize emin misiniz?")) {
      return;
    }
    await api.videoGallery.remove(id);
    await reload();
  }

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Video Galeri</h1>

      <form onSubmit={handleSubmit} className="mb-8 rounded border border-black/10 bg-white p-4">
        <Field label="Başlık">
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Video URL">
          <Input required value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
        </Field>
        <Field label="Kapak Görseli">
          <ImageUpload kind="article" value={form.thumbnailUrl} onChange={(url) => setForm({ ...form, thumbnailUrl: url })} />
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
              <th className="py-2">Başlık</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((video) => (
              <tr key={video.id} className="border-b border-black/5">
                <td className="py-2">{video.title}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(video.id);
                      setForm({ title: video.title, videoUrl: video.videoUrl, thumbnailUrl: video.thumbnailUrl ?? "" });
                    }}
                    className="mr-3 text-black/60 hover:text-black"
                  >
                    Düzenle
                  </button>
                  <button type="button" onClick={() => handleDelete(video.id)} className="text-red-600">
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
