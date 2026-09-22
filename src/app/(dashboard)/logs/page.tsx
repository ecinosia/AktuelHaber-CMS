"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageContainer } from "@/components/ui/PageContainer";
import type { ActivityLog } from "@/types";

const PAGE_SIZE = 50;

const ENTITY_LABELS: Record<string, string> = {
  news: "Haber", category: "Kategori", author: "Yazar", column: "Köşe Yazısı", comment: "Yorum",
  tag: "Etiket", menu: "Menü", kunye: "Künye", ad: "Reklam", popup: "Pop-up",
  video: "Video", newspaper: "Gazete", user: "Kullanıcı", setting: "Ayar",
};

const VERB_LABELS: Record<string, string> = {
  created: "eklendi", edited: "düzenlendi", removed: "silindi", approved: "onaylandı",
  rejected: "reddedildi", added: "eklendi", spammed: "spam olarak işaretlendi",
  logged_in: "giriş yaptı", password_reset: "şifresi sıfırlandı", changed: "değiştirildi",
};

// Every action the BE can emit (keep in sync with RULES in activity-log.interceptor.ts).
const ACTIONS: Record<string, string[]> = {
  news: ["created", "edited", "approved", "rejected", "removed"],
  category: ["created", "edited", "removed"],
  author: ["created", "edited", "removed"],
  column: ["created", "edited", "removed"],
  comment: ["added", "approved", "rejected", "spammed"],
  tag: ["created", "edited", "removed"],
  menu: ["created", "edited", "removed"],
  kunye: ["edited"],
  ad: ["created", "edited", "removed"],
  popup: ["created", "edited", "removed"],
  video: ["created", "edited", "removed"],
  newspaper: ["edited"],
  user: ["created", "edited", "removed", "logged_in", "password_reset"],
  setting: ["changed"],
};

type SortKey = "createdAt" | "actorName" | "action";

const show = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : typeof v === "string" ? v : JSON.stringify(v));

function describe(l: ActivityLog) {
  const [entity, verb] = l.action.split(".");
  const what = ENTITY_LABELS[entity] ?? entity;
  if (l.entity === "setting") return `Ayar "${l.detail}" değiştirildi`;
  return `${what} ${VERB_LABELS[verb] ?? verb}${l.detail ? ` — ${l.detail}` : ""}`;
}

export default function LogsPage() {
  const [items, setItems] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);

  // debounce the text box so we don't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => { setQ(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    api.logs
      .list({
        page, pageSize: PAGE_SIZE, sortBy, order, q: q || undefined, action: action || undefined,
        from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
        to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
      })
      .then((r) => { setItems(r.items); setTotal(r.total); })
      .finally(() => setLoading(false));
  }, [page, action, q, from, to, sortBy, order]);

  function sort(key: SortKey) {
    if (key === sortBy) setOrder(order === "asc" ? "desc" : "asc");
    else { setSortBy(key); setOrder(key === "createdAt" ? "desc" : "asc"); }
    setPage(1);
  }

  const input = "px-3 py-2 border border-line-strong rounded-md text-[13px] text-ink bg-surface focus:outline-none focus:border-primary";

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageContainer>
      <h1 className="m-0 text-[26px] font-black font-archivo text-ink">İşlem Kayıtları</h1>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-line flex-wrap">
          <input type="text" placeholder="Kullanıcı veya detay ara..." value={search} onChange={(e) => setSearch(e.target.value)} className={`w-64 ${input}`} />
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className={input}>
            <option value="">Tüm işlemler</option>
            {Object.entries(ACTIONS).map(([entity, verbs]) => (
              <optgroup key={entity} label={ENTITY_LABELS[entity]}>
                {verbs.map((v) => (
                  <option key={v} value={`${entity}.${v}`}>{ENTITY_LABELS[entity]} {VERB_LABELS[v]}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <input type="date" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={input} aria-label="Başlangıç" />
          <input type="date" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={input} aria-label="Bitiş" />
          <span className="text-[12px] text-muted-2 ml-auto">{total} kayıt</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-page">
                {([["Tarih", "createdAt"], ["Kullanıcı", "actorName"], ["İşlem", "action"]] as [string, SortKey][]).map(([h, key]) => (
                  <th key={key} onClick={() => sort(key)} className="text-left px-4 py-3 text-[10.5px] font-extrabold font-archivo uppercase tracking-wider text-muted cursor-pointer select-none hover:text-ink">
                    {h}{sortBy === key ? (order === "asc" ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-6"><div className="h-4 rounded bg-surface-3 animate-pulse" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-12 text-center text-[13px] text-muted-2">Kayıt bulunamadı.</td></tr>
              ) : (
                items.map((l) => (
                  <tr key={l.id} className="border-t border-line-soft hover:bg-page transition-colors">
                    <td className="px-4 py-3 text-[12px] text-muted-2 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-bold font-archivo text-ink whitespace-nowrap" title={l.actorEmail ?? undefined}>
                      {l.actorName ?? l.actorEmail ?? "Ziyaretçi"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-body">
                      {describe(l)}
                      {l.changes && (
                        <ul className="mt-1 mb-0 pl-4 text-[12px] text-muted-2 list-disc">
                          {Object.entries(l.changes).map(([k, c]) => (
                            <li key={k}>
                              <b>{c.label}:</b>{" "}
                              {"from" in c && <><span className="line-through">{show(c.from)}</span> → </>}
                              {show(c.to)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-line text-[12px] text-muted">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-line-strong rounded disabled:opacity-40 cursor-pointer">Önceki</button>
          <span>{page} / {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-line-strong rounded disabled:opacity-40 cursor-pointer">Sonraki</button>
        </div>
      </div>
    </PageContainer>
  );
}
