const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000";

export type CmsBrand = {
  name: string;
  logoUrl: string;
  faviconUrl: string | null;
  primaryColor: string | null;
};

const FALLBACK: CmsBrand = { name: "CMS", logoUrl: "", faviconUrl: null, primaryColor: null };

// Server-only. The public GET /brand row (Settings page) drives the CMS's own
// name, logo and primary color, so nothing brand-specific lives in this repo.
export async function getBrand(): Promise<CmsBrand> {
  try {
    const res = await fetch(`${API_BASE_URL}/brand`, { next: { revalidate: 60 } });
    if (!res.ok) return FALLBACK;
    const b = (await res.json()) as Partial<CmsBrand>;
    return {
      name: b.name || FALLBACK.name,
      logoUrl: b.logoUrl ?? "",
      faviconUrl: b.faviconUrl ?? null,
      primaryColor: b.primaryColor || null,
    };
  } catch {
    return FALLBACK;
  }
}
