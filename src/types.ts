export type BookFormat = 'Paperback' | 'Hardcover' | 'eBook' | 'Kindle' | 'Signed Copy';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'CUSTOMER';

export interface SamplePage {
  pageNumber: number;
  chapterTitle: string;
  title: string;
  content: string[];
}

export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';
export type ReviewSentiment = 'Positive' | 'Neutral' | 'Negative';

export interface Review {
  id: string;
  bookId: string;
  bookTitle: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  approved: boolean;
  status?: ReviewStatus;
  sentiment?: ReviewSentiment;
  featured?: boolean;
}

export interface BookVariant {
  id: string;
  name: string; // e.g. 'Paperback', 'Hardcover Edition', 'Author-Signed Luxury Copy'
  sku: string;
  originalPrice: number;
  sellingPrice: number;
  stock: number;
  inStock: boolean;
  image?: string;
  purchaseUrl?: string;
  googleOfferId?: string;
  googleProductResourceName?: string;
  googleSyncStatus?: GoogleShoppingStatus;
}

export interface BookPurchaseLinks {
  amazon?: string;
  flipkart?: string;
  whatsapp?: string;
  publisher?: string;
  custom?: string;
  call?: string;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  shortDescription?: string;
  description: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  coAuthor?: string;
  publisher: string;
  publicationDate: string;
  publicationYear: number;
  edition?: string;
  language: string;
  pages: number;
  isbn: string;
  isbn10?: string;
  isbn13?: string;
  sku: string;
  category: string;
  categorySlug?: string;
  tags: string[];
  
  // Pricing & Currency
  price: number; // Selling price
  originalPrice: number; // MRP
  discountPercent?: number;
  currency?: string;
  showOriginalPrice?: boolean;
  showDiscountBadge?: boolean;
  
  // Stock & Inventory
  inStock: boolean;
  stockCount: number;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Pre-order' | 'Coming Soon';
  trackInventory?: boolean;
  lowStockThreshold?: number;

  // Status & Visibility
  status?: 'published' | 'draft' | 'archived';
  isFeatured?: boolean;
  isPrimaryFeatured?: boolean;
  isBestseller?: boolean;
  isNewRelease?: boolean;
  badge?: string; // 'Bestseller' | 'Featured' | 'New Release' | 'Editor\'s Pick' | 'Signed Copies Available' | 'Limited Edition' | 'Coming Soon'

  // Formats & Variants
  formats: BookFormat[];
  variants?: BookVariant[];

  // Images & Media
  coverImage: string;
  backCoverImage?: string;
  spineImage?: string;
  mockup3DImage?: string;
  galleryImages?: string[];
  previewImages?: string[];
  samplePages?: SamplePage[];
  pdfSampleUrl?: string;
  ebookDownloadUrl?: string;

  // Purchase Options
  purchaseLinks?: BookPurchaseLinks;

  // Rich Content
  aboutBook: string[];
  whatYouWillLearn: string[];
  tableOfContents: { chapter: number; title: string; pages: string }[];
  weight?: string;
  dimensions?: string;

  // SEO & Metadata
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;

  // Analytics & Engagement
  rating: number;
  reviewCount: number;
  viewsCount?: number;
  clicksCount?: number;
  purchasesCount?: number;
  frequentlyBoughtWithId?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;

  // Custom Retail & Fulfillment
  seller?: string;
  fulfilledBy?: string;
  delivery?: string;
  replacement?: string;
  payment?: string;
  categoryBreadcrumb?: string;

  // Google Shopping & Merchant Center Integration
  googleEnabled?: boolean;
  googleExcluded?: boolean;
  googleOfferId?: string;
  googleProductResourceName?: string;
  googleDataSourceName?: string;
  googleLastSyncedAt?: string;
  googleSyncStatus?: GoogleShoppingStatus;
  googleIssueCount?: number;
  googleIssues?: GoogleProductIssue[];
  googleTargetCountry?: string;
  googleContentLanguage?: string;
  googleFeedLabel?: string;
  googleProductCategory?: string;
  googleProductType?: string;
  googleCustomLabel0?: string;
  googleCustomLabel1?: string;
  googleCustomLabel2?: string;
  googleCondition?: 'new' | 'refurbished' | 'used';
  googleAvailability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  googleMpn?: string;
}

export interface Author {
  id: string;
  slug: string;
  name: string;
  title: string;
  avatar: string;
  profileMediaId?: string;
  profileMedia?: MediaItem;
  profileImageKey?: string;
  coverImage?: string;
  status?: string;
  isFeatured?: boolean;
  imageAltText?: string;
  bio: string;
  biography?: string;
  qualifications: string[];
  expertise: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  seoTitle?: string;
  metaDescription?: string;
  email?: string;
  phone?: string;
  publishedBookCount: number;
  articlesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  bookCount: number;
  coverImage: string;
}

