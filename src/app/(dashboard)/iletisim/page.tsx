"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Settings, ChevronDown, ChevronUp, Circle, Trash2, MailOpen, MailCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { PageContainer } from "@/components/ui/PageContainer";
import type { BrandSettings, ContactMessage } from "@/types";

// The public forms (contact, feedback) prepend "Label: value" lines to the
// message. Peel those leading lines off into fields; the rest is the body.
function parseMessage(raw: string): { fields: { label: string; value: string }[]; body: string } {
  const lines = raw.split("\n");
  const fields: { label: string; value: string }[] = [];
  let i = 0;
  for (; i < lines.length; i++) {
    const m = lines[i].match(/^(Konu|Geri bildirim türü|İlgili sayfa): (.*)$/);
    if (!m) break;
    fields.push({ label: m[1], value: m[2] });
  }
  return { fields, body: lines.slice(i).join("\n").trim() };
}

const PAGE_SIZE = 10;

export default function ContactPage() {
  const confirm = useConfirm();
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.brand.get().then(setBrand);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setQ(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    return api.contact.list({ page, pageSize: PAGE_SIZE, q: q || undefined }).then((result) => {
      setMessages(result.items);
      setTotal(result.total);
      setUnreadCount(result.unread);
    });
  }, [page, q]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  async function setRead(id: string, read: boolean) {
    const updated = await (read ? api.contact.markRead(id) : api.contact.markUnread(id));
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: updated.isRead } : m)));
    setUnreadCount((n) => n + (read ? -1 : 1));
  }

  // Only expanding marks a message read — collapsing must not undo a manual "unread".
  function toggle(msg: ContactMessage) {
    const opening = expanded !== msg.id;
    setExpanded(opening ? msg.id : null);
    if (opening && !msg.isRead) setRead(msg.id, true);
  }

  async function handleDelete(id: string) {
    if (!(await confirm("Bu mesaj silinsin mi?"))) return;
    await api.contact.remove(id);
    setExpanded(null);
    // Step back a page when the last row of a non-first page was deleted.
    if (messages.length === 1 && page > 1) setPage(page - 1);
    else await load();
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink">İletişim</h1>

      {/* Contact info card */}
      <div className="bg-surface border border-line rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-extrabold font-archivo text-ink">İletişim Bilgileri</h2>
          <Link
            href="/iletisim/duzenle"
            className="flex items-center gap-1.5 text-[12px] font-bold font-archivo text-muted hover:text-primary transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            Düzenle
          </Link>
        </div>
        {!brand ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-surface-3 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-md bg-page border border-line-soft">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold font-archivo uppercase tracking-wider text-muted">E-posta</p>
                <p className="text-[13px] text-ink truncate" style={{ fontFamily: "var(--font-public-sans)" }}>{brand?.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-md bg-page border border-line-soft">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold font-archivo uppercase tracking-wider text-muted">Telefon</p>
                <p className="text-[13px] text-ink truncate" style={{ fontFamily: "var(--font-public-sans)" }}>{brand?.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-md bg-page border border-line-soft">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold font-archivo uppercase tracking-wider text-muted">Adres</p>
                <p className="text-[13px] text-ink truncate" style={{ fontFamily: "var(--font-public-sans)" }}>{brand?.address || "—"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-wrap gap-3">
          <h2 className="text-[15px] font-extrabold font-archivo text-ink flex items-center gap-2">
            Gelen Mesajlar
            {!loading && total > 0 && (
              <span className="text-[12px] font-bold text-muted bg-surface-2 px-2 py-0.5 rounded-full">{total}</span>
            )}
            {!loading && unreadCount > 0 && (
              <span className="text-[11px] font-bold text-white bg-primary px-2 py-0.5 rounded-full">{unreadCount} okunmadı</span>
            )}
          </h2>
          <input
            type="text"
            placeholder="İsim, e-posta veya mesaj ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-3 py-2 border border-line-strong rounded-md text-[13px] text-ink placeholder-muted-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            style={{ fontFamily: "var(--font-public-sans)" }}
          />
        </div>

        {loading ? (
          <div className="p-5 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-md bg-surface-3 animate-pulse" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
            {q ? "Arama sonucu bulunamadı." : "Henüz mesaj gelmemiş."}
          </div>
        ) : (
          <ul className="divide-y divide-line-soft">
            {messages.map((msg) => (
              <li key={msg.id} className={`hover:bg-page transition-colors ${!msg.isRead ? "bg-primary/[0.02]" : ""}`}>
                <div
                  className="w-full text-left px-5 py-4 cursor-pointer"
                  onClick={() => toggle(msg)}
                  onKeyDown={(e) => e.key === "Enter" && toggle(msg)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {!msg.isRead && (
                        <Circle className="h-2 w-2 fill-primary text-primary shrink-0" />
                      )}
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold font-archivo text-primary shrink-0">
                        {msg.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-archivo text-ink ${!msg.isRead ? "font-extrabold" : "font-bold"}`}>{msg.name}</p>
                        <p className="text-[12px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>{msg.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[12px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
                        {new Date(msg.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      {expanded === msg.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-2" />
                      )}
                    </div>
                  </div>
                  {expanded !== msg.id && (
                    <p className="mt-1.5 text-[12.5px] text-muted line-clamp-1 ml-11" style={{ fontFamily: "var(--font-public-sans)" }}>
                      {parseMessage(msg.message).fields[0] && (
                        <span className="font-bold text-ink">{parseMessage(msg.message).fields[0].value} — </span>
                      )}
                      {parseMessage(msg.message).body}
                    </p>
                  )}
                </div>
                {expanded === msg.id && (
                  <div className="px-5 pb-4 ml-11 flex flex-col gap-2 text-[13px] text-body leading-relaxed" style={{ fontFamily: "var(--font-public-sans)" }}>
                    {parseMessage(msg.message).fields.map((f) => (
                      <p key={f.label}>{f.label}: <strong className="text-ink">{f.value}</strong></p>
                    ))}
                    {parseMessage(msg.message).body && (
                      <p className="whitespace-pre-line">Mesaj: <strong className="text-ink">{parseMessage(msg.message).body}</strong></p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setRead(msg.id, !msg.isRead)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-line-strong rounded-md text-[12px] font-bold font-archivo text-body hover:bg-page transition-colors cursor-pointer"
                      >
                        {msg.isRead ? <MailCheck className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
                        {msg.isRead ? "Okunmadı İşaretle" : "Okundu İşaretle"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(msg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-down/30 text-down rounded-md text-[12px] font-bold font-archivo hover:bg-down-bg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Sil
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-line text-[13px] text-muted" style={{ fontFamily: "var(--font-public-sans)" }}>
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-line-strong rounded disabled:opacity-40 cursor-pointer">Önceki</button>
            <span>{page} / {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-line-strong rounded disabled:opacity-40 cursor-pointer">Sonraki</button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
