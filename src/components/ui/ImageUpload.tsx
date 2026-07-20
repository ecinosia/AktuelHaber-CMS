"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type UploadKind = "article" | "avatar" | "logo" | "banner";

// media.upload returns one URL per generated variant (card/discover/avatar) —
// prefer the largest relevant one for the given kind.
function pickUrl(variants: Record<string, string>): string | undefined {
  return variants.discover ?? variants.card ?? variants.avatar ?? Object.values(variants)[0];
}

export function ImageUpload({
  kind,
  value,
  onChange,
}: {
  kind: UploadKind;
  value?: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const variants = await api.media.upload(file, kind);
      const url = pickUrl(variants);
      if (url) {
        onChange(url);
      }
    } catch {
      setError("Yükleme başarısız oldu.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mb-2 h-24 w-24 rounded object-cover" />
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        disabled={uploading}
        className="text-sm"
      />
      {uploading && <p className="text-xs text-black/50">Yükleniyor...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
