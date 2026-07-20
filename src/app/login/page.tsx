"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

// Editor/admin login — posts to AktuelHaber-BE /auth/login (Keycloak
// exchange happens server-side there; this just submits credentials).
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.auth.login(username, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? "E-posta veya şifre hatalı." : "Giriş yapılamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-bold">AktuelHaber CMS</h1>

        <label className="mb-3 block text-sm">
          E-posta
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>

        <label className="mb-4 block text-sm">
          Şifre
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </main>
  );
}
