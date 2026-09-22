"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/providers/BrandProvider";
import { api, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    if (forgot) {
      try {
        await api.auth.forgotPassword(username.trim());
        setSent(true);
      } catch (err) {
        setError(err instanceof ApiError && err.status === 429 ? "Çok fazla deneme. Biraz bekleyip tekrar deneyin." : "Geçerli bir e-posta adresi girin.");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    try {
      await api.auth.login(username, password, remember);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? "E-posta veya şifre hatalı." : "Giriş yapılamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-page flex items-center justify-center p-6">
      <div
        className="w-[380px] bg-surface border border-line rounded-xl p-9 flex flex-col gap-5"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-1">
          <BrandLogo className="h-9 w-auto" />
          <div className="text-center">
            <h1 className="m-0 text-[19px] font-extrabold font-archivo text-ink">{forgot ? "Şifremi Unuttum" : "Yönetim Paneline Giriş"}</h1>
            <p className="mt-1.5 text-[12.5px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
              {forgot ? "E-posta adresinize şifre yenileme bağlantısı göndereceğiz" : "Devam etmek için giriş yapın"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="cms-label">E-posta</label>
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="ad.soyad@habermerkezi.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="cms-input"
            />
          </div>

          {!forgot && (
            <>
          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="cms-label">Şifre</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cms-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-muted cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember + forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-[12.5px] text-muted" style={{ fontFamily: "var(--font-public-sans)" }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-primary rounded"
              />
              Beni hatırla
            </label>
            <button type="button" onClick={() => { setForgot(true); setError(null); }} className="text-[12.5px] text-primary font-semibold cursor-pointer hover:underline" style={{ fontFamily: "var(--font-public-sans)" }}>
              Şifremi unuttum
            </button>
          </div>

            </>
          )}

          {/* Error */}
          {sent && (
            <div className="rounded-md border border-line bg-page px-3 py-2.5 text-[13px] text-ink" style={{ fontFamily: "var(--font-public-sans)" }}>
              Bu e-posta ile kayıtlı bir hesap varsa, şifre yenileme bağlantısı gönderildi.
            </div>
          )}

          {error && (
            <div className="rounded-md border border-down-bg bg-down-bg px-3 py-2.5 text-[13px] text-down" style={{ fontFamily: "var(--font-public-sans)" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || sent}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white text-[14px] font-extrabold font-archivo py-3 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {forgot ? "Bağlantı Gönder" : submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
          {forgot && (
            <button type="button" onClick={() => { setForgot(false); setSent(false); setError(null); }} className="text-[12.5px] text-primary font-semibold cursor-pointer hover:underline">
              Girişe dön
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