export interface CartItem {
  bookId: string;
  title: string;
  authorName: string;
  coverImage: string;
  format: BookFormat;
  price: number;
  originalPrice: number;
  quantity: number;
  inStock: boolean;
}

export type OrderStatus =
  | 'Order Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type PaymentMethod =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Net Banking'
  | 'Wallets'
  | 'Cash on Delivery';

export interface OrderCustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  landmark?: string;
}

export interface OrderTrackingStep {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: OrderCustomerInfo;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  orderStatus: OrderStatus;
  trackingSteps: OrderTrackingStep[];
  trackingNumber?: string;
  courierPartner?: string;
  estimatedDelivery?: string;
  orderNotes?: string;
  ebookDownloads?: { bookId: string; title: string; downloadUrl: string; expiryDate: string }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole | 'customer' | 'admin';
  status?: 'active' | 'disabled' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  emailVerified?: boolean;
  verifyToken?: string;
  resetToken?: string;
  resetTokenExpires?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
  registrationDate?: string;
  lastLogin?: string;
  lastLoginAt?: string;
  addresses: {
    id: string;
    isDefault: boolean;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    type: 'Home' | 'Office';
  }[];
  wishlist: string[]; // book IDs
  savedBookIds?: string[]; // book IDs saved/bookmarked
  savedArticleIds?: string[]; // blog IDs saved/bookmarked
  orderIds: string[];
  savedEbooks: { bookId: string; title: string; downloadUrl: string; purchasedDate: string }[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  tags: string[];
  author: string;
  authorRole: string;
  authorAvatar: string;
  publishDate: string;
  readTime: string;
  featuredImage: string;
  status?: 'published' | 'draft';
  seoTitle?: string;
  metaDescription?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  expiryDate: string;
  validFrom?: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  applicableBooks?: string[];
}

export interface ContactEnquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Closed' | 'In Review' | 'Resolved';
  interest?: 'Books' | 'Consultation' | 'Bulk Orders' | 'Corporate Gifting' | 'Educational Sessions' | 'General';
  company?: string;
  quantity?: number;
  city?: string;
  bookId?: string;
  bookTitle?: string;
  sourcePage?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  date: string;
  source: string;
}

export interface AnalyticsEvent {
  id: string;
  type:
    | 'click'
    | 'pageview'
    | 'add_to_cart'
    | 'buy_now'
    | 'search'
    | 'read_sample'
    | 'view_book'
    | 'book_amazon_click'
    | 'book_whatsapp_click'
    | 'book_saved'
    | 'review_submitted'
    | 'lead_submitted'
    | 'checkout_completed'
    | 'purchase_started'
    | 'amazon_buy_click'
    | 'google_shopping_product_view'
    | 'google_shopping_click_source'
    | 'google_product_sync';
  target: string;
  metadata?: Record<string, any>;
  timestamp: string;
  device: 'desktop' | 'mobile' | 'tablet';
  bookId?: string;
}

export interface HomeSectionConfig {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

export interface MediaItem {
  id: string;
  name: string;
  fileName?: string;
  originalFileName?: string;
  originalFilename?: string;
  objectKey?: string;
  url: string;
  publicUrl?: string;
  folder: 'Books' | 'Authors' | 'Blogs' | 'Homepage' | 'Logos' | 'Resources' | 'Branding' | 'Services' | 'Testimonials' | 'Users' | 'Misc';
  category?: string;
  mimeType?: string;
  size?: string;
  fileSize?: string;
  fileSizeBytes?: number;
  dimensions?: string;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  storageProvider?: 'cloudflare-r2' | 'local' | 'cdn';
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  date: string;
}

export interface MediaUsage {
  locationType: 'book' | 'author' | 'blog' | 'branding' | 'homepage' | 'category';
  title: string;
  field: string;
  link?: string;
}

export interface R2StorageStatus {
  isConfigured: boolean;
  isConnected: boolean;
  provider: 'Cloudflare R2' | 'Local Emulated R2';
  bucketName?: string;
  publicUrl?: string;
  accountIdMasked?: string;
  region?: string;
  endpoint?: string;
  maxImageSizeMB: number;
  maxLogoSizeMB: number;
  maxPdfSizeMB: number;
  lastChecked?: string;
  error?: string;
  objectsCount?: number;
}


export interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
}

