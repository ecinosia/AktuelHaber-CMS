// Mirrors AktuelHaber-BE's Prisma schema / DTO response shapes. Dates come
// over the wire as ISO strings (JSON has no Date type).

export type ArticleStatus = "DRAFT" | "PENDING_REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type ArticlePlacement = "NONE" | "UST_MANSET_1" | "UST_MANSET_2" | "ANA_MANSET" | "ALT_MANSET";
export type AuthorPublishType = "DIRECT" | "REQUIRES_APPROVAL";
export type AuthorStatus = "ACTIVE" | "INACTIVE";
export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED" | "SPAM";
export type MenuLocation = "MAIN" | "FOOTER";

export type Category = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  metaDescription: string | null;
  legacySourceId: string | null;
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
  youtubeUrl: string | null;
  publishType: AuthorPublishType;
  status: AuthorStatus;
  legacySourceId: string | null;
  articleCount?: number; // list endpoint only
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
  articleId: string | null;
  columnId?: string | null;
  authorName: string;
  email: string | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
  article?: { id: string; title: string; slug: string; legacyPath: string | null } | null;
  column?: { id: string; title: string; slug: string; legacyPath: string | null; author: { slug: string } } | null;
};

export type Article = {
  id: string;
  slug: string;
  legacyPath: string | null;
  legacySourceId: string | null;
  previousSlugs: string[];
  title: string;
  spot: string;
  content: string;
  coverImageUrl: string | null;
  coverImageCardUrl: string | null;
  coverImageAlt: string | null;
  source: string | null;
  isBreaking: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  noIndex: boolean;
  canonicalUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  commentsEnabled: boolean;
  videoUrl: string | null;
  status: ArticleStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  placement: ArticlePlacement;
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

export type Column = {
  id: string;
  slug: string;
  legacyPath: string | null;
  legacySourceId: string | null;
  title: string;
  spot: string | null;
  content: string;
  coverImageUrl: string | null;
  coverImageCardUrl: string | null;
  coverImageAlt: string | null;
  noIndex: boolean;
  commentsEnabled: boolean;
  status: ArticleStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  viewCount: number;
  authorId: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number };

export type DashboardStats = {
  todayArticles: number;
  totalArticles: number;
  todayComments: number;
  totalComments: number;
  activeAds: number;
  pendingReviewArticles: number;
  pendingComments: number;
  unreadContactMessages: number;
  latestArticles: Article[];
  pendingCommentsList: Comment[];
  mostViewedArticles: Article[];
};

export type BrandSettings = {
  id: number;
  name: string;
  logoUrl: string;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
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
  mapEmbedUrl: string | null;
  adsTxtContent: string | null;
  updatedAt: string;
};

export type MenuItem = {
  id: string;
  label: string;
  url: string;
  position: number;
};

export type MenuStatus = "ACTIVE" | "INACTIVE";

export type Menu = {
  id: string;
  name: string;
  location: MenuLocation;
  status: MenuStatus;
  createdAt: string;
  items?: MenuItem[];
  _count?: { items: number };
};

export type StaticPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  data?: Record<string, unknown> | null;
  updatedAt: string;
};

export type Masthead = {
  companyName?: string | null;
  foundedYear?: string | null;
  address?: string | null;
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  website?: string | null;
  tradeRegistryNo?: string | null;
  taxOffice?: string | null;
  taxNo?: string | null;
  mersisNo?: string | null;
  kepAddress?: string | null;
  owner?: string | null;
  generalCoordinator?: string | null;
  editorInChief?: string | null;
  newsEditor?: string | null;
  softwareDevelopment?: string | null;
  legalAdvisor?: string | null;
  responsibleEditor?: string | null;
  hostingProvider?: string | null;
  domainProvider?: string | null;
  otherSites?: string | null;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
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
  active: boolean;
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
  name: string;
  company: string;
  slots: string[];
  imageUrl: string | null;
  linkUrl: string | null;
  active: boolean;
  startsAt: string;
  endsAt: string;
};

export type MarketRate = {
  id: string;
  symbol: string;
  label: string;
  value: number;
  changePercent: number | null;
  updatedAt: string;
};

export type Session = {
  email: string;
  role: string;
  canPublish: boolean;
};

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  realmRoles: string[];
  createdTimestamp: number;
};

export type ActivityLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  detail: string | null;
  changes: Record<string, { label: string; from?: unknown; to: unknown }> | null;
  actorEmail: string | null;
  actorName: string | null;
  createdAt: string;
};

export type PopupStatus = "ACTIVE" | "INACTIVE";

export type Popup = {
  id: string;
  title: string;
  companyName: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  content: string | null;
  displayDelay: number;
  displayOnce: boolean;
  status: PopupStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};
