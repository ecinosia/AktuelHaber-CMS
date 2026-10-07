"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import type { Tag } from "@/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o").replace(/[şŞ]/g, "s").replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

// An existing tag is reused rather than duplicated. Looked up by slug first (unique, a single row),
// then by name, because an imported tag can carry a suffixed slug ("ankara-2") for the same name.
// Previously the whole tag table was held in the browser for this, which on a migrated brand meant
// 35,538 tags (a 6 MB response) on every article form.
async function findExisting(name: string): Promise<Tag | null> {
  const slug = slugify(name);
  if (slug) {
    const bySlug = await api.tags.bySlug(slug).catch(() => null);
    if (bySlug) return bySlug;
  }
  const page = await api.tags.list({ q: name, pageSize: 50 }).catch(() => null);
  return page?.items.find((t) => t.name.toLowerCase() === name.toLowerCase()) ?? null;
}

export function TagInput({
  selected,
  onChange,
}: {
  selected: Tag[];
  onChange: (tags: Tag[]) => void;
}) {
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);

  async function commit(rawName: string) {
    const name = rawName.trim();
    if (!name) return;
    if (selected.some((t) => t.name.toLowerCase() === name.toLowerCase())) return;

    setCreating(true);
    try {
      const existing = await findExisting(name);
      // A slug that is already taken by a different name would make create fail; reuse covers the common case.
      onChange([...selected, existing ?? (await api.tags.create({ slug: slugify(name), name }))]);
    } catch {
      // transient error — the editor can retype
    } finally {
      setCreating(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const value = input;
      setInput("");
      void commit(value.replace(/,$/, ""));
    } else if (event.key === "Backspace" && !input && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  }

  function remove(id: string) {
    onChange(selected.filter((t) => t.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        className="cms-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) { void commit(input); setInput(""); } }}
        placeholder={creating ? "Ekleniyor..." : "Etiket yazıp virgül veya Enter'a basın"}
      />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary-light px-2.5 py-0.5 text-[12px] font-bold font-archivo text-primary"
            >
              {tag.name}
              <button type="button" onClick={() => remove(tag.id)} className="hover:text-down cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
