"use client";

import { createContext, useContext } from "react";

type Brand = { name: string; logoUrl: string };

const BrandContext = createContext<Brand>({ name: "CMS", logoUrl: "" });

export function BrandProvider({ brand, children }: { brand: Brand; children: React.ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export const useBrand = () => useContext(BrandContext);

// Logo image when the brand has one, otherwise its name as text.
export function BrandLogo({ className, textClassName }: { className: string; textClassName?: string }) {
  const { name, logoUrl } = useBrand();
  return logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt={name} className={className} />
  ) : (
    <span className={textClassName ?? "font-archivo text-lg font-extrabold text-ink"}>{name}</span>
  );
}
