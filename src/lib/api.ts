import type {
  ActivityLog,
  AdBanner,
  AdminUser,
  Article,
  ArticlePlacement,
  ArticleStatus,
  Author,
  BrandSettings,
  Category,
  Column,
  Comment,
  CommentStatus,
  ContactMessage,
  DashboardStats,
  FootballStanding,
  HoroscopeEntry,
  MarketRate,
  Masthead,
  Menu,
  MenuItem,
  MenuLocation,
  MenuStatus,
  Newspaper,
  Paginated,
  Pharmacy,
  Popup,
  PrayerTime,
  Session,
  StaticPage,
  Tag,
  Video,
} from "@/types";

// The browser talks to the BE through this app's own /api proxy (see
// next.config.mjs): same origin, so the session cookie lands on the CMS host and
// the BE never needs to be publicly reachable. Server-side code (no window) skips
// the hop and calls the BE's internal address directly.
const API_BASE_URL =
  typeof window === "undefined" ? (process.env.API_BASE_URL ?? "http://localhost:4000") : "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Nest's default error body is { message: string | string[], error, statusCode }.
// class-validator failures give an array (one entry per failed field); everything
// else (ConflictException, NotFoundException, ...) gives a single string.
async function extractErrorMessage(res: Response, path: string, method?: string): Promise<string> {
  const fallback = `API request failed: ${method ?? "GET"} ${path} -> ${res.status}`;
  try {
    const body = await res.json();
    if (Array.isArray(body?.message)) return body.message.join(" ");
    if (typeof body?.message === "string") return body.message;
    return fallback;
  } catch {
    return fallback;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, credentials: "include" });

  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res, path, options.method), res.status);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