export interface PageContentConfig {
  heroHeading: string;
  heroSubheading: string;
  heroPrimaryBtnText: string;
  heroSecondaryBtnText: string;
  featuredBooksHeading: string;
  featuredBooksSubheading: string;
  aboutSectionHeading: string;
  aboutSectionText: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderQuote: string;
  contactHeading: string;
  contactSubtext: string;
  footerTagline: string;
}

export interface WebsiteSettings {
  brandName: string;
  tagline: string;
  parentCompany: string;
  mainLogo: string;
  darkLogo: string;
  lightLogo: string;
  mobileLogo?: string;
  footerLogo?: string;
  socialShareLogo?: string;
  favicon: string;
  logoUrl?: string;
  logoHeight?: number;
  logoPadding?: number;

  // Text content
  heroHeading: string;
  heroSubheading: string;
  heroPrimaryBtnText: string;
  heroSecondaryBtnText: string;
  featuredEditorialBookId: string;
  
  // Contact & HQ
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  businessHours: string;
  defaultCurrency: string;
  timezone?: string;

  // Features Toggles
  showPrices: boolean;
  showReviews: boolean;
  enableWishlist: boolean;
  enableBookPreview: boolean;
  enableInternalCheckout: boolean;
  showStock: boolean;
  enableExternalPurchaseLinks: boolean;
  enableBulkOrders: boolean;

  // Store Logistics
  lowStockThreshold: number;
  freeShippingThreshold: number;
  shippingCharge: number;
  enabledPaymentMethods: Record<PaymentMethod, boolean>;
  homeSections: HomeSectionConfig[];
  announcementBarText?: string;
  announcementBarEnabled: boolean;

  // Theme Customization
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeAccentColor?: string;
  buttonRadius?: 'rounded-none' | 'rounded-lg' | 'rounded-xl' | 'rounded-full';
  cardRadius?: 'rounded-none' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';

  // Page Content Overrides
  pagesContent?: PageContentConfig;

  // Google Shopping & Merchant Center Settings
  googleShopping?: GoogleShoppingSettings;
  shippingSettings?: ShippingSettings;
  returnPolicy?: ReturnPolicySettings;
  googleAnalyticsId?: string;
  googleAdsConversionId?: string;
}

export type GoogleShoppingStatus =
  | 'Synced'
  | 'Pending'
  | 'Needs Attention'
  | 'Error'
  | 'Not Submitted'
  | 'Excluded';

export interface GoogleProductIssue {
  severity: 'error' | 'warning' | 'info';
  attribute?: string;
  description: string;
  detail?: string;
  code?: string;
  documentationUri?: string;
}

export interface GoogleMerchantSyncLog {
  id: string;
  bookId: string;
  bookTitle: string;
  variantId?: string;
  action: 'insert' | 'update' | 'delete' | 'status_check' | 'price_update' | 'stock_update' | 'bulk_sync' | string;
  status: 'SUCCESS' | 'PENDING' | 'ERROR' | 'NEEDS_ATTENTION' | 'WARNING';
  requestTimestamp: string;
  timestamp?: string;
  completedTimestamp?: string;
  merchantResourceName?: string;
  errorCode?: string;
  safeErrorMessage?: string;
  message?: string;
  issues?: string[];
  durationMs?: number;
}

export interface ShippingSettings {
  country: string;
  shippingCharge: number;
  freeShippingThreshold: number;
  handlingTimeMinDays: number;
  handlingTimeMaxDays: number;
  transitTimeMinDays: number;
  transitTimeMaxDays: number;
  // 2026 Merchant Center shipping attributes
  handlingCutoffTime: string; // e.g. '16:00'
  minimumOrderValue: number; // e.g. 0
  shippingPolicyUrl: string;
}

export interface ReturnPolicySettings {
  returnWindowDays: number; // e.g. 7 or 14 days
  returnMethod: 'By Mail' | 'In Store' | 'Customer Dropoff';
  returnShippingFee: number; // 0 for free returns
  refundRules: string;
  damagedProductProcess: string;
  policyUrl: string;
}

export interface GoogleShoppingSettings {
  merchantAccountId: string;
  dataSourceName: string; // accounts/{ACCOUNT_ID}/dataSources/{DATA_SOURCE_ID}
  targetCountry: string; // default 'IN'
  contentLanguage: string; // default 'en'
  feedLabel: string; // default 'IN'
  defaultCurrency: string; // default 'INR'
  googleShoppingEnabled: boolean;
  freeListingsEnabled: boolean;
  shoppingAdsEnabled: boolean;
  autoSync: boolean;
  defaultProductCategory: string; // 'Media > Books > Print Books'
  defaultCondition: 'new' | 'used' | 'refurbished';
  brandName: string;
  shipping: ShippingSettings;
  returnPolicy: ReturnPolicySettings;
}

