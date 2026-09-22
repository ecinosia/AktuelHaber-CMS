"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { PageContainer } from "@/components/ui/PageContainer";
import type { DashboardStats } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Taslak",
  PENDING_REVIEW: "Onay Bekliyor",
  SCHEDULED: "Zamanlanmış",
  PUBLISHED: "Yayında",
  ARCHIVED: "Arşivlendi",
};
const STATUS_BG: Record<string, string> = {
  DRAFT: "bg-surface-2 text-muted",
  PENDING_REVIEW: "bg-pending-bg text-pending",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-up-bg text-up",
  ARCHIVED: "bg-surface-2 text-muted",
};

const QUICK_ACTIONS = [
  { label: "Haber Ekle", href: "/articles/new" },
  { label: "Reklam Ekle", href: "/ads/new" },
  { label: "Pop-up Ekle", href: "/popup/new" },
  { label: "Yorumları Onayla", href: "/comments" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard
      .stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleModerate(id: string, action: "approve" | "reject") {
    await (action === "approve"
      ? api.comments.approve(id)
      : api.comments.reject(id));
    setStats((prev) =>
      prev
        ? {
            ...prev,
            pendingComments: prev.pendingComments - 1,
            pendingCommentsList: prev.pendingCommentsList.filter(
              (c) => c.id !== id,
            ),
          }
        : prev,
    );
  }

  const statCards = [
    {
      label: "Bugün Eklenen Haber",
      value: stats?.todayArticles ?? "—",
      href: "/articles",
    },
    {
      label: "Toplam Haber",
      value: stats?.totalArticles ?? "—",
      href: "/articles",
    },
    {
      label: "Onay Bekleyen Haber",
      value: stats?.pendingReviewArticles ?? "—",
      href: "/articles/review-queue",
    },
    { label: "Aktif Reklam", value: stats?.activeAds ?? "—", href: "/ads" },
    {
      label: "Bugün Eklenen Yorum",
      value: stats?.todayComments ?? "—",
      href: "/comments",
    },
    {
      label: "Toplam Yorum",
      value: stats?.totalComments ?? "—",
      href: "/comments",
    },
    {
      label: "Onay Bekleyen Yorum",
      value: stats?.pendingComments ?? "—",
      href: "/comments",
    },
    {
      label: "Okunmamış Mesaj",
      value: stats?.unreadContactMessages ?? "—",
      href: "/iletisim",
    },
  ];

  return (
    <PageContainer>
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-surface border border-line rounded-lg px-5 py-4 flex flex-col gap-2 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <span className="text-[12px] font-bold font-archivo text-primary-hover uppercase tracking-wide">
              {s.label}
            </span>
            <span className="text-[28px] font-black font-archivo text-ink leading-none">
              {loading ? (
                <span className="inline-block h-8 w-14 rounded bg-surface-3 animate-pulse" />
              ) : (
                s.value
              )}
            </span>
          </Link>
        ))}
      </div>

      {/* Row 2: Recent news + Most viewed + Pending comments + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent news */}
        <div className="bg-surface border border-line rounded-lg p-5">
          <h2 className="m-0 mb-3 text-[15px] font-extrabold font-archivo text-primary-hover">
            Son Eklenen Haberler
          </h2>
          <div className="flex flex-col divide-y divide-line-soft">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-2.5">
                  <div className="h-3.5 w-4/5 rounded bg-surface-3 animate-pulse mb-1" />
                  <div className="h-2.5 w-1/2 rounded bg-surface-3 animate-pulse" />
                </div>
              ))
            ) : (stats?.latestArticles.length ?? 0) === 0 ? (
              <p
                className="text-[13px] text-muted-2 py-4"
                style={{ fontFamily: "var(--font-public-sans)" }}
              >
                Haber yok.
              </p>
            ) : (
              stats!.latestArticles.map((n) => (
                <Link
                  key={n.id}
                  href={`/articles/${n.id}`}
                  className="py-2.5 flex flex-col gap-1 hover:bg-page -mx-5 px-5 transition-colors"
                >
                  <span className="text-[12.5px] font-bold font-archivo text-ink line-clamp-2 leading-snug">
                    {n.title}
                  </span>
                  <span
                    className="text-[11px] text-muted-2"
                    style={{ fontFamily: "var(--font-public-sans)" }}
                  >
                    {n.category.name} · {n.author.firstName} {n.author.lastName}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Most viewed */}
        <div className="bg-surface border border-line rounded-lg p-5">
          <h2 className="m-0 mb-3 text-[15px] font-extrabold font-archivo text-primary-hover">
            En Çok Okunan
          </h2>
          <div className="flex flex-col divide-y divide-line-soft">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-2.5">
                  <div className="h-3.5 w-4/5 rounded bg-surface-3 animate-pulse mb-1" />
                  <div className="h-2.5 w-1/2 rounded bg-surface-3 animate-pulse" />
                </div>
              ))
            ) : (stats?.mostViewedArticles.length ?? 0) === 0 ? (
              <p
                className="text-[13px] text-muted-2 py-4"
                style={{ fontFamily: "var(--font-public-sans)" }}
              >
                Haber yok.
              </p>
            ) : (
              stats!.mostViewedArticles.map((n) => (
                <Link
                  key={n.id}
                  href={`/articles/${n.id}`}
                  className="py-2.5 flex items-center justify-between gap-3 hover:bg-page -mx-5 px-5 transition-colors"
                >
                  <span className="text-[12.5px] font-bold font-archivo text-ink line-clamp-2 leading-snug">
                    {n.title}
                  </span>
                  <span className="text-[11px] font-bold font-archivo text-muted-2 shrink-0">
                    {n.viewCount.toLocaleString("tr-TR")}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Pending comments */}
        <div className="bg-surface border border-line rounded-lg p-5">
          <h2 className="m-0 mb-3 text-[15px] font-extrabold font-archivo text-primary-hover">
            Onay Bekleyen Yorumlar
          </h2>
          <div className="flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-b border-line-soft pb-3">
                  <div className="h-3 w-1/3 rounded bg-surface-3 animate-pulse mb-1.5" />
                  <div className="h-3 w-4/5 rounded bg-surface-3 animate-pulse mb-2" />
                  <div className="h-6 w-20 rounded bg-surface-3 animate-pulse" />
                </div>
              ))
            ) : (stats?.pendingCommentsList.length ?? 0) === 0 ? (
              <p
                className="text-[13px] text-muted-2"
                style={{ fontFamily: "var(--font-public-sans)" }}
              >
                Bekleyen yorum yok.
              </p>
            ) : (
              stats!.pendingCommentsList.map((c) => (
                <div
                  key={c.id}
                  className="border-b border-line-soft pb-3 last:border-0"
                >
                  <div className="text-[12px] font-bold font-archivo text-ink">
                    {c.authorName}
                  </div>
                  <div
                    className="text-[12.5px] text-body leading-relaxed mt-0.5 mb-2 line-clamp-2"
                    style={{ fontFamily: "var(--font-public-sans)" }}
                  >
                    {c.content}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleModerate(c.id, "approve")}
                      className="text-[11px] font-bold font-archivo text-white bg-up px-2.5 py-1 rounded cursor-pointer"
                    >
                      Onayla
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerate(c.id, "reject")}
                      className="text-[11px] font-bold font-archivo text-down bg-surface border border-down px-2.5 py-1 rounded cursor-pointer"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-surface border border-line rounded-lg p-5 flex flex-col gap-2.5">
          <h2 className="m-0 mb-1 text-[15px] font-extrabold font-archivo text-primary-hover">
            Hızlı İşlemler
          </h2>
          {QUICK_ACTIONS.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="flex items-center gap-2.5 border border-line rounded-md px-4 py-3 text-[13px] font-bold font-archivo text-ink hover:border-primary hover:text-primary hover:bg-primary-light transition-all"
            >
              <span className="text-primary font-black text-[16px]">+</span>
              {q.label}
            </Link>
          ))}

          <h2 className="m-0 mb-1 mt-2 text-[15px] font-extrabold font-archivo text-primary-hover">
            Haber Durumu
          </h2>
          <div className="flex flex-col gap-1">
            {["PUBLISHED", "PENDING_REVIEW", "DRAFT", "SCHEDULED"].map(
              (status) => (
                <Link
                  key={status}
                  href={`/articles?status=${status}`}
                  className="flex items-center justify-between py-1.5 hover:bg-page -mx-2 px-2 rounded transition-colors"
                >
                  <span
                    className="text-[12.5px] text-body"
                    style={{ fontFamily: "var(--font-public-sans)" }}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                  <span
                    className={`text-[11px] font-bold font-archivo px-2 py-0.5 rounded-full ${STATUS_BG[status]}`}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
