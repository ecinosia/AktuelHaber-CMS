import type {
  AdBanner,
  AdBannerType,
  Article,
  ArticlePlacement,
  ArticleStatus,
  Author,
  BrandSettings,
  Category,
  Comment,
  CommentStatus,
  ContactMessage,
  FootballStanding,
  HoroscopeEntry,
  MarketRate,
  MastheadMember,
  MenuItem,
  MenuLocation,
  Newspaper,
  Paginated,
  Pharmacy,
  PrayerTime,
  Session,
  StaticPage,
  Tag,
  Video,
  WeatherReading,
} from "@/types";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, credentials: "include" });

  if (!res.ok) {
    throw new ApiError(`API request failed: ${options.method ?? "GET"} ${path} -> ${res.status}`, res.status);
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

type MediaUploadKind = "article" | "avatar" | "logo" | "banner";

export const api = {
  auth: {
    login: (username: string, password: string) =>
      apiFetch<{ email: string; role: string }>("/auth/login", withBody("POST", { username, password })),
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
  },

  brand: {
    get: () => apiFetch<BrandSettings | null>("/brand"),
    update: (dto: Partial<Omit<BrandSettings, "id" | "updatedAt">>) =>
      apiFetch<BrandSettings>("/brand", withBody("PATCH", dto)),
  },

  menu: {
    list: (location?: MenuLocation) => apiFetch<MenuItem[]>(`/menu${buildQuery({ location })}`),
    create: (dto: { label: string; url: string; position: number; location: MenuLocation }) =>
      apiFetch<MenuItem>("/menu", withBody("POST", dto)),
    update: (id: string, dto: Partial<Omit<MenuItem, "id">>) =>
      apiFetch<MenuItem>(`/menu/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/menu/${id}`, { method: "DELETE" }),
  },

  categories: {
    list: () => apiFetch<Category[]>("/categories"),
    create: (dto: { slug: string; name: string }) => apiFetch<Category>("/categories", withBody("POST", dto)),
    update: (id: string, dto: Partial<{ slug: string; name: string }>) =>
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

  comments: {
    list: (params: { articleId?: string; status?: CommentStatus; page?: number; pageSize?: number } = {}) =>
      apiFetch<Paginated<Comment>>(`/comments${buildQuery(params)}`),
    approve: (id: string) => apiFetch<Comment>(`/comments/${id}/approve`, { method: "POST" }),
    reject: (id: string) => apiFetch<Comment>(`/comments/${id}/reject`, { method: "POST" }),
    markSpam: (id: string) => apiFetch<Comment>(`/comments/${id}/spam`, { method: "POST" }),
  },

  ads: {
    adminList: () => apiFetch<AdBanner[]>("/ads/admin"),
    create: (dto: {
      slot: string;
      type?: AdBannerType;
      imageUrl?: string;
      linkUrl?: string;
      adUnitCode?: string;
      active?: boolean;
    }) => apiFetch<AdBanner>("/ads", withBody("POST", dto)),
    update: (id: string, dto: Partial<Omit<AdBanner, "id">>) =>
      apiFetch<AdBanner>(`/ads/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/ads/${id}`, { method: "DELETE" }),
  },

  pages: {
    list: () => apiFetch<StaticPage[]>("/pages"),
    create: (dto: { slug: string; title: string; content: string }) =>
      apiFetch<StaticPage>("/pages", withBody("POST", dto)),
    update: (id: string, dto: Partial<{ slug: string; title: string; content: string }>) =>
      apiFetch<StaticPage>(`/pages/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/pages/${id}`, { method: "DELETE" }),
  },

  masthead: {
    list: () => apiFetch<MastheadMember[]>("/masthead"),
    create: (dto: { name: string; title: string; order?: number }) =>
      apiFetch<MastheadMember>("/masthead", withBody("POST", dto)),
    update: (id: string, dto: Partial<{ name: string; title: string; order: number }>) =>
      apiFetch<MastheadMember>(`/masthead/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/masthead/${id}`, { method: "DELETE" }),
    reorder: (ids: string[]) => apiFetch<MastheadMember[]>("/masthead/reorder", withBody("PATCH", { ids })),
  },

  contact: {
    list: (params: { page?: number; pageSize?: number } = {}) =>
      apiFetch<Paginated<ContactMessage>>(`/contact${buildQuery(params)}`),
  },

  marketData: {
    list: () => apiFetch<MarketRate[]>("/market-data"),
    override: (symbol: string, dto: { label?: string; value: number; changePercent?: number }) =>
      apiFetch<MarketRate>(`/market-data/${symbol}`, withBody("PATCH", dto)),
  },

  weather: {
    get: () => apiFetch<WeatherReading | null>("/weather"),
    override: (dto: { tempC: number; city?: string }) => apiFetch<WeatherReading>("/weather", withBody("PATCH", dto)),
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
    list: (date?: string) => apiFetch<Newspaper[]>(`/newspapers${buildQuery({ date })}`),
    create: (dto: { name: string; coverImage: string; date: string }) =>
      apiFetch<Newspaper>("/newspapers", withBody("POST", dto)),
    update: (id: string, dto: Partial<{ name: string; coverImage: string; date: string }>) =>
      apiFetch<Newspaper>(`/newspapers/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/newspapers/${id}`, { method: "DELETE" }),
  },

  football: {
    list: (matchweek?: number) => apiFetch<FootballStanding[]>(`/football${buildQuery({ matchweek })}`),
    create: (dto: Omit<FootballStanding, "id">) => apiFetch<FootballStanding>("/football", withBody("POST", dto)),
    update: (id: string, dto: Partial<Omit<FootballStanding, "id">>) =>
      apiFetch<FootballStanding>(`/football/${id}`, withBody("PATCH", dto)),
    remove: (id: string) => apiFetch<void>(`/football/${id}`, { method: "DELETE" }),
  },
};

export type ArticleWritePayload = {
  slug: string;
  title: string;
  spot: string;
  content: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  source?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  noIndex?: boolean;
  canonicalUrl?: string;
  status?: ArticleStatus;
  scheduledAt?: string;
  placement?: ArticlePlacement;
  placementOrder?: number;
  pinnedRelatedArticleIds?: string[];
  categoryId: string;
  authorId: string;
  tagIds?: string[];
};
