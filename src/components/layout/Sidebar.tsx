"use client";

import Link from "next/link";
import { BrandLogo, useBrand } from "@/components/providers/BrandProvider";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

type NavChild = { href: string; label: string };
type NavItem = { label: string; children: NavChild[] };
type NavGroup = { heading: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    heading: "Genel",
    items: [
      { label: "Dashboard", children: [{ href: "/", label: "Genel Bakış" }] },
    ],
  },
  {
    heading: "İçerik",
    items: [
      {
        label: "Haberler",
        children: [
          { href: "/articles", label: "Tüm Haberler" },
          { href: "/articles/new", label: "Haber Ekle" },
          { href: "/articles/review-queue", label: "Onay Bekleyenler" },
        ],
      },
      {
        label: "Kategoriler",
        children: [
          { href: "/categories", label: "Tüm Kategoriler" },
          { href: "/categories/new", label: "Kategori Ekle" },
        ],
      },
      {
        label: "Yazarlar",
        children: [
          { href: "/authors", label: "Tüm Yazarlar" },
          { href: "/authors/new", label: "Yazar Ekle" },
        ],
      },
      {
        label: "Köşe Yazıları",
        children: [
          { href: "/columns", label: "Tüm Yazılar" },
          { href: "/columns/new", label: "Yazı Ekle" },
        ],
      },
      {
        label: "Yorumlar",
        children: [{ href: "/comments", label: "Tüm Yorumlar" }],
      },
      {
        label: "Etiketler",
        children: [
          { href: "/tags", label: "Tüm Etiketler" },
          { href: "/tags/new", label: "Etiket Ekle" },
        ],
      },
    ],
  },
  {
    heading: "Site",
    items: [
      {
        label: "Menü",
        children: [
          { href: "/menu", label: "Tüm Menüler" },
          { href: "/menu/new", label: "Menü Ekle" },
        ],
      },
      {
        label: "Künye",
        children: [{ href: "/kunye", label: "Künye Bilgileri" }],
      },
      {
        label: "İletişim",
        children: [
          { href: "/iletisim", label: "Mesajlar" },
          { href: "/iletisim/duzenle", label: "İletişim Bilgileri" },
        ],
      },
      {
        label: "Sabit Sayfalar",
        children: [{ href: "/pages", label: "Tüm Sayfalar" }],
      },
    ],
  },
  {
    heading: "Gelir",
    items: [
      {
        label: "Reklamlar",
        children: [
          { href: "/ads", label: "Tüm Reklamlar" },
          { href: "/ads/new", label: "Reklam Ekle" },
        ],
      },
      {
        label: "Pop-up",
        children: [
          { href: "/popup", label: "Tüm Pop-uplar" },
          { href: "/popup/new", label: "Pop-up Ekle" },
        ],
      },
    ],
  },
  {
    heading: "Medya",
    items: [
      {
        label: "Video Galeri",
        children: [
          { href: "/video-gallery", label: "Tüm Videolar" },
          { href: "/video-gallery/new", label: "Video Ekle" },
        ],
      },
      {
        label: "Gazeteler",
        children: [{ href: "/newspapers", label: "Tüm Gazeteler" }],
      },
    ],
  },
  {
    heading: "Sistem",
    items: [
      {
        label: "Kullanıcılar",
        children: [
          { href: "/users", label: "Tüm Kullanıcılar" },
          { href: "/users/new", label: "Kullanıcı Ekle" },
        ],
      },
      {
        label: "Ayarlar",
        children: [{ href: "/brand-settings", label: "Marka & Site" }],
      },
      {
        label: "Kayıtlar",
        children: [{ href: "/logs", label: "İşlem Kayıtları" }],
      },
    ],
  },
];

export function Sidebar({
  open: mobileOpen,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const brand = useBrand();

  function matchesHref(href: string) {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");
  }

  function getActiveHref(children: NavChild[]) {
    return children
      .filter((c) => matchesHref(c.href))
      .reduce<
        string | null
      >((best, c) => (best === null || c.href.length > best.length ? c.href : best), null);
  }

  function isChildActive(children: NavChild[]) {
    return getActiveHref(children) !== null;
  }

  const defaultOpen = NAV.flatMap((g) =>
    g.items
      .filter((item) => isChildActive(item.children))
      .map((item) => item.label),
  );

  const [open, setOpen] = useState<string[]>(defaultOpen);

  useEffect(() => {
    const toOpen = NAV.flatMap((g) =>
      g.items
        .filter((item) => isChildActive(item.children))
        .map((item) => item.label),
    );
    setOpen((prev) => Array.from(new Set([...prev, ...toOpen])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggle(label: string) {
    setOpen((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
        />
      )}
      <nav
        className={`fixed top-0 left-0 bottom-0 w-60 bg-surface border-r border-line flex flex-col z-30 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2.5 px-[22px] py-[18px] border-b border-line"
        >
          <BrandLogo
            className="h-[30px] w-auto shrink-0"
            textClassName="text-[15px] font-extrabold font-archivo text-ink"
          />
          <span className="text-[11px] font-extrabold font-archivo tracking-wider text-muted uppercase">
            Yönetim Paneli
          </span>
        </Link>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV.map((group) => (
            <div key={group.heading}>
              <p className="px-2.5 pb-1.5 text-[10px] font-extrabold font-archivo uppercase tracking-widest text-muted">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isOpen = open.includes(item.label);
                  const anyActive = isChildActive(item.children);

                  if (item.children.length === 1) {
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.children[0].href}
                          onClick={onClose}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-bold font-archivo transition-colors ${
                            anyActive
                              ? "text-primary"
                              : "text-body hover:bg-surface-2 hover:text-ink"
                          }`}
                        >
                          <span
                            className={`w-1 h-4 rounded-sm shrink-0 transition-colors ${
                              anyActive ? "bg-primary" : "bg-transparent"
                            }`}
                          />
                          <span className="flex-1 text-left">{item.label}</span>
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => toggle(item.label)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-bold font-archivo transition-colors cursor-pointer ${
                          anyActive
                            ? "text-primary"
                            : "text-body hover:bg-surface-2 hover:text-ink"
                        }`}
                      >
                        {/* Active bar */}
                        <span
                          className={`w-1 h-4 rounded-sm shrink-0 transition-colors ${
                            anyActive ? "bg-primary" : "bg-transparent"
                          }`}
                        />
                        <span className="flex-1 text-left">{item.label}</span>
                        {isOpen ? (
                          <ChevronDown className="h-3.5 w-3.5 text-muted" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-muted" />
                        )}
                      </button>

                      {isOpen &&
                        item.children.length > 1 &&
                        (() => {
                          const activeHref = getActiveHref(item.children);
                          return (
                            <ul className="mt-0.5 ml-[18px] pl-3 border-l border-line-soft space-y-0.5">
                              {item.children.map((child) => {
                                const childActive = child.href === activeHref;
                                return (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      onClick={onClose}
                                      className={`flex items-center rounded-md px-2 py-1.5 text-[12.5px] transition-colors ${
                                        childActive
                                          ? "text-primary font-semibold bg-primary-light"
                                          : "text-muted-2 hover:bg-surface-2 hover:text-body"
                                      }`}
                                    >
                                      {child.label}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          );
                        })()}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer link */}
        <div className="px-[22px] py-4 border-t border-line">
          <span className="text-[11px] font-semibold text-muted">
            {brand.name} CMS
          </span>
        </div>
      </nav>
    </>
  );
}
