"use client";

import { useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { api, type MediaUploadKind } from "@/lib/api";

// discover (1200px) is the main image; card (600px) is only produced for kind="article".
function pickUrls(variants: Record<string, string>) {
  return {
    url: variants.discover ?? variants.card ?? Object.values(variants)[0],
    cardUrl: variants.discover ? variants.card : undefined,
  };
}

export function ImageUpload({
  kind,
  value,
  onChange,
  onCardChange,
}: {
  kind: MediaUploadKind;
  value?: string;
  onChange: (url: string) => void;
  // Optional: forms whose entity stores a listing-size variant (article, column) pass this.
  onCardChange?: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  function apply(variants: Record<string, string>) {
    const { url, cardUrl } = pickUrls(variants);
    if (!url) return;
    onChange(url);
    onCardChange?.(cardUrl ?? "");
  }

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setWarning(null);
    try {
      apply(await api.media.upload(file, kind));
    } catch {
      setError("Yükleme başarısız oldu.");
    } finally {
      setUploading(false);
    }
  }

  // Pasted URL: have the server copy it into our storage so it can't break later. If that fails,
  // keep the raw URL (saving must never be blocked) and warn.
  async function handleUrl(raw: string) {
    const url = raw.trim();
    if (!url) return;
    setUploading(true);
    setError(null);
    setWarning(null);
    try {
      apply(await api.media.ingest(url, kind));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel alınamadı.");
      setWarning("Görsel harici adresten kullanılıyor; kaynak siteden kaldırılırsa bozulur.");
      onChange(url);
      onCardChange?.("");
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    onChange("");
    onCardChange?.("");
    setWarning(null);
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-28 w-28 rounded-lg object-cover border border-gray-200 shadow-sm" />
          <button
            type="button"
            onClick={clear}
            className="absolute -top-2 -right-2 rounded-full bg-white border border-gray-200 p-0.5 shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-primary-light hover:border-primary transition-colors cursor-pointer">
          {uploading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-5 w-5 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Görsel yükle</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
      {!value && !uploading && (
        <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors">
          veya URL gir:&nbsp;
          <input
            type="url"
            placeholder="https://..."
            className="border-b border-gray-300 bg-transparent text-xs outline-none px-0.5 text-gray-700 w-48 focus:border-primary"
            onBlur={(e) => handleUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // inside a <form>
                handleUrl(e.currentTarget.value);
              }
            }}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {warning && <p className="text-xs text-amber-600">{warning}</p>}
    </div>
  );
}