function withBody(method: string, body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export type MenuInput = {
  name: string;
  location: MenuLocation;
  status: MenuStatus;
  items: { label: string; url: string }[];
};

export type MediaUploadKind = "article" | "avatar" | "logo" | "banner" | "content" | "newspaper" | "video";

export const api = {
  auth: {
    login: (username: string, password: string, remember = false) =>
      apiFetch<{ email: string; role: string }>("/auth/login", withBody("POST", { username, password, remember })),
    forgotPassword: (email: string) =>
      apiFetch<{ success: boolean }>("/auth/forgot-password", withBody("POST", { email })),
    logout: () => apiFetch<{ success: boolean }>("/auth/logout", { method: "POST" }),
    me: () => apiFetch<Session>("/auth/me"),
  },

  media: {
    upload: async (file: File, kind: MediaUploadKind = "article"): Promise<Record<string, string>> => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/media/upload?kind=${kind}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        throw new ApiError(`Upload failed -> ${res.status}`, res.status);
      }
      return res.json() as Promise<Record<string, string>>;
    },
    uploadVideo: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/media/upload-video`, { method: "POST", credentials: "include", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new ApiError(body?.message ?? `Upload failed -> ${res.status}`, res.status);
      }
      return ((await res.json()) as { url: string }).url;
    },
    ingestVideo: (url: string) => apiFetch<{ url: string }>("/media/ingest-video", withBody("POST", { url })).then((r) => r.url),
    // Server re-fetches the URL and stores it under a fresh UUID (SSRF-guarded).
    ingest: (url: string, kind: MediaUploadKind = "article") =>
      apiFetch<Record<string, string>>("/media/ingest", withBody("POST", { url, kind })),
  },

  brand: {
    get: () => apiFetch<BrandSettings | null>("/brand"),
    update: (dto: Partial<Omit<BrandSettings, "id" | "updatedAt">>) =>
      apiFetch<BrandSettings>("/brand", withBody("PATCH", dto)),
  },

  dashboard: {
    stats: () => apiFetch<DashboardStats>("/dashboard/stats"),
  },

  menu: {
    list: () => apiFetch<Menu[]>("/menus"),
    get: (id: string) => apiFetch<Menu & { items: MenuItem[] }>(`/menus/${id}`),
    create: (dto: MenuInput) => apiFetch<Menu>("/menus", withBody("POST", dto)),
    update: (id: string, dto: Partial<MenuInput>) => apiFetch<Menu>(`/menus/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/menus/${id}`, { method: "DELETE" }),
  },

  categories: {
    list: () => apiFetch<Category[]>("/categories"),
    create: (dto: { slug: string; name: string; color?: string; metaDescription?: string }) =>
      apiFetch<Category>("/categories", withBody("POST", dto)),
    update: (id: string, dto: Partial<{ slug: string; name: string; color: string; metaDescription: string }>) =>
      apiFetch<Category>(`/categories/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/categories/${id}`, { method: "DELETE" }),
  },

  authors: {
    list: () => apiFetch<Author[]>("/authors"),
    create: (
      dto: Partial<Omit<Author, "id" | "createdAt">> & { slug: string; firstName: string; lastName: string },
    ) => apiFetch<Author>("/authors", withBody("POST", dto)),
    update: (id: string, dto: Partial<Omit<Author, "id" | "createdAt">>) =>
      apiFetch<Author>(`/authors/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/authors/${id}`, { method: "DELETE" }),
  },

  tags: {
    list: () => apiFetch<Tag[]>("/tags"),
    create: (dto: { slug: string; name: string }) => apiFetch<Tag>("/tags", withBody("POST", dto)),
    update: (id: string, dto: Partial<{ slug: string; name: string }>) =>
      apiFetch<Tag>(`/tags/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/tags/${id}`, { method: "DELETE" }),
  },

  articles: {
    adminList: (params: {
      status?: ArticleStatus;
      categoryId?: string;
      authorId?: string;
      page?: number;
      pageSize?: number;
    } = {}) => apiFetch<Paginated<Article>>(`/articles/admin${buildQuery(params)}`),
    reviewQueue: () => apiFetch<Article[]>("/articles/review-queue"),
    byId: (id: string) => apiFetch<Article>(`/articles/id/${id}`),
    create: (dto: ArticleWritePayload) => apiFetch<Article>("/articles", withBody("POST", dto)),
    update: (id: string, dto: Partial<ArticleWritePayload>) =>
      apiFetch<Article>(`/articles/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/articles/${id}`, { method: "DELETE" }),
    approve: (id: string) => apiFetch<Article>(`/articles/${id}/approve`, { method: "POST" }),
    reject: (id: string) => apiFetch<Article>(`/articles/${id}/reject`, { method: "POST" }),
  },

  columns: {
    adminList: (params: { status?: ArticleStatus; authorId?: string; page?: number; pageSize?: number } = {}) =>
      apiFetch<Paginated<Column>>(`/columns/admin${buildQuery(params)}`),
    byId: (id: string) => apiFetch<Column>(`/columns/id/${id}`),
    bySlug: (slug: string) => apiFetch<Column>(`/columns/slug/${slug}`),
    create: (dto: ColumnWritePayload) => apiFetch<Column>("/columns", withBody("POST", dto)),
    update: (id: string, dto: Partial<ColumnWritePayload>) =>
      apiFetch<Column>(`/columns/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/columns/${id}`, { method: "DELETE" }),
  },

  comments: {
    list: (params: { articleId?: string; status?: CommentStatus; page?: number; pageSize?: number } = {}) =>
      apiFetch<Paginated<Comment>>(`/comments${buildQuery(params)}`),
    approve: (id: string) => apiFetch<Comment>(`/comments/${id}/approve`, { method: "POST" }),
    reject: (id: string) => apiFetch<Comment>(`/comments/${id}/reject`, { method: "POST" }),
    markSpam: (id: string) => apiFetch<Comment>(`/comments/${id}/spam`, { method: "POST" }),
    remove: (id: string) => apiFetch<void>(`/comments/${id}`, { method: "DELETE" }),
  },

  ads: {
    adminList: () => apiFetch<AdBanner[]>("/ads/admin"),
    create: (dto: {
      slots: string[];
      imageUrl?: string;
      linkUrl?: string;
      active?: boolean;
      name: string;
      company: string;
      startsAt: string;
      endsAt: string;
    }) => apiFetch<AdBanner>("/ads", withBody("POST", dto)),
    update: (id: string, dto: Partial<Omit<AdBanner, "id">>) =>
      apiFetch<AdBanner>(`/ads/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/ads/${id}`, { method: "DELETE" }),
  },

  pages: {
    list: () => apiFetch<StaticPage[]>("/pages"),
    update: (id: string, dto: Partial<{ title: string; content: string; data: Record<string, unknown> }>) =>
      apiFetch<StaticPage>(`/pages/${id}`, withBody("PATCH", dto)),
  },

  masthead: {
    get: () => apiFetch<Masthead>("/masthead"),
    update: (dto: Masthead) => apiFetch<Masthead>("/masthead", withBody("PATCH", dto)),
  },

  contact: {
    list: (params: { page?: number; pageSize?: number; q?: string } = {}) =>
      apiFetch<Paginated<ContactMessage> & { unread: number }>(`/contact${buildQuery(params)}`),
    markRead: (id: string) => apiFetch<ContactMessage>(`/contact/${id}/read`, { method: "PATCH" }),
    markUnread: (id: string) => apiFetch<ContactMessage>(`/contact/${id}/unread`, { method: "PATCH" }),
    remove: (id: string) => apiFetch<void>(`/contact/${id}`, { method: "DELETE" }),
  },

  marketData: {
    list: () => apiFetch<MarketRate[]>("/market-data"),
    override: (symbol: string, dto: { label?: string; value: number; changePercent?: number }) =>
      apiFetch<MarketRate>(`/market-data/${symbol}`, withBody("PATCH", dto)),
  },

  horoscope: {
    list: (sign?: string) => apiFetch<HoroscopeEntry[]>(`/horoscope${buildQuery({ sign })}`),
    upsert: (dto: { sign: string; date: string; text: string }) =>
      apiFetch<HoroscopeEntry>("/horoscope", withBody("POST", dto)),
    remove: (id: string) => apiFetch<void>(`/horoscope/${id}`, { method: "DELETE" }),
  },

  prayerTimes: {
    list: (city?: string) => apiFetch<PrayerTime[]>(`/prayer-times${buildQuery({ city })}`),
    upsert: (dto: {
      city: string;
      date: string;
      imsak: string;
      gunes: string;
      ogle: string;
      ikindi: string;
      aksam: string;
      yatsi: string;
    }) => apiFetch<PrayerTime>("/prayer-times", withBody("POST", dto)),
    remove: (id: string) => apiFetch<void>(`/prayer-times/${id}`, { method: "DELETE" }),
  },

  pharmacies: {
    list: (district?: string, date?: string) => apiFetch<Pharmacy[]>(`/pharmacies${buildQuery({ district, date })}`),
    create: (dto: { name: string; district: string; address: string; phone: string; date: string }) =>
      apiFetch<Pharmacy>("/pharmacies", withBody("POST", dto)),
    update: (id: string, dto: Partial<Omit<Pharmacy, "id">>) =>
      apiFetch<Pharmacy>(`/pharmacies/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/pharmacies/${id}`, { method: "DELETE" }),
  },

  videoGallery: {
    list: (page = 1, pageSize = 50) => apiFetch<Paginated<Video>>(`/video-gallery${buildQuery({ page, pageSize })}`),
    create: (dto: { title: string; videoUrl: string; thumbnailUrl?: string }) =>
      apiFetch<Video>("/video-gallery", withBody("POST", dto)),
    update: (id: string, dto: Partial<{ title: string; videoUrl: string; thumbnailUrl: string }>) =>
      apiFetch<Video>(`/video-gallery/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/video-gallery/${id}`, { method: "DELETE" }),
  },

  newspapers: {
    list: () => apiFetch<Newspaper[]>("/newspapers/admin"),
    setActive: (id: string, active: boolean) =>
      apiFetch<Newspaper>(`/newspapers/${id}/active`, withBody("PATCH", { active })),
  },

  football: {
    list: (matchweek?: number) => apiFetch<FootballStanding[]>(`/football${buildQuery({ matchweek })}`),
    create: (dto: Omit<FootballStanding, "id">) => apiFetch<FootballStanding>("/football", withBody("POST", dto)),
    update: (id: string, dto: Partial<Omit<FootballStanding, "id">>) =>
      apiFetch<FootballStanding>(`/football/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/football/${id}`, { method: "DELETE" }),
  },

  users: {
    list: () => apiFetch<AdminUser[]>("/users"),
    findOne: (id: string) => apiFetch<AdminUser>(`/users/${id}`),
    create: (dto: { email: string; firstName: string; lastName: string; role: string; password: string; enabled?: boolean }) =>
      apiFetch<AdminUser>("/users", withBody("POST", dto)),
    update: (id: string, dto: Partial<{ email: string; firstName: string; lastName: string; role: string; enabled: boolean }>) =>
      apiFetch<AdminUser>(`/users/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/users/${id}`, { method: "DELETE" }),
    resetPassword: (id: string, password: string) =>
      apiFetch<void>(`/users/${id}/reset-password`, withBody("POST", { password })),
  },

  logs: {
    list: (params: { page?: number; pageSize?: number; entity?: string; action?: string; q?: string; from?: string; to?: string; sortBy?: string; order?: string } = {}) =>
      apiFetch<Paginated<ActivityLog>>(`/logs${buildQuery(params)}`),
  },

  popup: {
    list: () => apiFetch<Popup[]>("/popup"),
    create: (dto: Partial<Omit<Popup, "id" | "createdAt">>) => apiFetch<Popup>("/popup", withBody("POST", dto)),
    update: (id: string, dto: Partial<Omit<Popup, "id" | "createdAt">>) =>
      apiFetch<Popup>(`/popup/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/popup/${id}`, { method: "DELETE" }),
  },
};

export type ArticleWritePayload = {
  slug: string;
  title: string;
  spot: string;
  content: string;
  coverImageUrl?: string;
  coverImageCardUrl?: string;
  coverImageAlt?: string;
  source?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  noIndex?: boolean;
  canonicalUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  commentsEnabled?: boolean;
  videoUrl?: string;
  status?: ArticleStatus;
  scheduledAt?: string;
  placement?: ArticlePlacement;
  pinnedRelatedArticleIds?: string[];
  categoryId: string;
  authorId: string;
  tagIds?: string[];
};

export type ColumnWritePayload = {
  slug: string;
  title: string;
  spot?: string;
  content: string;
  coverImageUrl?: string;
  coverImageCardUrl?: string;
  coverImageAlt?: string;
  noIndex?: boolean;
  commentsEnabled?: boolean;
  status?: ArticleStatus;
  scheduledAt?: string;
  authorId: string;
};
