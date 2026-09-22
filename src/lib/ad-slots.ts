export const AD_SLOTS = [
  { key: "header", label: "Logo Yanı" },
  { key: "under-logo", label: "Logo Altı" },
  { key: "home-mid-1", label: "Ana Sayfa Üst Manşet Altı" },
  { key: "home-mid-2", label: "Ana Sayfa Ana Manşet Altı" },
  { key: "article-sidebar", label: "Haber İçi Yan Bar" },
  { key: "category-sidebar", label: "Kategori Sayfaları Yan Bar" },
  { key: "secondary-pages", label: "İkincil Sayfalar Sonu (Burçlar, Kategoriler, Hava Durumu vb.)" },
  {
    key: "in-article",
    label: "Haber İçi",
    hint: "Maksimum 2 adet Haber İçi reklam girilebilir. İlki 1. paragraf, ikincisi 3. paragraf sonrası gösterilir.",
  },
  { key: "ana-manset-3", label: "Ana Manşet 3. Sıra" },
  { key: "ana-manset-5", label: "Ana Manşet 5. Sıra" },
] as const;

export const slotLabel = (key: string) => AD_SLOTS.find((s) => s.key === key)?.label ?? key;
