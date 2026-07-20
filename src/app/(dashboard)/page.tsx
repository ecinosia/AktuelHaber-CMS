import Link from "next/link";

const SHORTCUTS = [
  { href: "/articles", label: "Haberler" },
  { href: "/articles/review-queue", label: "Onay Bekleyenler" },
  { href: "/comments", label: "Yorumlar" },
  { href: "/brand-settings", label: "Ayarlar" },
];

export default function DashboardHomePage() {
  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Kontrol Paneli</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SHORTCUTS.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="rounded border border-black/10 bg-white p-4 font-semibold hover:border-black/30"
          >
            {shortcut.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
