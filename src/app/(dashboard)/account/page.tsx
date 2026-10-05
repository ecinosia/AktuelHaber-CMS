"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { CmsCard, CmsField, CmsInput } from "@/components/ui/CmsCard";
import { PageContainer } from "@/components/ui/PageContainer";

const MIN_LENGTH = 8;

export default function AccountPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (next.length < MIN_LENGTH) return setError(`Yeni şifre en az ${MIN_LENGTH} karakter olmalıdır.`);
    if (next !== again) return setError("Yeni şifre ile tekrarı aynı değil.");
    if (next === current) return setError("Yeni şifre mevcut şifrenizle aynı olamaz.");
    setSaving(true);
    try {
      await api.auth.changePassword(current, next);
      setDone(true);
      setCurrent("");
      setNext("");
      setAgain("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Şifre değiştirilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  const type = show ? "text" : "password";

  return (
    <PageContainer>
      <h1 className="m-0 mb-5 text-[26px] font-black font-archivo text-ink">Şifre Değiştir</h1>
      <form onSubmit={handleSubmit} className="max-w-[460px]">
        <CmsCard title="Hesap Şifresi">
          <CmsField label="Mevcut Şifre">
            <CmsInput type={type} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
          </CmsField>
          <CmsField label="Yeni Şifre" description={`En az ${MIN_LENGTH} karakter.`}>
            <CmsInput type={type} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required minLength={MIN_LENGTH} />
          </CmsField>
          <CmsField label="Yeni Şifre (Tekrar)">
            <CmsInput type={type} value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="new-password" required minLength={MIN_LENGTH} />
          </CmsField>
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="self-start inline-flex items-center gap-2 text-[12px] font-bold font-archivo text-muted hover:text-ink cursor-pointer bg-transparent border-0 p-0"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {show ? "Şifreleri gizle" : "Şifreleri göster"}
          </button>
          {error && (
            <div className="text-down text-[13px] bg-down-bg border border-down/20 rounded-md px-4 py-3" style={{ fontFamily: "var(--font-public-sans)" }}>
              {error}
            </div>
          )}
          {done && (
            <div className="text-up text-[13px] bg-up-bg border border-up/20 rounded-md px-4 py-3" style={{ fontFamily: "var(--font-public-sans)" }}>
              Şifreniz değiştirildi. Diğer cihazlardaki oturumlarınız kapatıldı; bu oturumunuz açık kalır.
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white text-[13.5px] font-extrabold font-archivo py-3 rounded-md disabled:opacity-60 cursor-pointer hover:bg-primary-hover transition-colors"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Şifreyi Değiştir
          </button>
        </CmsCard>
      </form>
    </PageContainer>
  );
}
