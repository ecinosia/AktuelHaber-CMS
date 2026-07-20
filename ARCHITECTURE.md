# AktuelHaber-CMS — Architecture

Admin panel editors use to create/manage news and all other site content.
Talks to one brand's AktuelHaber-BE instance. Deployed once per brand,
matching the fully-isolated-per-brand model (same codebase, per-brand env).

## Stack

- **Next.js (App Router, TypeScript)** — same framework as FE for shared
  tooling/knowledge; mostly client-heavy admin screens, minimal SEO concerns.
- **Tailwind CSS** — plain admin UI, no per-brand theming needed (internal tool).
- **JWT session** against AktuelHaber-BE `/auth` endpoints (httpOnly cookie).

## Folder structure

```
src/
  app/
    login/                    Editor/admin login
    (dashboard)/
      articles/                Haber list/create/edit, son dakika + öne çıkan flags
      categories/               Kategori CRUD
      authors/                   Yazar CRUD
      horoscope/                 Burç günlük metin girişi
      prayer-times/             Namaz vakitleri girişi (per city/date)
      pharmacies/                 Nöbetçi eczane girişi (per district/date)
      video-gallery/              Video haber CRUD
      newspapers/                Gazete kapağı upload
      football/                   Süper Lig puan durumu girişi
      menu/                       Header/footer menü öğeleri
      ads/                        Reklam banner slot yönetimi
      brand-settings/            Logo, açıklama, iletişim, sosyal medya, tema renkleri
  components/
    layout/                     Sidebar nav, topbar, auth guard wrapper
    ui/                          Buttons, inputs, table, modal (shared primitives)
    forms/                       Per-content-type form components
  lib/                            api.ts (BE client with auth), auth helpers
```

## Data flow

Every screen is a thin CRUD UI over the matching AktuelHaber-BE module
(`/articles`, `/categories`, ... — see AktuelHaber-BE/ARCHITECTURE.md). No
direct DB access from CMS — everything goes through the BE API so validation
and auth stay centralized.

## Deployment (VPS)

- One Next.js instance per brand via PM2, distinct port, proxied by Nginx
  under an internal/admin subdomain (e.g. `cms.brandname.com`), ideally
  behind basic auth or IP allowlist at the Nginx layer in addition to app
  login.
