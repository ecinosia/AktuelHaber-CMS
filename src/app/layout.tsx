import type { Metadata } from "next";
import { Archivo, Public_Sans } from "next/font/google";
import { getBrand } from "@/lib/brand";
import { BrandProvider } from "@/components/providers/BrandProvider";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-public-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    title: `${brand.name} | Yönetim Paneli`,
    ...(brand.faviconUrl && { icons: { icon: brand.faviconUrl } }),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getBrand();
  // Set on <html> (not <body>) so the --color-primary aliases in globals.css,
  // which are resolved at :root, pick up the brand color too.
  const theme = brand.primaryColor
    ? ({
        "--brand-primary": brand.primaryColor,
        "--brand-primary-hover":
          "color-mix(in srgb, var(--brand-primary) 85%, black)",
        "--brand-primary-light":
          "color-mix(in srgb, var(--brand-primary) 8%, white)",
        "--brand-primary-muted":
          "color-mix(in srgb, var(--brand-primary) 15%, white)",
      } as React.CSSProperties)
    : undefined;

  return (
    <html lang="tr" style={theme}>
      <body className={`${archivo.variable} ${publicSans.variable}`}>
        <BrandProvider brand={{ name: brand.name, logoUrl: brand.logoUrl }}>
          {children}
        </BrandProvider>
      </body>
    </html>
  );
}
