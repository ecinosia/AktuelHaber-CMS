# Design gaps — cms-design-exports vs. live CMS

Full diff of all 27 `.dc.html` exports against the live CMS, run 2026-09-01.
Verdict: **not fully implemented.** ~10 of 27 screens match exactly; the rest have
concrete gaps, and about a third of those require a Prisma schema change, not just
UI work — so this isn't a CMS-only fix list, `AktuelHaber-BE` needs work too.

## Schema-level gaps (need a Prisma migration in `AktuelHaber-BE`)

These are cases where the design wants a field the database has no column for.
Building the UI without a migration first is not possible for these.

| Model | Missing fields | Design source | Notes |
|---|---|---|---|
| `Popup` | `type` (Bülten/Duyuru/Reklam), `trigger` (load/exit-intent/scroll/delay), `position`, time-of-day on start/end | Popup Ekle | Found in initial scan; drives both the add form and the list's Tür/Tetikleyici columns |
| `AdBanner` | `name`, `company`, `placement` (9-option enum: Menü Bar, Menü Altı, Üst Manşet Altı, etc.), start/end date **and time** | Reklamlar, Reklam Ekle | Current model only has `slot/type/imageUrl/linkUrl/adUnitCode/active`; `type` enum values (STATIC/ADSENSE) don't match design's (Görsel Banner/HTML5/Video) either |
| `Video` | `description`, `category`, `status`, `duration`, `views` | Video Galeri, Video Ekle | `videoUrl` is a link field; design wants native file upload (MP4/MOV ≤500MB) — bigger change than a column add |
| `Newspaper` | boolean visibility flag (`shown`/`isVisible`) | Gazeteler | Design is a curated show/hide toggle list, not full CRUD — current CMS built full add/edit/delete instead, which the design doesn't have at all |
| `BrandSettings` | `slogan`, `googleNewsPublisherId`, `googleNewsSitemapUrl` (Ayarlar); separately `workingHours`, `mapLink` (İletişim Düzenle) | Ayarlar, Iletisim Duzenle | Two different design screens, same underlying model |
| `Article` | `metaTitle`, `metaDescription`, `keywords`; multi-category support (`categoryId` is a single relation, design wants checkbox multi-select); `placement` enum values don't match design's position labels | Haber Ekle | |
| `Category` | `description`, `keywords`, `metaTitle`, `metaDescription`, `coverImage`, `isActive`/status | Kategoriler, Kategori Ekle | Category form currently only has name+slug; this is the largest single-screen gap found |
| `MenuItem` | status field (Aktif/Pasif); `MenuLocation` enum missing `MOBIL`; no parent-group entity (design models a menu as a named group containing a repeater of sub-items — Etiket/URL/Sıra — not flat items) | Menu, Menu Ekle | Structural gap, not just a missing column |
| `ContactMessage` | `subject` (Konu) | Iletisim | `isRead` already exists — the missing read/unread filter tabs on the list are a UI-only gap, not schema |
| Comments | no `DELETE` endpoint at all | Yorumlar | `comments.controller.ts` only exposes approve/reject/spam; design's row-level delete (✕) has nothing to call |

## UI-only gaps (schema already supports it, code just doesn't use it)

- **Haberler (list):** missing the `date` column the design has.
- **Yazarlar (list):** missing "Haber Sayısı" (article count) column.
- **Iletisim (list):** design wants `Tümü/Okunmadı/Okundu` status tabs — `isRead` exists on `ContactMessage`, tabs were just never wired up (current UI uses an inline badge instead).
- **Kunye (list/form):** design marks kunye rows as non-deletable (`hide-delete=true`) and read-only ordering; live CMS added a working delete button and up/down reorder controls the design doesn't have — a UI/policy divergence, not missing data. Also field labels diverge: design's "Başlık"/"Detay" (role → free-text description) vs code's "Ad Soyad"/"Ünvan" (name/title) — same 2-column shape, different semantics.
- **Sabit Sayfalar (list):** design intends a fixed, non-deletable set of pages (`hide-add-button`, `hide-delete`); live CMS allows free add/delete. Policy decision, not a schema gap.
- **Ads/Popup/Video lists:** don't use `DataTable`'s built-in `showThumbnail`/`thumbnailKey` props — thumbnails are hand-inlined into a cell instead. Cosmetic/maintenance issue, not a functional gap.

## Screens confirmed to match

Layout, List Template (`DataTable.tsx`), Dashboard, Login, Yazar Ekle, Sabit Sayfa
Duzenle (implementation is a superset — adds slug + rich text editor, doesn't drop
anything the design has).

## Out of design scope

No corresponding `.dc.html` export exists for: `football`, `horoscope`,
`market-weather`, `prayer-times`, `pharmacies`, `tags`, `users`, `brand-settings`'s
extra sections (Renk Şeması, ads.txt), and `newspapers/new` (`NewspaperForm.tsx` — the
design never specifies an add form for newspapers, only the toggle list).

## Done this session

- Copied real brand wordmark into `AktuelHaber-CMS/public/logo.svg`, replacing the
  placeholder "AH" text badge in `Sidebar.tsx` and `login/page.tsx`.
- Added `src/app/icon.svg` — CMS had no favicon before.
- Full diff of all 27 exports against live code (this file). No code changes made
  for any of the gaps above — all deferred per request, split between CMS-only UI
  work and `AktuelHaber-BE` schema work.
