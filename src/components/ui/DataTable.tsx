"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useConfirm } from "@/components/providers/ConfirmProvider";

export type DataTableColumn<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
};

export type DataTableAction<T> = {
  label: string;
  href?: (row: T) => string;
  onClick?: (row: T) => void;
  variant?: "default" | "danger";
};

type StatusTab = { label: string; value: string };

const deleteMessage = (subject: string, hint?: string) =>
  `${subject} ve görselleri kalıcı olarak silinecek; bu işlem geri alınamaz.${hint ? ` ${hint}` : ""}`;

type Props<T extends { id: string; status?: string }> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  addHref?: string;
  addLabel?: string;
  searchPlaceholder?: string;
  statusTabs?: StatusTab[];
  showThumbnail?: boolean;
  thumbnailKey?: keyof T;
  actions?: DataTableAction<T>[];
  loading?: boolean;
  emptyText?: string;
  headerAction?: React.ReactNode;
  onDelete?: (id: string) => void;
  deleteHint?: string; // appended to the permanent-delete warning, e.g. a reversible alternative
  editHref?: (row: T) => string;
  viewHref?: (row: T) => string;
  hideStatus?: boolean;
  hideDelete?: boolean;
  statusLabel?: (status: string, row: T) => React.ReactNode;
  filterBar?: React.ReactNode;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Aktif: "bg-up-bg text-up",
    Yayında: "bg-up-bg text-up",
    PUBLISHED: "bg-up-bg text-up",
    ACTIVE: "bg-up-bg text-up",
    Onaylanan: "bg-up-bg text-up",
    Pasif: "bg-surface-2 text-muted",
    Taslak: "bg-surface-2 text-muted",
    DRAFT: "bg-surface-2 text-muted",
    INACTIVE: "bg-surface-2 text-muted",
    Bekleyen: "bg-pending-bg text-pending",
    PENDING_REVIEW: "bg-pending-bg text-pending",
    Okunmadı: "bg-pending-bg text-pending",
    Reddedilen: "bg-down-bg text-down",
    ARCHIVED: "bg-down-bg text-down",
    Okundu: "bg-surface-2 text-muted",
    SCHEDULED: "bg-blue-100 text-blue-700",
  };

  const STATUS_TR: Record<string, string> = {
    PUBLISHED: "Yayında",
    DRAFT: "Taslak",
    PENDING_REVIEW: "Onay Bekliyor",
    SCHEDULED: "Zamanlanmış",
    ARCHIVED: "Arşivlendi",
    ACTIVE: "Aktif",
    INACTIVE: "Pasif",
  };

  const cls = map[status] ?? "bg-surface-2 text-muted";
  const label = STATUS_TR[status] ?? status;

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-archivo ${cls}`}
    >
      {label}
    </span>
  );
}

export function DataTable<T extends { id: string; status?: string }>({
  columns,
  rows,
  addHref,
  addLabel = "Ekle",
  searchPlaceholder = "Ara...",
  statusTabs,
  showThumbnail,
  thumbnailKey,
  actions,
  loading,
  emptyText = "Kayıt bulunamadı.",
  headerAction,
  onDelete,
  deleteHint,
  editHref,
  viewHref,
  hideStatus,
  hideDelete,
  statusLabel,
  filterBar,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(statusTabs?.[0]?.value ?? "");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(true);
  const confirmDialog = useConfirm();

  const filtered = useMemo(() => {
    let data = rows;
    if (activeTab && activeTab !== "Tümü" && activeTab !== "") {
      data = data.filter((r) => r.status === activeTab);
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        Object.values(r as Record<string, unknown>)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (sortKey) {
      data = [...data].sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortKey] ?? "");
        const bv = String((b as Record<string, unknown>)[sortKey] ?? "");
        return av.localeCompare(bv, "tr", { numeric: true }) * sortDir;
      });
    }
    return data;
  }, [rows, search, activeTab, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (pageRows.every((r) => selected.has(r.id))) {
      setSelected((prev) => { const next = new Set(prev); pageRows.forEach((r) => next.delete(r.id)); return next; });
    } else {
      setSelected((prev) => { const next = new Set(prev); pageRows.forEach((r) => next.add(r.id)); return next; });
    }
  }

  const allSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  const showActionCol = editHref || viewHref || onDelete || (actions && actions.length > 0);
  const showStatusCol = !hideStatus && rows.some((r) => r.status !== undefined);

  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full sm:w-64 pl-9 pr-3 py-2 border border-line-strong rounded-md text-[13px] text-ink placeholder-muted-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              style={{ fontFamily: "var(--font-public-sans)" }}
            />
          </div>

          {/* Status tabs */}
          {statusTabs && statusTabs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {statusTabs.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => { setActiveTab(t.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full border text-[12px] font-bold font-archivo cursor-pointer transition-colors ${
                    activeTab === t.value
                      ? "bg-primary text-white border-primary"
                      : "bg-surface text-body border-line-strong hover:border-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {headerAction}
          {filterBar && (
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`inline-flex items-center gap-1.5 text-[13px] font-bold font-archivo px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                filtersOpen ? "bg-primary-light text-primary border-primary" : "bg-surface text-body border-line-strong hover:border-muted"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtrele
            </button>
          )}
          {addHref && (
            <Link
              href={addHref}
              className="inline-flex items-center gap-1.5 bg-primary text-white text-[13px] font-bold font-archivo px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
            >
              + {addLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Filter bar */}
      {filterBar && filtersOpen && (
        <div className="flex items-center gap-2 flex-wrap px-5 py-3 border-b border-line">
          {filterBar}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && onDelete && (
        <div className="flex items-center gap-4 px-5 py-3 bg-primary-light border-b border-line">
          <span className="text-[13px] text-body" style={{ fontFamily: "var(--font-public-sans)" }}>
            {selected.size} kayıt seçildi
          </span>
          <button
            type="button"
            onClick={async () => {
              if (await confirmDialog(deleteMessage(`${selected.size} kayıt`, deleteHint))) {
                selected.forEach((id) => onDelete(id));
                setSelected(new Set());
              }
            }}
            className="text-[12px] font-bold font-archivo text-white bg-down px-3 py-1.5 rounded-md cursor-pointer"
          >
            Seçilenleri Sil
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-page">
              <th className="w-10 px-3 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-primary" />
              </th>
              {showThumbnail && <th className="w-14 px-2 py-3" />}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable !== false && toggleSort(String(col.key))}
                  style={col.width ? { width: col.width } : undefined}
                  className={`text-left px-3 py-3 text-[10.5px] font-extrabold font-archivo uppercase tracking-wider text-muted select-none whitespace-nowrap ${col.sortable === false ? "" : "cursor-pointer"}`}
                >
                  {col.label}
                  {col.sortable !== false && sortKey === String(col.key) && (sortDir === 1 ? " ↑" : " ↓")}
                </th>
              ))}
              {showStatusCol && (
                <th className="text-left px-3 py-3 text-[10.5px] font-extrabold font-archivo uppercase tracking-wider text-muted">
                  DURUM
                </th>
              )}
              {showActionCol && <th className="w-28 px-3 py-3" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-line-soft">
                  <td colSpan={columns.length + 4} className="px-3 py-4">
                    <div className="h-4 rounded bg-surface-3 animate-pulse" />
                  </td>
                </tr>
              ))
            ) : pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 4}
                  className="px-5 py-12 text-center text-[13px] text-muted-2"
                  style={{ fontFamily: "var(--font-public-sans)" }}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id} className="border-t border-line-soft hover:bg-page transition-colors">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="accent-primary"
                    />
                  </td>
                  {showThumbnail && thumbnailKey && (
                    <td className="px-2 py-2.5">
                      {(row as Record<string, unknown>)[thumbnailKey as string] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={String((row as Record<string, unknown>)[thumbnailKey as string])}
                          alt=""
                          className="h-9 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-9 w-12 rounded bg-surface-3" />
                      )}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-3 py-2.5 text-[13px] text-ink"
                      style={{ fontFamily: "var(--font-public-sans)" }}
                    >
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[String(col.key)] ?? "")}
                    </td>
                  ))}
                  {showStatusCol && (
                    <td className="px-3 py-2.5">
                      {row.status && (
                        statusLabel ? statusLabel(row.status, row) : <StatusBadge status={row.status} />
                      )}
                    </td>
                  )}
                  {showActionCol && (
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {viewHref && (
                          <Link
                            href={viewHref(row)}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 flex items-center justify-center border border-line-head rounded text-muted hover:bg-surface-2 transition-colors text-sm"
                            title="Canlıda Gör"
                          >
                            ◎
                          </Link>
                        )}
                        {editHref && (
                          <Link
                            href={editHref(row)}
                            className="w-8 h-8 flex items-center justify-center border border-line-head rounded text-muted hover:bg-surface-2 transition-colors text-sm"
                            title="Düzenle"
                          >
                            ✎
                          </Link>
                        )}
                        {!hideDelete && onDelete && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (await confirmDialog(deleteMessage("Bu kayıt", deleteHint))) onDelete(row.id);
                            }}
                            className="w-8 h-8 flex items-center justify-center border border-line-head rounded text-down hover:bg-down-bg transition-colors text-sm cursor-pointer"
                            title="Sil"
                          >
                            ✕
                          </button>
                        )}
                        {actions?.map((action) =>
                          action.href ? (
                            <Link
                              key={action.label}
                              href={action.href(row)}
                              className="text-[11px] font-bold font-archivo px-2 py-1 rounded border border-line-head text-muted hover:bg-surface-2 transition-colors"
                            >
                              {action.label}
                            </Link>
                          ) : (
                            <button
                              key={action.label}
                              type="button"
                              onClick={() => action.onClick?.(row)}
                              className={`text-[11px] font-bold font-archivo px-2 py-1 rounded border cursor-pointer transition-colors ${
                                action.variant === "danger"
                                  ? "border-down text-down hover:bg-down-bg"
                                  : "border-line-head text-muted hover:bg-surface-2"
                              }`}
                            >
                              {action.label}
                            </button>
                          ),
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-t border-line">
        <span className="text-[12px] text-muted-2" style={{ fontFamily: "var(--font-public-sans)" }}>
          {filtered.length === 0
            ? "Kayıt yok"
            : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} / ${filtered.length}`}
        </span>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="px-2 py-1.5 border border-line-strong rounded-md text-[12px] text-body"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} / sayfa</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center border border-line-strong rounded text-sm text-muted disabled:opacity-40 cursor-pointer hover:bg-surface-2 transition-colors"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`w-8 h-8 flex items-center justify-center border rounded text-[12px] font-bold font-archivo cursor-pointer transition-colors ${
                n === currentPage
                  ? "bg-primary text-white border-primary"
                  : "border-line-strong text-body hover:bg-surface-2"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center border border-line-strong rounded text-sm text-muted disabled:opacity-40 cursor-pointer hover:bg-surface-2 transition-colors"
          >
            ›
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
