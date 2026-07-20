"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { BrandSettings, ContactMessage } from "@/types";

export default function ContactPage() {
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.brand.get(), api.contact.list({ pageSize: 100 })])
      .then(([brandSettings, result]) => {
        setBrand(brandSettings);
        setMessages(result.items);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-black/60">Yükleniyor...</p>;
  }

  return (
    <main className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">İletişim</h1>

      <section className="mb-8 rounded border border-black/10 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">İletişim Bilgileri</h2>
          <Link href="/brand-settings" className="text-sm text-black/60 hover:text-black">
            Ayarlar&apos;dan düzenle
          </Link>
        </div>
        <ul className="text-sm text-black/70">
          <li>E-posta: {brand?.email || "—"}</li>
          <li>Telefon: {brand?.phone || "—"}</li>
          <li>Adres: {brand?.address || "—"}</li>
        </ul>
      </section>

      <h2 className="mb-3 font-semibold">Gelen Mesajlar</h2>
      {messages.length === 0 ? (
        <p className="text-black/60">Henüz mesaj yok.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((message) => (
            <li key={message.id} className="rounded border border-black/10 bg-white p-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold">{message.name}</span>
                <span className="text-black/40">{new Date(message.createdAt).toLocaleString("tr-TR")}</span>
              </div>
              <p className="text-sm text-black/50">{message.email}</p>
              <p className="mt-2 text-sm text-black/80">{message.message}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
