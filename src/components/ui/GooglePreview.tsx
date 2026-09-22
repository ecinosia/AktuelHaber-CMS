import { publicUrlFor } from "@/lib/forms";

export function GooglePreview({
  title,
  metaTitle,
  metaDescription,
  spot,
  slug,
}: {
  title: string;
  metaTitle: string;
  metaDescription: string;
  spot: string;
  slug: string;
}) {
  const url = publicUrlFor({ kind: "article", slug: slug || "haber-url", legacyPath: null });

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-line bg-white p-3">
      <span className="text-[12px] text-up truncate" style={{ fontFamily: "var(--font-public-sans)" }}>{url}</span>
      <span className="text-[17px] text-[#1a0dab] leading-snug truncate" style={{ fontFamily: "arial, sans-serif" }}>
        {metaTitle || title || "Haber Başlığı"}
      </span>
      <span className="text-[13px] text-muted-2 line-clamp-2" style={{ fontFamily: "arial, sans-serif" }}>
        {metaDescription || spot || "Meta açıklama burada görünecek..."}
      </span>
    </div>
  );
}
