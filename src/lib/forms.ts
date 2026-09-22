// class-validator's @IsOptional() only exempts undefined/null — an empty
// string still hits @IsEmail()/@IsUrl() and gets rejected. Blank optional
// form fields must be sent as undefined (omitted), not "".
export function omitEmptyStrings<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    (result as Record<string, unknown>)[key] = value === "" ? undefined : value;
  }
  return result;
}

// Absolute FE URL for a record's live page — the CMS is a different origin
// than the front-end, so this needs the full URL, not a relative Link.
// Mirrors AktuelHaber-FE's own getArticleHref/getColumnHref
// (src/lib/article-view.ts): legacyPath wins when set (migrated content must
// keep serving at its exact pre-migration URL), otherwise the current shape.
type PublicUrlItem =
  | { kind: "article"; slug: string; legacyPath: string | null }
  | { kind: "column"; slug: string; legacyPath: string | null; author: { slug: string } }
  | { kind: "category"; slug: string }
  | { kind: "author"; slug: string };

export function publicUrlFor(item: PublicUrlItem): string {
  const base = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "";
  const path =
    item.kind === "article"
      ? (item.legacyPath ?? `/haber/${item.slug}`)
      : item.kind === "column"
        ? (item.legacyPath ?? `/yazarlar/${item.author.slug}/${item.slug}`)
        : item.kind === "category"
          ? `/kategori/${item.slug}`
          : `/yazarlar/${item.slug}`;
  return `${base}${path}`;
}
