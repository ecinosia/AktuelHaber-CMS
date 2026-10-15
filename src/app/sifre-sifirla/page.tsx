"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/providers/BrandProvider";
import { api, ApiError } from "@/lib/api";

const MIN_LENGTH = 8;

// The page the password-reset mail links to (/sifre-sifirla?token=...). Public like /login: the signed token in the link is the credential.
function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < MIN_LENGTH) return setError(`Şifre en az ${MIN_LENGTH} karakter olmalıdır.`);
    if (password !== repeat) return setError("Şifreler aynı değil.");
    setSubmitting(true);
    try {
      await api.auth.completePasswordReset(token, password);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) setError("Çok fazla deneme. Biraz bekleyip tekrar deneyin.");
      else if (err instanceof ApiError && err.status === 400) setError(err.message);
      else setError("Şifre değiştirilemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  const fontSans = { fontFamily: "var(--font-public-sans)" };

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-md border border-down-bg bg-down-bg px-3 py-2.5 text-[13px] text-down" style={fontSans}>
          Bağlantı eksik ya da hatalı. Lütfen e-postadaki bağlantıyı yeniden açın veya giriş ekranından yeni bir şifre yenileme bağlantısı isteyin.
        </div>
        <Link href="/login" className="text-center text-[12.5px] text-primary font-semibold hover:underline">
          Girişe dön
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden="true" />
        <p className="m-0 text-[13.5px] text-ink" style={fontSans}>
          Şifreniz değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.
        </p>
        <Link
          href="/login"
          className="w-full flex items-center justify-center bg-primary text-white text-[14px] font-extrabold font-archivo py-3 rounded-md hover:bg-primary-hover transition-colors"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <label className="cms-label" htmlFor="new-password">
          Yeni şifre
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={show ? "text" : "password"}
            required
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            placeholder={`En az ${MIN_LENGTH} karakter`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="cms-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-muted cursor-pointer"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="cms-label" htmlFor="repeat-password">
          Yeni şifre (tekrar)
        </label>
        <input
          id="repeat-password"
          type={show ? "text" : "password"}
          required
          autoComplete="new-password"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          className="cms-input"
        />
      </div>

      {error && (
        <div className="rounded-md border border-down-bg bg-down-bg px-3 py-2.5 text-[13px] text-down" style={fontSans} role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white text-[14px] font-extrabold font-archivo py-3 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Şifreyi Kaydet
      </button>
      <Link href="/login" className="text-center text-[12.5px] text-primary font-semibold hover:underline">
        Girişe dön
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-page flex items-center justify-center p-6">
      <div className="w-[380px] max-w-full bg-surface border border-line rounded-xl p-9 flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 mb-1">
          <BrandLogo className="h-9 w-auto" />
          <div className="text-center">
            <h1 className="m-0 text-[19px] font-extrabold font-archivo text-ink">Yeni Şifre Belirleyin</h1>
            <p className="mt-1.5 text-[12.5px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
              Yönetim paneli hesabınız için yeni bir şifre seçin
            </p>
          </div>
        </div>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
