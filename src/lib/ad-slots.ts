export const AD_SLOTS = [
  { key: "header", size: "Masaüstü 728x90 · Mobil (yalnızca ana sayfa) ~342x100", label: "Logo Yanı" },
  { key: "under-logo", size: "Masaüstü 1312x235 · Mobil ~342x100", label: "Logo Altı" },
  { key: "home-mid-1", size: "Masaüstü 1312x235 · Mobil ~342x100", label: "Ana Sayfa Üst Manşet Altı" },
  { key: "home-mid-2", size: "Masaüstü 1312x235 · Mobil ~342x100", label: "Ana Sayfa Ana Manşet Altı" },
  { key: "article-sidebar", size: "Masaüstü ~427x280 · Mobil ~342x280", label: "Haber İçi Yan Bar" },
  { key: "category-sidebar", size: "Masaüstü ~427x280 · Mobil ~358x100", label: "Kategori Sayfaları Yan Bar" },
  { key: "secondary-pages", size: "Masaüstü ~1312x120 · Mobil ~342x100", label: "İkincil Sayfalar Sonu (Burçlar, Kategoriler, Hava Durumu vb.)" },
  {
    key: "in-article",
    size: "Genişlik 860px (mobilde tam genişlik), yükseklik serbest",
    label: "Haber İçi",
    hint: "Kayıtlı reklam sayısı sınırsızdır, ancak aynı anda en fazla 2 aktif Haber İçi reklam olabilir. İlki 1. paragraf, ikincisi 3. paragraf sonrası gösterilir.",
  },
  { key: "ana-manset-3", size: "Masaüstü 1312x656 (2:1) · Mobil ~342x256 (4:3)", label: "Ana Manşet 3. Sıra" },
  { key: "ana-manset-5", size: "Masaüstü 1312x656 (2:1) · Mobil ~342x256 (4:3)", label: "Ana Manşet 5. Sıra" },
] as const;

export const slotLabel = (key: string) => AD_SLOTS.find((s) => s.key === key)?.label ?? key;
