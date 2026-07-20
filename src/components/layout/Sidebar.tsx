"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: "İçerik",
    items: [
      { href: "/articles", label: "Haberler" },
      { href: "/articles/review-queue", label: "Onay Bekleyenler" },
      { href: "/categories", label: "Kategoriler" },
      { href: "/tags", label: "Etiketler" },
      { href: "/authors", label: "Yazarlar" },
      { href: "/comments", label: "Yorumlar" },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/menu", label: "Menü" },
      { href: "/pages", label: "Sayfalar" },
      { href: "/kunye", label: "Künye" },
      { href: "/iletisim", label: "İletişim" },
      { href: "/ads", label: "Reklamlar" },
    ],
  },
  {
    title: "Modüller",
    items: [
      { href: "/market-weather", label: "Piyasa & Hava Durumu" },
      { href: "/horoscope", label: "Burç Yorumları" },
      { href: "/prayer-times", label: "Namaz Vakitleri" },
      { href: "/pharmacies", label: "Nöbetçi Eczaneler" },
      { href: "/video-gallery", label: "Video Galeri" },
      { href: "/newspapers", label: "Gazeteler" },
      { href: "/football", label: "Puan Durumu" },
    ],
  },
  {
    title: "Sistem",
    items: [{ href: "/brand-settings", label: "Ayarlar" }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-60 shrink-0 border-r border-black/10 bg-white p-4">
      <Link href="/" className="mb-6 block text-lg font-bold">
        AktuelHaber CMS
      </Link>
      <div className="flex flex-col gap-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-xs font-semibold uppercase text-black/40">{group.title}</p>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded px-3 py-1.5 text-sm ${
                        active ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
