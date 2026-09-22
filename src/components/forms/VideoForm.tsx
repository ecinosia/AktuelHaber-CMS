"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { api } from "@/lib/api";
import type { Video } from "@/types";
import { omitEmptyStrings } from "@/lib/forms";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { CmsCard, CmsField, CmsInput } from "@/components/ui/CmsCard";

type FormState = { title: string; videoUrl: string; thumbnailUrl: string };

const EMPTY: FormState = { title: "", videoUrl: "", thumbnailUrl: "" };

// Grabs a frame from a video (local blob URL or CORS-enabled storage URL) as a JPEG. Null when
// the browser can't decode it or the canvas is tainted — the user then uploads a thumbnail by hand.
// Frame at ~0.5s rather than 0: the very first frame is often a black fade-in.
function captureFrame(src: string): Promise<File | null> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.crossOrigin = "anonymous";
    const timer = setTimeout(() => resolve(null), 15_000);
    const finish = (f: File | null) => { clearTimeout(timer); resolve(f); };
    v.onerror = () => finish(null);
    v.onloadeddata = () => { v.currentTime = Math.min(0.5, (v.duration || 1) / 2); };
    v.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        canvas.getContext("2d")!.drawImage(v, 0, 0);
        canvas.toBlob((b) => finish(b ? new File([b], "thumbnail.jpg", { type: "image/jpeg" }) : null), "image/jpeg", 0.85);
      } catch {
        finish(null);
      }
    };
    v.src = src;
  });
}

function toForm(v: Video): FormState {
  return { title: v.title, videoUrl: v.videoUrl, thumbnailUrl: v.thumbnailUrl ?? "" };
}

export function VideoForm({ video }: { video?: Video }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(video ? toForm(video) : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoBusy, setVideoBusy] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Only fills an empty thumbnail, so a hand-picked one is never overwritten.
  async function autoThumbnail(src: string) {
    if (form.thumbnailUrl) return;
    const frame = await captureFrame(src);
    if (!frame) return;
    try {
      const url = (await api.media.upload(frame, "video")).card;
      if (url) setForm((prev) => (prev.thumbnailUrl ? prev : { ...prev, thumbnailUrl: url }));
    } catch {
      /* thumbnail stays empty; user can upload one */
    }
  }

  async function withVideoBusy(fn: () => Promise<void>) {
    setVideoBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video yüklenemedi.");
    } finally {
      setVideoBusy(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const local = URL.createObjectURL(file);
    void withVideoBusy(async () => {
      const [url] = await Promise.all([api.media.uploadVideo(file), autoThumbnail(local)]);
      set("videoUrl", url);
    }).finally(() => URL.revokeObjectURL(local));
  }

  function handleDownload() {
    const src = sourceUrl.trim();
    if (!src) return;
    void withVideoBusy(async () => {
      const url = await api.media.ingestVideo(src);
      set("videoUrl", url);
      setSourceUrl("");
      void autoThumbnail(url);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (!form.videoUrl) {
        setError("Önce bir video yükleyin.");
        setSaving(false);
        return;
      }
      const payload = omitEmptyStrings(form);
      if (video) await api.videoGallery.update(video.id, payload);
      else await api.videoGallery.create({ ...payload, title: form.title, videoUrl: form.videoUrl });
      router.push("/video-gallery");
      router.refresh();
    } catch {
      setError("Video kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="flex flex-col gap-4">
          <CmsCard title="Video Bilgileri">
            <CmsField label="Başlık">
              <CmsInput required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="ör. Günün Haberleri" />
            </CmsField>
            <CmsField label="Video">
              {form.videoUrl ? (
                <div className="relative">
                  <video src={form.videoUrl} controls preload="metadata" className="w-full max-h-[360px] rounded-lg bg-black" />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, videoUrl: "", thumbnailUrl: "" }))}
                    className="absolute -top-2 -right-2 rounded-full bg-white border border-gray-200 p-0.5 shadow-sm hover:bg-red-50 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-primary-light hover:border-primary transition-colors cursor-pointer">
                    {videoBusy ? (
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Bilgisayardan video yükle (MP4, WebM, MOV — en fazla 300 MB)</span>
                      </>
                    )}
                    <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFile} disabled={videoBusy} className="hidden" />
                  </label>
                  <div className="flex items-center gap-2">
                    <CmsInput
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleDownload();
                        }
                      }}
                      disabled={videoBusy}
                      placeholder="veya doğrudan video dosyası adresi: https://.../video.mp4"
                    />
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={videoBusy || !sourceUrl.trim()}
                      className="shrink-0 bg-surface text-body text-[13px] font-extrabold font-archivo px-4 py-2 rounded-md border border-line-strong hover:bg-page disabled:opacity-60 cursor-pointer"
                    >
                      İndir
                    </button>
                  </div>
                </div>
              )}
            </CmsField>
          </CmsCard>

          <CmsCard title="Kapak Görseli">
            <div className="flex flex-col gap-3">
              <label className="cms-label">Thumbnail</label>
              <ImageUpload kind="video" value={form.thumbnailUrl} onChange={(url) => set("thumbnailUrl", url)} />
            </div>
          </CmsCard>
        </div>

        <div className="flex flex-col gap-4">
          {error && (
            <div className="text-down text-[13px] bg-down-bg border border-down/20 rounded-md px-4 py-3" style={{ fontFamily: "var(--font-public-sans)" }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={saving || videoBusy}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white text-[13.5px] font-extrabold font-archivo py-3 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Kaydediliyor..." : video ? "Güncelle" : "Kaydet"}
          </button>
          <a
            href="/video-gallery"
            className="w-full block text-center bg-surface text-body text-[13.5px] font-extrabold font-archivo py-3 rounded-md border border-line-strong hover:bg-page transition-colors"
          >
            İptal
          </a>
        </div>
      </div>
    </form>
  );
}
