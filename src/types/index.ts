// Mirrors AktuelHaber-BE's Prisma schema / DTO response shapes. Dates come
// over the wire as ISO strings (JSON has no Date type).

export type ArticleStatus = "DRAFT" | "PENDING_REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type ArticlePlacement = "NONE" | "UST_MANSET_1" | "UST_MANSET_2" | "ANA_MANSET" | "ALT_MANSET";
export type AuthorPublishType = "DIRECT" | "REQUIRES_APPROVAL";
export type AuthorStatus = "ACTIVE" | "INACTIVE";
export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED" | "SPAM";
export type MenuLocation = "MAIN" | "FOOTER";
export type AdBannerType = "STATIC" | "ADSENSE";

export type Category = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
};

export type Author = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  title: string | null;
  email: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  avatarUrl: string | null;
  bio: string | null;
  publishType: AuthorPublishType;
  status: AuthorStatus;
  createdAt: string;
};

export type Tag = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  article?: { id: string; title: string; slug: string };
};

export type Article = {
  id: string;
  slug: string;
  previousSlugs: string[];
  title: string;
  spot: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  source: string | null;
  isBreaking: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  noIndex: boolean;
  canonicalUrl: string | null;
  status: ArticleStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  placement: ArticlePlacement;
  placementOrder: number | null;
  viewCount: number;
  pinnedRelatedArticleIds: string[];
  categoryId: string;
  category: Category;
  authorId: string;
  author: Author;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number };

export type BrandSettings = {
  id: number;
  name: string;
  logoUrl: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  language: string;
  weatherCity: string | null;
  adsTxtContent: string | null;
  updatedAt: string;
};

export type MenuItem = {
  id: string;
  label: string;
  url: string;
  position: number;
  location: MenuLocation;
};

export type StaticPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
};

export type MastheadMember = {
  id: string;
  name: string;
  title: string;
  order: number;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type HoroscopeEntry = {
  id: string;
  sign: string;
  date: string;
  text: string;
};

export type PrayerTime = {
  id: string;
  city: string;
  date: string;
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
};

export type Pharmacy = {
  id: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  date: string;
};

export type Video = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  publishedAt: string;
};

export type Newspaper = {
  id: string;
  name: string;
  coverImage: string;
  date: string;
};

export type FootballStanding = {
  id: string;
  matchweek: number;
  position: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
};

export type AdBanner = {
  id: string;
  slot: string;
  type: AdBannerType;
  imageUrl: string | null;
  linkUrl: string | null;
  adUnitCode: string | null;
  active: boolean;
};

export type MarketRate = {
  id: string;
  symbol: string;
  label: string;
  value: number;
  changePercent: number | null;
  updatedAt: string;
};

export type WeatherReading = {
  id: number;
  city: string;
  tempC: number;
  updatedAt: string;
};

export type Session = {
  email: string;
  role: string;
};
