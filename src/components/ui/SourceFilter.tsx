"use client";

export type SourceFilterValue = "" | "migrated" | "native";

const OPTIONS: { label: string; value: SourceFilterValue }[] = [
  { label: "Tümü", value: "" },
  { label: "İçe Aktarılan", value: "migrated" },
  { label: "Yerli", value: "native" },
];

// Independent of DataTable's statusTabs (which filter on `status`) — this
// filters on Boolean(legacySourceId), so it stacks alongside status tabs
// rather than replacing them. Shared by every list whose model carries
// legacySourceId (Article, Column, Category, Author).
export function SourceFilter({ value, onChange }: { value: SourceFilterValue; onChange: (v: SourceFilterValue) => void }) {
  return (
    <div className="flex gap-1.5">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-full border text-[12px] font-bold font-archivo cursor-pointer transition-colors ${
            value === o.value ? "bg-primary text-white border-primary" : "bg-surface text-body border-line-strong hover:border-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function applySourceFilter<T extends { legacySourceId: string | null }>(items: T[], value: SourceFilterValue): T[] {
  if (value === "migrated") return items.filter((i) => Boolean(i.legacySourceId));
  if (value === "native") return items.filter((i) => !i.legacySourceId);
  return items;
}

export function MigratedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-block ml-1.5 align-middle rounded-full bg-surface-2 text-muted text-[10px] font-bold font-archivo px-1.5 py-0.5">
      İçe Aktarıldı
    </span>
  );
}
