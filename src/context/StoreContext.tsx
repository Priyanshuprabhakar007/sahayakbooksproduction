import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Book,
  Author,
  Category,
  Review,
  BlogPost,
  Coupon,
  WebsiteSettings,
  CartItem,
  Order,
  UserProfile,
  UserRole,
  ContactEnquiry,
  NewsletterSubscriber,
  AnalyticsEvent,
  BookFormat,
  PaymentMethod,
  OrderStatus,
  MediaItem,
  AuditLog,
  ReviewStatus,
  GoogleMerchantSyncLog,
  GoogleShoppingStatus,
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_AUTHORS,
  INITIAL_CATEGORIES,
  INITIAL_REVIEWS,
  INITIAL_BLOGS,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
  INITIAL_MEDIA,
  INITIAL_LEADS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

interface StoreContextType {
  // Data
  books: Book[];
  authors: Author[];
  categories: Category[];
  reviews: Review[];
  blogs: BlogPost[];
  coupons: Coupon[];
  settings: WebsiteSettings;
  orders: Order[];
  enquiries: ContactEnquiry[];
  leads: ContactEnquiry[];
  subscribers: NewsletterSubscriber[];
  newsletters: NewsletterSubscriber[];
  analyticsEvents: AnalyticsEvent[];
  mediaItems: MediaItem[];
  allUsers: UserProfile[];
  auditLogs: AuditLog[];

  // Catalog Search & Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (categorySlug: string) => void;

  // User Auth & State
  currentUser: UserProfile | null;
  adminUser: UserProfile | null;
  sessionToken: string | null;
  hasAdminAccess: boolean;
  isSuperAdmin: boolean;
  wishlist: string[];
  savedBookIds: string[];
  savedArticleIds: string[];
  cart: CartItem[];
  cartSubtotal: number;
  cartShipping: number;
  cartDiscount: number;
  cartTotal: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;

  // Cart operations
  addToCart: (book: Book, format?: BookFormat, quantity?: number) => void;
  updateCartQuantity: (bookId: string, format: BookFormat, quantity: number) => void;
  removeFromCart: (bookId: string, format: BookFormat) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  toggleWishlist: (bookId: string) => void;
  isInWishlist: (bookId: string) => boolean;
  clearWishlist: () => void;

  // Auth operations
  login: (email: string, role?: 'customer' | 'admin') => void;
  loginWithPhone: (phone: string) => void;
  logout: () => void;
  adminLogin: (email: string, role?: UserRole) => { success: boolean; message?: string };
  adminLogout: () => void;
  ensureAdminAccess: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;

  // Customer Account & Authentication API
  registerCustomer: (data: { name: string; email: string; phone?: string; password: string; confirmPassword: string; agreeToTerms: boolean }) => Promise<{ success: boolean; message?: string; error?: string; verifyToken?: string }>;
  loginCustomer: (data: { email: string; password: string; rememberMe?: boolean }) => Promise<{ success: boolean; message?: string; error?: string }>;
  logoutCustomer: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  resetPassword: (data: { token: string; newPassword: string; confirmPassword: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateCustomerProfile: (data: { name?: string; phone?: string; city?: string; country?: string; avatar?: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
  toggleSaveBook: (bookId: string) => Promise<{ success: boolean; isSaved?: boolean; message?: string; error?: string }>;
  toggleSaveArticle: (blogId: string) => Promise<{ success: boolean; isSaved?: boolean; message?: string; error?: string }>;
  isBookSaved: (bookId: string) => boolean;
  isArticleSaved: (blogId: string) => boolean;
  adminUpdateUserStatus: (userId: string, status: string) => Promise<{ success: boolean; message?: string; error?: string }>;

  // Order operations
  placeOrder: (customer: Order['customer'], paymentMethod: PaymentMethod, orderNotes?: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courier?: string) => void;
  getOrderById: (orderIdOrNumber: string) => Order | undefined;

  // Review & Enquiry
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  submitEnquiry: (enquiry: Omit<ContactEnquiry, 'id' | 'date' | 'status'>) => void;
  submitLead: (lead: Omit<ContactEnquiry, 'id' | 'date' | 'status'>) => void;
  subscribeNewsletter: (email: string, source?: string) => { success: boolean; message: string };

  // Admin Book CRUD operations
  addBook: (book: Omit<Book, 'id'>) => Book;
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => void;
  duplicateBook: (bookId: string) => Book | undefined;
  archiveBook: (bookId: string) => void;
  toggleFeatureBook: (bookId: string) => void;
  reorderBooks: (newBooks: Book[]) => void;

  // Admin Settings & Content
  updateSettings: (newSettings: Partial<WebsiteSettings>) => void;
  updateAuthor: (author: Author) => void;
  addAuthor: (author: Omit<Author, 'id'>) => void;
  deleteAuthor: (authorId: string) => void;
  updateCategory: (category: Category) => void;
  addBlog: (blog: Omit<BlogPost, 'id'>) => void;
  updateBlog: (blog: BlogPost) => void;
  deleteBlog: (blogId: string) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;
  toggleCoupon: (couponId: string) => void;

  // Reviews moderation
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
  featureReview: (reviewId: string) => void;
  updateReviewStatus: (reviewId: string, featuredOrApproved: boolean) => void;
  setReviewModeration: (reviewId: string, status: ReviewStatus) => void;
  deleteReview: (reviewId: string) => void;

  // Leads & Enquiries
  updateEnquiryStatus: (id: string, status: ContactEnquiry['status']) => void;
  updateLeadStatus: (id: string, status: ContactEnquiry['status']) => void;
  markEnquiryRead: (id: string) => void;
  deleteEnquiry: (id: string) => void;

  // Media Library
  addMediaItem: (item: Omit<MediaItem, 'id' | 'date'>) => MediaItem;
  updateMediaItem: (item: MediaItem) => void;
  deleteMediaItem: (id: string) => void;
  replaceMediaItem: (id: string, newUrl: string) => void;

  // Users & Staff
  addUser: (user: Omit<UserProfile, 'id'>) => void;
  updateUser: (user: UserProfile) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;

  // Audit Logging
  addAuditLog: (action: string, resource: string, details: string) => void;

  // Google Merchant Center & Shopping Operations
  googleMerchantStatus: any | null;
  googleSyncLogs: GoogleMerchantSyncLog[];
  fetchGoogleMerchantStatus: () => Promise<void>;
  testGoogleMerchantConnection: () => Promise<any>;
  syncBookToGoogleMerchant: (bookId: string) => Promise<{ success: boolean; message: string; status?: GoogleShoppingStatus }>;
  removeBookFromGoogleMerchant: (bookId: string) => Promise<{ success: boolean; message: string }>;
  bulkSyncBooksToGoogleMerchant: (bookIds?: string[]) => Promise<{ total: number; successful: number; failed: number }>;
  fetchGoogleMerchantLogs: () => Promise<GoogleMerchantSyncLog[]>;
  fetchGoogleMerchantDiagnostics: () => Promise<any>;
  saveGoogleShoppingSettings: (settingsPayload: { googleShopping?: any; shippingSettings?: any; returnPolicy?: any }) => Promise<void>;

  // Reset
  resetToDefaults: () => void;

  // Analytics & Interactions
  trackEvent: (type: AnalyticsEvent['type'], target: string, metadata?: Record<string, any>) => void;

  // Modals & UI States
  quickViewBook: Book | null;
  openQuickView: (book: Book) => void;
  closeQuickView: () => void;
  adminTargetBookImageEditId: string | null;
  setAdminTargetBookImageEditId: (bookId: string | null) => void;
  openAdminBookImageEditor: (bookId: string) => void;
  sampleReaderBook: Book | null;
  openSampleReader: (book: Book) => void;
  closeSampleReader: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;

  // Navigation Routing
  currentPath: string;
  navigate: (path: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEMO_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'SB-2026-8941',
    date: '2026-02-27T10:30:00Z',
    customer: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 98112 34567',
      address: 'Flat 402, Royal Residency, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pinCode: '201309',
      country: 'India',
    },
    items: [
      {
        bookId: 'book-1',
        title: 'The Art of Strategic Governance',
        authorName: 'Dr. Arvind Sahayak',
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
        format: 'Hardcover',
        price: 899,
        originalPrice: 1299,
        quantity: 1,
        inStock: true,
      },
      {
        bookId: 'book-4',
        title: 'Investment Dictionary',
        authorName: 'Sandeep Sahni',
        coverImage: 'https://pub-d7c01d3edc7e4dbab0acb59d64c988a8.r2.dev/sahayak/books/20260902-screenshot-2026-09-02-175140-8f7a50.png',
        format: 'Paperback',
        price: 449,
        originalPrice: 499,
        quantity: 1,
        inStock: true,
      },
    ],
    subtotal: 1548,
    shipping: 0,
    discount: 154,
    couponCode: 'SAHAYAK10',
    total: 1394,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    trackingNumber: 'BLUEDART-89410294',
    courierPartner: 'BlueDart Express',
    estimatedDelivery: 'March 3, 2026',
    trackingSteps: [
      { status: 'Order Confirmed', label: 'Order Confirmed', description: 'Your order was verified and payment received', timestamp: 'Feb 27, 2026, 10:30 AM', completed: true, current: false },
      { status: 'Processing', label: 'Order Processing', description: 'Inventory reserved from Sahayak Central Depot', timestamp: 'Feb 27, 2026, 01:15 PM', completed: true, current: false },
      { status: 'Packed', label: 'Custom Hardcover Boxing', description: 'Packed securely with waterproof luxury sleeves', timestamp: 'Feb 28, 2026, 11:00 AM', completed: true, current: false },
      { status: 'Shipped', label: 'In Transit', description: 'Dispatched via BlueDart Air Express Hub Delhi', timestamp: 'Feb 28, 2026, 04:30 PM', completed: true, current: true },
      { status: 'Out for Delivery', label: 'Out for Delivery', description: 'Courier agent will arrive at your premises', completed: false, current: false },
      { status: 'Delivered', label: 'Delivered', description: 'Package handed over to recipient', completed: false, current: false },
    ],
  },
  {
    id: 'ord-1002',
    orderNumber: 'SB-2026-9102',
    date: '2026-02-28T14:20:00Z',
    customer: {
      fullName: 'Adv. Neha Kulkarni',
      email: 'neha.law@example.com',
      phone: '+91 99201 98765',
      address: 'Office 301, High Court Chambers, Fort',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400001',
      country: 'India',
    },
    items: [
      {
        bookId: 'book-2',
        title: 'Dear Son : Life Lessons from a Father',
        authorName: 'Sandeep Sahni',
        coverImage: 'https://pub-d7c01d3edc7e4dbab0acb59d64c988a8.r2.dev/sahayak/books/20260902-screenshot-2026-09-01-192900-2522ea.png',
        format: 'Paperback',
        price: 359,
        originalPrice: 399,
        quantity: 2,
        inStock: true,
      },
    ],
    subtotal: 2398,
    shipping: 0,
    discount: 239,
    couponCode: 'SAHAYAK10',
    total: 2159,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    trackingSteps: [
      { status: 'Order Confirmed', label: 'Order Confirmed', description: 'Payment authorized', timestamp: 'Feb 28, 2026, 02:20 PM', completed: true, current: false },
      { status: 'Processing', label: 'Binding & Verification', description: 'Hardcover gold foil embossing quality inspection', timestamp: 'Feb 28, 2026, 05:00 PM', completed: true, current: true },
      { status: 'Packed', label: 'Packed', description: 'Awaiting dispatch pickup', completed: false, current: false },
      { status: 'Shipped', label: 'Shipped', description: 'Pending transit handover', completed: false, current: false },
      { status: 'Out for Delivery', label: 'Out for Delivery', description: 'Pending final leg', completed: false, current: false },
      { status: 'Delivered', label: 'Delivered', description: 'Pending delivery', completed: false, current: false },
    ],
  },
];

export const normalizeAppPath = (raw?: string | null): string => {
  if (!raw) return '/';
  let cleaned = raw.trim();

  // Strip all leading # characters (e.g. '#', '#/', '##')
  while (cleaned.startsWith('#')) {
    cleaned = cleaned.substring(1).trim();
  }

  // Handle direct root, home, or empty variations
  if (
    !cleaned ||
    cleaned === '/' ||
    cleaned === '/#' ||
    cleaned === '#' ||
    cleaned === '/home' ||
    cleaned === 'home' ||
    cleaned === '#/' ||
    cleaned === '#/home'
  ) {
    return '/';
  }

  const [pathname, queryString] = cleaned.split('?');
  let normalized = (pathname || '').trim();
  while (normalized.startsWith('#')) {
    normalized = normalized.substring(1).trim();
  }
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.replace(/\/+$/, '');
  }
  if (
    normalized === '' ||
    normalized === '/' ||
    normalized === '/home' ||
    normalized === '/#' ||
    normalized === '/home/'
  ) {
    normalized = '/';
  }
  return queryString !== undefined && queryString.length > 0 ? `${normalized}?${queryString}` : normalized;
};

const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr-admin-master',
  name: 'Sandeep Sahni',
  email: 'admin@sahayakassociates.org',
  phone: '+91 98765 43210',
  role: 'SUPER_ADMIN',
  status: 'active',
  registrationDate: '2025-01-01',
  lastLogin: 'Just now',
  addresses: [],
  wishlist: [],
  orderIds: [],
  savedEbooks: [],
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Core Data State with Persistent LocalStorage
  const [books, setBooks] = useState<Book[]>(() => {
    const sanitizeBookImages = (bookList: Book[]): Book[] => {
      const knownBackPatterns = ['190217', '192918', '174952', '175208'];
      return bookList.map((b) => {
        const matchInitial = INITIAL_BOOKS.find((init) => init.id === b.id);
        if (!matchInitial) return b;

        const isBack = (url?: string) =>
          url && (knownBackPatterns.some((pat) => url.includes(pat)) || url === matchInitial.backCoverImage);

        const coverImage = isBack(b.coverImage) ? matchInitial.coverImage : (b.coverImage || matchInitial.coverImage);
        const backCoverImage = b.backCoverImage || matchInitial.backCoverImage;
        const mockup3DImage = isBack(b.mockup3DImage) ? matchInitial.mockup3DImage : (b.mockup3DImage || matchInitial.mockup3DImage);

        const gallery = (b.galleryImages && b.galleryImages.length > 0 ? b.galleryImages : matchInitial.galleryImages || [])
          .filter((img) => img && !isBack(img));

        return {
          ...b,
          coverImage,
          backCoverImage,
          mockup3DImage,
          galleryImages: gallery.length > 0 ? gallery : [coverImage],
        };
      });
    };

    const saved = localStorage.getItem('sahayak_books');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If previous cache contains obsolete old items, ensure we initialize to the 4 official Sahayak Association books
          if (parsed.length > 4 && parsed.some((b: Book) => b.id === 'book-5' || b.id === 'book-12')) {
            return INITIAL_BOOKS;
          }
          return sanitizeBookImages(parsed);
        }
      } catch (e) {
        return INITIAL_BOOKS;
      }
    }
    return INITIAL_BOOKS;
  });

  const [authors, setAuthors] = useState<Author[]>(() => {
    const saved = localStorage.getItem('sahayak_authors');
    return saved ? JSON.parse(saved) : INITIAL_AUTHORS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('sahayak_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('sahayak_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('sahayak_blogs');
    return saved ? JSON.parse(saved) : INITIAL_BLOGS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('sahayak_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [settings, setSettings] = useState<WebsiteSettings>(() => {
    const saved = localStorage.getItem('sahayak_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_SETTINGS, ...parsed };
      } catch (e) {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sahayak_orders');
    return saved ? JSON.parse(saved) : DEMO_ORDERS;
  });

  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>(() => {
    const saved = localStorage.getItem('sahayak_enquiries');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('sahayak_media');
    return saved ? JSON.parse(saved) : INITIAL_MEDIA;
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('sahayak_all_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('sahayak_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() => {
    const saved = localStorage.getItem('sahayak_subscribers');
    return saved
      ? JSON.parse(saved)
      : [
          { id: 'sub-1', email: 'scholar.arun@gmail.com', date: '2026-02-20', source: 'Home Footer' },
          { id: 'sub-2', email: 'legal.practitioner@bar.in', date: '2026-02-24', source: 'Editorial Banner' },
        ];
  });

  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() => {
    const saved = localStorage.getItem('sahayak_analytics');
    return saved
      ? JSON.parse(saved)
      : [
          { id: 'ev-1', type: 'pageview', target: 'Home', timestamp: new Date(Date.now() - 3600000).toISOString(), device: 'desktop' },
          { id: 'ev-2', type: 'view_book', target: 'The Art of Strategic Governance', timestamp: new Date(Date.now() - 1800000).toISOString(), device: 'desktop' },
          { id: 'ev-3', type: 'add_to_cart', target: 'The Art of Strategic Governance', timestamp: new Date(Date.now() - 900000).toISOString(), device: 'mobile' },
          { id: 'ev-4', type: 'click', target: 'Explore Books Hero CTA', timestamp: new Date().toISOString(), device: 'desktop' },
        ];
  });

  // Session Token State
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem('sahayak_session_token');
  });

  // Current Customer Session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sahayak_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Google Merchant Center & Shopping State
  const [googleMerchantStatus, setGoogleMerchantStatus] = useState<any | null>(null);
  const [googleSyncLogs, setGoogleSyncLogs] = useState<GoogleMerchantSyncLog[]>([]);

  // Auto-verify session with server on boot
  useEffect(() => {
    if (sessionToken) {
      fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'x-session-token': sessionToken,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('sahayak_current_user', JSON.stringify(data.user));
          } else {
            setSessionToken(null);
            setCurrentUser(null);
            localStorage.removeItem('sahayak_session_token');
            localStorage.removeItem('sahayak_current_user');
          }
        })
        .catch(() => {
          // Keep cached user if offline
        });
    }
  }, [sessionToken]);

  // Dedicated Admin / Staff Session
  const [adminUser, setAdminUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sahayak_admin_user');
      if (saved && saved !== 'null' && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.role) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_ADMIN_USER;
  });

  const hasAdminAccess = !!adminUser && (adminUser.role === 'SUPER_ADMIN' || adminUser.role === 'ADMIN' || adminUser.role === 'EDITOR' || adminUser.role === 'admin');
  const isSuperAdmin = !!adminUser && (adminUser.role === 'SUPER_ADMIN' || adminUser.role === 'ADMIN' || adminUser.role === 'admin');

  // Wishlist & Cart
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('sahayak_wishlist');
    return saved ? JSON.parse(saved) : ['book-1', 'book-4'];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sahayak_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Global search & category filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // UI modal state
  const [quickViewBook, setQuickViewBook] = useState<Book | null>(null);
  const [adminTargetBookImageEditId, setAdminTargetBookImageEditId] = useState<string | null>(null);
  const [sampleReaderBook, setSampleReaderBook] = useState<Book | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Helper to extract active route from browser environment (strict Storefront Home default on root)
  const getActiveLocationPath = (): string => {
    try {
      // 1. If an explicit hash parameter is present (e.g. #/admin, #/books, #/admin/books)
      const rawHash = window.location.hash ? window.location.hash.trim() : '';
      const strippedHash = rawHash.replace(/^#+/, '').trim();

      if (strippedHash) {
        const [cleanHashPart] = strippedHash.split('?');
        const trimmed = cleanHashPart.trim();
        // If hash is root, empty, or home: strictly return '/' (HomeView)
        if (
          !trimmed ||
          trimmed === '/' ||
          trimmed === '/home' ||
          trimmed === 'home' ||
          trimmed === '#' ||
          trimmed === '/#'
        ) {
          return '/';
        }
        // If hash is an intentional route like #/admin, #/admin/books, or #/books
        return normalizeAppPath(strippedHash);
      }

      // 2. If NO hash was provided (or hash is empty / # / #/):
      const rawPathname = (window.location.pathname || '').trim();
      const [cleanPathname] = rawPathname.split('?');
      const trimmedPath = cleanPathname.trim();

      // Opening the site at root, empty, index.html, or home strictly defaults to HomeView ('/')
      if (
        !trimmedPath ||
        trimmedPath === '/' ||
        trimmedPath === '/home' ||
        trimmedPath === 'home' ||
        trimmedPath === '/index.html'
      ) {
        return '/';
      }

      // Any valid intentional route (including /admin, /admin/books, /books, /authors, /contact, /checkout, etc.)
      return normalizeAppPath(rawPathname);
    } catch {
      // Safe fallback to Storefront Home
      return '/';
    }
  };

  // Client-side Hash & Direct Routing with Resilient Normalization
  const [currentPath, setCurrentPath] = useState<string>(() => getActiveLocationPath());

  const isHydratedRef = useRef(false);

  // Helper to persist direct entity mutations to server
  const persistToServer = useCallback(async (endpoint: string, method: string, payload: any) => {
    try {
      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error(`Failed to persist to ${endpoint}:`, err);
    }
  }, []);

  // Hydrate from Server Database on mount
  useEffect(() => {
    let isMounted = true;
    async function loadServerDb() {
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            const data = json.data;
            if (data.books && Array.isArray(data.books)) {
              setBooks(data.books);
            }
            if (data.authors && Array.isArray(data.authors)) setAuthors(data.authors);
            if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
            if (data.reviews && Array.isArray(data.reviews)) setReviews(data.reviews);
            if (data.blogs && Array.isArray(data.blogs)) setBlogs(data.blogs);
            if (data.coupons && Array.isArray(data.coupons)) setCoupons(data.coupons);
            if (data.settings) setSettings(data.settings);
            if (data.orders && Array.isArray(data.orders)) setOrders(data.orders);
            if (data.leads && Array.isArray(data.leads)) setEnquiries(data.leads);
            if (data.mediaItems && Array.isArray(data.mediaItems)) setMediaItems(data.mediaItems);
            if (data.allUsers && Array.isArray(data.allUsers)) setAllUsers(data.allUsers);
            if (data.auditLogs && Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
            if (data.subscribers && Array.isArray(data.subscribers)) setSubscribers(data.subscribers);
            if (data.googleSyncLogs && Array.isArray(data.googleSyncLogs)) setGoogleSyncLogs(data.googleSyncLogs);

            isHydratedRef.current = true;
          }
        }
      } catch (err) {
        console.warn('Could not connect to server database, using local cache:', err);
        isHydratedRef.current = true;
      }
    }
    loadServerDb();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const newPath = getActiveLocationPath();
      setCurrentPath((prev) => (prev !== newPath ? newPath : prev));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    const normalized = normalizeAppPath(path);
    try {
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', normalized === '/' ? '/' : normalized);
      }
    } catch {
      // Fallback for sandboxed iframes without pushState support
      try {
        window.location.hash = normalized === '/' ? '' : normalized;
      } catch {
        // ignore
      }
    }

    if (normalized === '/') {
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '/');
        }
      } catch {
        // ignore
      }
      if (window.location.hash) {
        try {
          window.location.hash = '';
        } catch {
          // ignore
        }
      }
    } else {
      // If the URL already had a hash (hash-based navigation), keep hash updated
      if (window.location.hash) {
        try {
          window.location.hash = normalized;
        } catch {
          // ignore
        }
      }
    }

    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackEvent('pageview', normalized);
  };

  // Reset URL bar if on root home but lingering admin pathname exists
  useEffect(() => {
    if (currentPath === '/') {
      if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
        try {
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '/');
          }
        } catch {
          // ignore
        }
      }
    } else if (currentPath.startsWith('/admin') && window.location.hash) {
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', currentPath);
        }
      } catch {
        // ignore
      }
    }
  }, [currentPath]);

  // Sync state to local storage cache only when hydrated
  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_books', JSON.stringify(books));
    }
  }, [books]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_authors', JSON.stringify(authors));
    }
  }, [authors]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_categories', JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_reviews', JSON.stringify(reviews));
    }
  }, [reviews]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_blogs', JSON.stringify(blogs));
    }
  }, [blogs]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_coupons', JSON.stringify(coupons));
    }
  }, [coupons]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_settings', JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_orders', JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_enquiries', JSON.stringify(enquiries));
    }
  }, [enquiries]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_media', JSON.stringify(mediaItems));
    }
  }, [mediaItems]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_all_users', JSON.stringify(allUsers));
    }
  }, [allUsers]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_audit_logs', JSON.stringify(auditLogs));
    }
  }, [auditLogs]);

  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem('sahayak_subscribers', JSON.stringify(subscribers));
    }
  }, [subscribers]);

  useEffect(() => {
    localStorage.setItem('sahayak_analytics', JSON.stringify(analyticsEvents));
  }, [analyticsEvents]);

  useEffect(() => {
    localStorage.setItem('sahayak_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('sahayak_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sahayak_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sahayak_admin_user', JSON.stringify(adminUser));
  }, [adminUser]);

  // Audit log helper
  const addAuditLog = (action: string, resource: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userName: adminUser?.name || 'Authorized Admin',
      userRole: adminUser?.role || 'SUPER_ADMIN',
      action,
      resource,
      details,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  // Analytics event logger
  const trackEvent = (type: AnalyticsEvent['type'], target: string, metadata?: Record<string, any>) => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    const newEvent: AnalyticsEvent = {
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      target,
      metadata,
      timestamp: new Date().toISOString(),
      device,
    };

    setAnalyticsEvents((prev) => [newEvent, ...prev.slice(0, 299)]);
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const cartShipping =
    cartSubtotal === 0 || cartSubtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCharge;

  let cartDiscount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minOrder) {
    if (appliedCoupon.discountType === 'percentage') {
      cartDiscount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && cartDiscount > appliedCoupon.maxDiscount) {
        cartDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      cartDiscount = Math.min(cartSubtotal, appliedCoupon.discountValue);
    }
  }

  const cartTotal = Math.max(0, cartSubtotal + cartShipping - cartDiscount);

  // Cart operations
  const addToCart = (book: Book, format: BookFormat = 'Paperback', quantity: number = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.bookId === book.id && item.format === format
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prevCart,
        {
          bookId: book.id,
          title: book.title,
          authorName: book.authorName,
          coverImage: book.coverImage,
          format,
          price: book.price,
          originalPrice: book.originalPrice,
          quantity,
          inStock: book.inStock,
        },
      ];
    });
    trackEvent('add_to_cart', book.title, { format, quantity, price: book.price });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (bookId: string, format: BookFormat, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId, format);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.bookId === bookId && item.format === format ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (bookId: string, format: BookFormat) => {
    setCart((prev) => prev.filter((item) => !(item.bookId === bookId && item.format === format)));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!found) {
      setCouponError('Invalid or inactive coupon code.');
      return false;
    }

    if (cartSubtotal < found.minOrder) {
      setCouponError(`Minimum order value of ₹${found.minOrder} required for this coupon.`);
      return false;
    }

    setAppliedCoupon(found);
    setCouponError(null);
    trackEvent('click', `Applied Coupon: ${cleanCode}`);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Wishlist operations
  const toggleWishlist = (bookId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(bookId);
      const next = exists ? prev.filter((id) => id !== bookId) : [...prev, bookId];
      if (currentUser) {
        setCurrentUser({ ...currentUser, wishlist: next });
      }
      trackEvent('book_saved', `Wishlist: ${bookId}`);
      return next;
    });
  };

  const isInWishlist = (bookId: string) => wishlist.includes(bookId);

  const clearWishlist = () => {
    setWishlist([]);
    if (currentUser) {
      setCurrentUser({ ...currentUser, wishlist: [] });
    }
    trackEvent('click', 'Cleared Wishlist');
  };

  // Authentication
  const login = (email: string, role: 'customer' | 'admin' = 'customer') => {
    const userRole: UserRole = role === 'admin' ? 'ADMIN' : 'CUSTOMER';
    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      name: role === 'admin' ? 'Chief Administrator' : email.split('@')[0],
      email,
      phone: '+91 98765 43210',
      role: userRole,
      status: 'active',
      registrationDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Just now',
      addresses: [
        {
          id: 'addr-1',
          isDefault: true,
          name: email.split('@')[0],
          phone: '+91 98765 43210',
          address: 'Sahayak Knowledge Campus, Block B',
          city: 'New Delhi',
          state: 'Delhi',
          pinCode: '110001',
          type: 'Office',
        },
      ],
      wishlist,
      orderIds: ['ord-1001'],
      savedEbooks: [],
    };
    setCurrentUser(user);
    if (role === 'admin') {
      setAdminUser(user);
    }
    setIsAuthModalOpen(false);
    trackEvent('click', `User Logged In (${role}): ${email}`);
  };

  const loginWithPhone = (phone: string) => {
    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      name: 'Sahayak Verified Reader',
      email: `${phone.replace(/\D/g, '')}@sahayak.local`,
      phone,
      role: 'CUSTOMER',
      status: 'active',
      registrationDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Just now',
      addresses: [],
      wishlist,
      orderIds: [],
      savedEbooks: [],
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    trackEvent('click', `User Phone OTP Verified: ${phone}`);
  };

  const logout = () => {
    setCurrentUser(null);
    trackEvent('click', 'Customer Logged Out');
  };

  const adminLogin = (email: string, role: UserRole = 'SUPER_ADMIN') => {
    const validEmail = email.trim();
    if (!validEmail) {
      return { success: false, message: 'Please enter an authorized admin email.' };
    }
    const adminProfile: UserProfile = {
      id: `usr-admin-${Date.now()}`,
      name: role === 'SUPER_ADMIN' ? 'Sandeep Sahni' : role === 'ADMIN' ? 'Editorial Director' : 'Content Editor',
      email: validEmail,
      phone: '+91 98765 43210',
      role,
      status: 'active',
      registrationDate: '2025-01-01',
      lastLogin: 'Just now',
      addresses: [],
      wishlist: [],
      orderIds: [],
      savedEbooks: [],
    };
    setAdminUser(adminProfile);
    addAuditLog('Admin Login', 'Admin Session', `Authorized login as ${role} (${validEmail})`);
    return { success: true };
  };

  const adminLogout = () => {
    addAuditLog('Admin Logout', 'Admin Session', `Logged out admin session`);
    setAdminUser(null);
    try {
      localStorage.removeItem('sahayak_admin_user');
    } catch {
      // ignore
    }
    navigate('/');
  };

  const ensureAdminAccess = () => {
    if (!adminUser || !hasAdminAccess) {
      setAdminUser(DEFAULT_ADMIN_USER);
      localStorage.setItem('sahayak_admin_user', JSON.stringify(DEFAULT_ADMIN_USER));
      addAuditLog('Admin Auto-Access', 'Admin Session', 'Restored master administrative access');
    }
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);
      localStorage.setItem('sahayak_current_user', JSON.stringify(updated));
    }
  };

  // Real Customer Authentication & Account API Functions
  const registerCustomer = async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        if (json.sessionToken) {
          setSessionToken(json.sessionToken);
          localStorage.setItem('sahayak_session_token', json.sessionToken);
        }
        if (json.user) {
          setCurrentUser(json.user);
          localStorage.setItem('sahayak_current_user', JSON.stringify(json.user));
        }
        return { success: true, message: json.message, verifyToken: json.verifyToken };
      } else {
        return { success: false, error: json.error || 'Registration failed.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection error.' };
    }
  };

  const loginCustomer = async (data: { email: string; password: string; rememberMe?: boolean }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        if (json.sessionToken) {
          setSessionToken(json.sessionToken);
          localStorage.setItem('sahayak_session_token', json.sessionToken);
        }
        if (json.user) {
          setCurrentUser(json.user);
          localStorage.setItem('sahayak_current_user', JSON.stringify(json.user));
        }
        return { success: true, message: json.message };
      } else {
        return { success: false, error: json.error || 'Login failed.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection error.' };
    }
  };

  const logoutCustomer = async () => {
    if (sessionToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ sessionToken }),
        });
      } catch (e) {
        console.warn('Logout notification error:', e);
      }
    }
    setSessionToken(null);
    setCurrentUser(null);
    localStorage.removeItem('sahayak_session_token');
    localStorage.removeItem('sahayak_current_user');
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      return { success: true, message: json.message || 'Password reset link sent if account exists.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error.' };
    }
  };

  const resetPassword = async (data: { token: string; newPassword: string; confirmPassword: string }) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        return { success: true, message: json.message };
      }
      return { success: false, error: json.error || 'Password reset failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error.' };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.user) {
          setCurrentUser(json.user);
          localStorage.setItem('sahayak_current_user', JSON.stringify(json.user));
        }
        return { success: true, message: json.message };
      }
      return { success: false, error: json.error || 'Email verification failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error.' };
    }
  };

  const updateCustomerProfile = async (data: {
    name?: string;
    phone?: string;
    city?: string;
    country?: string;
    avatar?: string;
  }) => {
    if (!sessionToken) return { success: false, error: 'Not logged in.' };
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.user) {
        setCurrentUser(json.user);
        localStorage.setItem('sahayak_current_user', JSON.stringify(json.user));
        return { success: true, message: json.message };
      }
      return { success: false, error: json.error || 'Update failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error.' };
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (!sessionToken) return { success: false, error: 'Not logged in.' };
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        return { success: true, message: json.message };
      }
      return { success: false, error: json.error || 'Password change failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error.' };
    }
  };

  const toggleSaveBook = async (bookId: string) => {
    if (!sessionToken || !currentUser) {
      return { success: false, error: 'Please log in to save books to your account.' };
    }
    try {
      const res = await fetch('/api/auth/toggle-save-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ bookId }),
      });
      const json = await res.json();
      if (json.success) {
        const nextSaved = json.savedBookIds || [];
        const updatedUser = { ...currentUser, savedBookIds: nextSaved };
        setCurrentUser(updatedUser);
        localStorage.setItem('sahayak_current_user', JSON.stringify(updatedUser));
        return { success: true, isSaved: json.isSaved, message: json.message };
      }
      return { success: false, error: json.error || 'Save action failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error.' };
    }
  };

  const toggleSaveArticle = async (blogId: string) => {
    if (!sessionToken || !currentUser) {
      return { success: false, error: 'Please log in to save articles to your account.' };
    }
    try {
      const res = await fetch('/api/auth/toggle-save-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ blogId }),
      });
      const json = await res.json();
      if (json.success) {
        const nextSaved = json.savedArticleIds || [];
        const updatedUser = { ...currentUser, savedArticleIds: nextSaved };
        setCurrentUser(updatedUser);
        localStorage.setItem('sahayak_current_user', JSON.stringify(updatedUser));
        return { success: true, isSaved: json.isSaved, message: json.message };
      }
      return { success: false, error: json.error || 'Save action failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error.' };
    }
  };

  const isBookSaved = (bookId: string) => {
    if (!currentUser || !currentUser.savedBookIds) return false;
    return currentUser.savedBookIds.includes(bookId);
  };

  const isArticleSaved = (blogId: string) => {
    if (!currentUser || !currentUser.savedArticleIds) return false;
    return currentUser.savedArticleIds.includes(blogId);
  };

  const adminUpdateUserStatus = async (userId: string, status: string) => {
    if (!sessionToken) return { success: false, error: 'Unauthorized.' };
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        setAllUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: status as any } : u))
        );
        return { success: true, message: json.message };
      }
      return { success: false, error: json.error || 'Update failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error.' };
    }
  };

  // Orders
  const placeOrder = (customer: Order['customer'], paymentMethod: PaymentMethod, orderNotes?: string): Order => {
    const orderNumber = `SB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      customer,
      items: [...cart],
      subtotal: cartSubtotal,
      shipping: cartShipping,
      discount: cartDiscount,
      couponCode: appliedCoupon?.code,
      total: cartTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      orderStatus: 'Order Confirmed',
      orderNotes,
      trackingSteps: [
        {
          status: 'Order Confirmed',
          label: 'Order Confirmed',
          description: 'Order verified & recorded by Sahayak Central Desk',
          timestamp: 'Just now',
          completed: true,
          current: true,
        },
        {
          status: 'Processing',
          label: 'Processing Order',
          description: 'Inventory reserved from Sahayak Central Publishing Depot',
          completed: false,
          current: false,
        },
        {
          status: 'Packed',
          label: 'Editorial Packaging',
          description: 'Custom moisture-proof luxury sleeves',
          completed: false,
          current: false,
        },
        {
          status: 'Shipped',
          label: 'In Transit',
          description: 'Dispatched via national air express courier partner',
          completed: false,
          current: false,
        },
        {
          status: 'Out for Delivery',
          label: 'Out for Delivery',
          description: 'Courier agent scheduled for final doorstep delivery',
          completed: false,
          current: false,
        },
        {
          status: 'Delivered',
          label: 'Delivered',
          description: 'Consignment handed over to recipient',
          completed: false,
          current: false,
        },
      ],
      estimatedDelivery: 'Within 3-5 Business Days',
      courierPartner: 'BlueDart / Delhivery Express',
      trackingNumber: `EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
      ebookDownloads: cart
        .filter((item) => item.format === 'eBook')
        .map((item) => ({
          bookId: item.bookId,
          title: item.title,
          downloadUrl: `#ebook-${item.bookId}-secure-pdf`,
          expiryDate: 'Lifetime Access',
        })),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Inventory reduction
    setBooks((prevBooks) =>
      prevBooks.map((b) => {
        const cartItem = cart.find((ci) => ci.bookId === b.id);
        if (cartItem) {
          const newStock = Math.max(0, b.stockCount - cartItem.quantity);
          const newStatus =
            newStock === 0 ? 'Out of Stock' : newStock <= (settings.lowStockThreshold || 10) ? 'Low Stock' : 'In Stock';
          return {
            ...b,
            stockCount: newStock,
            inStock: newStock > 0,
            stockStatus: newStatus as any,
            purchasesCount: (b.purchasesCount || 0) + cartItem.quantity,
          };
        }
        return b;
      })
    );

    // Update customer history
    if (currentUser) {
      const userOrders = [...currentUser.orderIds, newOrder.id];
      const newEbooks = newOrder.ebookDownloads?.map((eb) => ({
        bookId: eb.bookId,
        title: eb.title,
        downloadUrl: eb.downloadUrl,
        purchasedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })) || [];

      setCurrentUser({
        ...currentUser,
        orderIds: userOrders,
        savedEbooks: [...currentUser.savedEbooks, ...newEbooks],
      });
    }

    addAuditLog('New Order Placed', orderNumber, `Customer: ${customer.fullName} | Amount: ₹${cartTotal}`);
    clearCart();
    trackEvent('checkout_completed', `Order Placed: ${orderNumber}`, { total: cartTotal, itemsCount: cart.length });
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    courier?: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId || ord.orderNumber === orderId) {
          const updatedSteps = ord.trackingSteps.map((step) => {
            if (step.status === status) {
              return { ...step, completed: true, current: true, timestamp: 'Updated just now' };
            }
            return step;
          });
          return {
            ...ord,
            orderStatus: status,
            trackingNumber: trackingNumber || ord.trackingNumber,
            courierPartner: courier || ord.courierPartner,
            trackingSteps: updatedSteps,
          };
        }
        return ord;
      })
    );
    addAuditLog('Order Status Updated', orderId, `Status changed to: ${status}`);
  };

  const getOrderById = (orderIdOrNumber: string) => {
    return orders.find((o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber);
  };

  // Review & Enquiry
  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const sentiment: 'Positive' | 'Neutral' | 'Negative' =
      reviewData.rating >= 4 ? 'Positive' : reviewData.rating === 3 ? 'Neutral' : 'Negative';

    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      approved: false, // requires admin moderation
      status: 'Pending',
      sentiment,
      verifiedPurchase: true,
    };
    setReviews((prev) => [newRev, ...prev]);
    addAuditLog('New Review Submitted', reviewData.bookTitle, `Rating: ${reviewData.rating}★ by ${reviewData.userName} (Status: Pending)`);
    trackEvent('review_submitted', `Review for: ${reviewData.bookTitle}`);
  };

  const approveReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return { ...r, approved: true, status: 'Approved' };
        }
        return r;
      })
    );

    // Recalculate book average rating based on all approved reviews
    const targetRev = reviews.find((r) => r.id === reviewId);
    if (targetRev) {
      const bookApprovedReviews = reviews
        .filter((r) => r.bookId === targetRev.bookId && (r.id === reviewId || r.approved));
      const totalRatings = bookApprovedReviews.reduce((acc, cur) => acc + cur.rating, 0);
      const avg = (totalRatings / (bookApprovedReviews.length || 1)).toFixed(1);

      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.id === targetRev.bookId
            ? { ...b, rating: parseFloat(avg), reviewCount: bookApprovedReviews.length }
            : b
        )
      );
      addAuditLog('Review Approved', targetRev.bookTitle, `Approved review by ${targetRev.userName}`);
    }
  };

  const rejectReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, approved: false, status: 'Rejected' } : r))
    );
    const targetRev = reviews.find((r) => r.id === reviewId);
    if (targetRev) {
      addAuditLog('Review Rejected', targetRev.bookTitle, `Rejected review by ${targetRev.userName}`);
    }
  };

  const setReviewModeration = (reviewId: string, status: ReviewStatus) => {
    if (status === 'Approved') {
      approveReview(reviewId);
    } else if (status === 'Rejected') {
      rejectReview(reviewId);
    } else {
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, approved: false, status: 'Pending' } : r))
      );
    }
  };

  const featureReview = (reviewId: string) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, featured: !r.featured } : r)));
  };

  const updateReviewStatus = (reviewId: string, featuredOrApproved: boolean) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, featured: featuredOrApproved, approved: true, status: 'Approved' } : r))
    );
  };

  const deleteReview = (reviewId: string) => {
    const target = reviews.find((r) => r.id === reviewId);
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    if (target) {
      addAuditLog('Review Deleted', target.bookTitle, `Removed reader review by ${target.userName}`);
    }
  };

  // Leads & Contact Enquiries
  const submitEnquiry = (enquiryData: Omit<ContactEnquiry, 'id' | 'date' | 'status'>) => {
    const newEnq: ContactEnquiry = {
      ...enquiryData,
      id: `enq-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'New',
    };
    setEnquiries((prev) => [newEnq, ...prev]);
    addAuditLog('New Enquiry Captured', enquiryData.subject, `From: ${enquiryData.name} (${enquiryData.email})`);
    trackEvent('lead_submitted', enquiryData.subject);
  };

  const submitLead = (leadData: Omit<ContactEnquiry, 'id' | 'date' | 'status'>) => {
    submitEnquiry(leadData);
  };

  const updateEnquiryStatus = (id: string, status: ContactEnquiry['status']) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    addAuditLog('Lead Status Updated', id, `Status changed to: ${status}`);
  };

  const updateLeadStatus = updateEnquiryStatus;

  const markEnquiryRead = (id: string) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'In Review' as const } : e))
    );
  };

  const deleteEnquiry = (id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    addAuditLog('Lead Deleted', id, 'Removed from lead pipeline');
  };

  const subscribeNewsletter = (email: string, source: string = 'Website') => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (subscribers.some((s) => s.email.toLowerCase() === cleanEmail)) {
      return { success: true, message: 'You are already subscribed to Sahayak Insights!' };
    }
    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      date: new Date().toISOString().split('T')[0],
      source,
    };
    setSubscribers((prev) => [newSub, ...prev]);
    trackEvent('click', `Newsletter Subscribed: ${cleanEmail}`);
    return { success: true, message: 'Thank you for subscribing to Sahayak Books intellectual dispatches!' };
  };

  // Admin Book CRUD
  const addBook = (bookData: Omit<Book, 'id'>): Book => {
    const slug =
      bookData.slug ||
      bookData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newBook: Book = {
      ...bookData,
      id: `book-${Date.now()}`,
      slug,
      status: bookData.status || 'published',
      rating: bookData.rating || 5.0,
      reviewCount: bookData.reviewCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBooks((prev) => [newBook, ...prev]);
    addAuditLog('Book Created', newBook.title, `Added new publication with MRP: ₹${newBook.originalPrice}, Selling: ₹${newBook.price}`);
    persistToServer('/api/books', 'POST', newBook);
    return newBook;
  };

  const updateBook = (updatedBook: Book) => {
    const calculatedDiscount =
      updatedBook.originalPrice > updatedBook.price && updatedBook.originalPrice > 0
        ? Math.round(((updatedBook.originalPrice - updatedBook.price) / updatedBook.originalPrice) * 100)
        : 0;

    const modified: Book = {
      ...updatedBook,
      discountPercent: calculatedDiscount,
      updatedAt: new Date().toISOString(),
    };

    setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? modified : b)));
    if (quickViewBook?.id === updatedBook.id) {
      setQuickViewBook(modified);
    }
    addAuditLog('Book Updated', updatedBook.title, `Updated price to ₹${updatedBook.price}, Stock: ${updatedBook.stockCount}`);
    persistToServer(`/api/books/${updatedBook.id}`, 'PUT', modified);
  };

  const deleteBook = (bookId: string) => {
    const target = books.find((b) => b.id === bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (target) {
      addAuditLog('Book Deleted', target.title, `Permanently removed book ID: ${bookId}`);
    }
    persistToServer(`/api/books/${bookId}`, 'DELETE', {});
  };

  const duplicateBook = (bookId: string): Book | undefined => {
    const original = books.find((b) => b.id === bookId);
    if (!original) return undefined;

    const copy: Book = {
      ...original,
      id: `book-${Date.now()}`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBooks((prev) => [copy, ...prev]);
    addAuditLog('Book Duplicated', copy.title, `Created draft clone from: ${original.title}`);
    persistToServer('/api/books', 'POST', copy);
    return copy;
  };

  const archiveBook = (bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, status: 'archived', updatedAt: new Date().toISOString() } : b))
    );
    const target = books.find((b) => b.id === bookId);
    if (target) {
      addAuditLog('Book Archived', target.title, 'Status changed to archived');
    }
    persistToServer(`/api/books/${bookId}`, 'PUT', { status: 'archived' });
  };

  const toggleFeatureBook = (bookId: string) => {
    const target = books.find((b) => b.id === bookId);
    if (target) {
      const nextFeatured = !target.isFeatured;
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, isFeatured: nextFeatured } : b))
      );
      persistToServer(`/api/books/${bookId}`, 'PUT', { isFeatured: nextFeatured });
    }
  };

  const reorderBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    addAuditLog('Books Reordered', 'Books Catalog', 'Catalog display ordering updated');
    persistToServer('/api/db', 'POST', { books: newBooks });
  };

  // Settings & Content
  const updateSettings = (newSettings: Partial<WebsiteSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      addAuditLog('Website Settings Updated', 'Global Settings', 'Updated branding, contact info, or features');
      return updated;
    });
    persistToServer('/api/settings', 'PUT', newSettings);
  };

  const updateAuthor = (updatedAuthor: Author) => {
    setAuthors((prev) => prev.map((a) => (a.id === updatedAuthor.id ? updatedAuthor : a)));
    addAuditLog('Author Profile Updated', updatedAuthor.name, 'Updated bio, expertise, or photo');
    persistToServer(`/api/authors/${updatedAuthor.id}`, 'PUT', updatedAuthor);
  };

  const addAuthor = (authorData: Omit<Author, 'id'>) => {
    const newAuthor: Author = {
      ...authorData,
      id: `author-${Date.now()}`,
    };
    setAuthors((prev) => [...prev, newAuthor]);
    addAuditLog('New Author Added', newAuthor.name, 'Added distinguished faculty member');
    persistToServer('/api/authors', 'POST', newAuthor);
  };

  const deleteAuthor = (authorId: string) => {
    const target = authors.find((a) => a.id === authorId);
    setAuthors((prev) => prev.filter((a) => a.id !== authorId));
    if (target) {
      addAuditLog('Author Deleted', target.name, `Removed author ID: ${authorId}`);
    }
    persistToServer(`/api/authors/${authorId}`, 'DELETE', {});
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === updatedCat.id ? updatedCat : c));
      persistToServer('/api/categories', 'PUT', { categories: updated });
      return updated;
    });
  };

  const addBlog = (blogData: Omit<BlogPost, 'id'>) => {
    const newBlog: BlogPost = {
      ...blogData,
      id: `blog-${Date.now()}`,
    };
    setBlogs((prev) => [newBlog, ...prev]);
    addAuditLog('Blog Created', newBlog.title, `Added new research dispatch by ${newBlog.author}`);
    persistToServer('/api/blogs', 'POST', newBlog);
  };

  const updateBlog = (updatedBlog: BlogPost) => {
    setBlogs((prev) => prev.map((bg) => (bg.id === updatedBlog.id ? updatedBlog : bg)));
    addAuditLog('Blog Updated', updatedBlog.title, 'Updated essay content');
    persistToServer(`/api/blogs/${updatedBlog.id}`, 'PUT', updatedBlog);
  };

  const deleteBlog = (blogId: string) => {
    const target = blogs.find((b) => b.id === blogId);
    setBlogs((prev) => prev.filter((bg) => bg.id !== blogId));
    if (target) {
      addAuditLog('Blog Deleted', target.title, `Removed article ID: ${blogId}`);
    }
    persistToServer(`/api/blogs/${blogId}`, 'DELETE', {});
  };

  // Coupons
  const addCoupon = (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
    };
    setCoupons((prev) => {
      const updated = [newCoupon, ...prev];
      persistToServer('/api/db', 'POST', { coupons: updated });
      return updated;
    });
    addAuditLog('Coupon Created', newCoupon.code, `Discount: ${newCoupon.discountValue}${newCoupon.discountType === 'percentage' ? '%' : '₹'}`);
  };

  const updateCoupon = (updatedCoupon: Coupon) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => (c.id === updatedCoupon.id ? updatedCoupon : c));
      persistToServer('/api/db', 'POST', { coupons: updated });
      return updated;
    });
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons((prev) => {
      const updated = prev.filter((c) => c.id !== couponId);
      persistToServer('/api/db', 'POST', { coupons: updated });
      return updated;
    });
  };

  const toggleCoupon = (couponId: string) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c));
      persistToServer('/api/db', 'POST', { coupons: updated });
      return updated;
    });
  };

  // Media Management
  const addMediaItem = (itemData: Omit<MediaItem, 'id' | 'date'>): MediaItem => {
    const newItem: MediaItem = {
      ...itemData,
      id: `med-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setMediaItems((prev) => [newItem, ...prev]);
    addAuditLog('Media Uploaded', newItem.name, `Folder: ${newItem.folder}`);
    persistToServer('/api/media', 'POST', newItem);
    return newItem;
  };

  const updateMediaItem = (item: MediaItem) => {
    setMediaItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
    addAuditLog('Media Updated', item.name, 'Updated metadata or caption');
    persistToServer('/api/media', 'POST', item);
  };

  const deleteMediaItem = (id: string) => {
    const target = mediaItems.find((m) => m.id === id);
    setMediaItems((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      persistToServer('/api/db', 'POST', { mediaItems: updated });
      return updated;
    });
    if (target) {
      addAuditLog('Media Deleted', target.name, `Removed media asset ID: ${id}`);
    }
  };

  const replaceMediaItem = (id: string, newUrl: string) => {
    setMediaItems((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, url: newUrl } : m));
      persistToServer('/api/db', 'POST', { mediaItems: updated });
      return updated;
    });
    addAuditLog('Media File Replaced', id, `Updated file asset to: ${newUrl.slice(0, 40)}...`);
  };

  // User Accounts Management
  const addUser = (userData: Omit<UserProfile, 'id'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: `usr-${Date.now()}`,
      registrationDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
    };
    setAllUsers((prev) => [...prev, newUser]);
    addAuditLog('User Created', newUser.name, `Role: ${newUser.role} | Email: ${newUser.email}`);
  };

  const updateUser = (updatedUser: UserProfile) => {
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    addAuditLog('User Updated', updatedUser.name, `Role: ${updatedUser.role} | Status: ${updatedUser.status}`);
  };

  const deleteUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    if (target) {
      addAuditLog('User Deleted', target.name, `Removed user account ID: ${userId}`);
    }
  };

  const toggleUserStatus = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === 'disabled' ? 'active' : 'disabled' } : u))
    );
  };

  const resetToDefaults = () => {
    setBooks(INITIAL_BOOKS);
    setAuthors(INITIAL_AUTHORS);
    setCategories(INITIAL_CATEGORIES);
    setReviews(INITIAL_REVIEWS);
    setBlogs(INITIAL_BLOGS);
    setCoupons(INITIAL_COUPONS);
    setSettings(INITIAL_SETTINGS);
    setOrders(DEMO_ORDERS);
    setMediaItems(INITIAL_MEDIA);
    setAllUsers(INITIAL_USERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
  };

  // Google Merchant Center & Shopping actions
  const fetchGoogleMerchantStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/google-merchant/status');
      if (res.ok) {
        const data = await res.json();
        setGoogleMerchantStatus(data);
      }
    } catch (e) {
      console.warn('Failed to fetch Google Merchant status:', e);
    }
  }, []);

  const fetchGoogleMerchantLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/google-merchant/logs');
      if (res.ok) {
        const data = await res.json();
        setGoogleSyncLogs(data.logs || []);
        return data.logs || [];
      }
    } catch (e) {
      console.warn('Failed to fetch Google Merchant logs:', e);
    }
    return [];
  }, []);

  const testGoogleMerchantConnection = async () => {
    try {
      const res = await fetch('/api/admin/google-merchant/test-connection', { method: 'POST' });
      const data = await res.json();
      fetchGoogleMerchantStatus();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const syncBookToGoogleMerchant = async (bookId: string) => {
    try {
      const res = await fetch(`/api/admin/google-merchant/sync-book/${bookId}`, { method: 'POST' });
      const data = await res.json();
      const dbRes = await fetch('/api/db');
      if (dbRes.ok) {
        const dbJson = await dbRes.json();
        if (dbJson.data?.books) setBooks(dbJson.data.books);
        if (dbJson.data?.googleSyncLogs) setGoogleSyncLogs(dbJson.data.googleSyncLogs);
      }
      fetchGoogleMerchantStatus();
      trackEvent('google_product_sync', `Book ${bookId}`, { success: data.success });
      return data;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const removeBookFromGoogleMerchant = async (bookId: string) => {
    try {
      const res = await fetch(`/api/admin/google-merchant/remove-book/${bookId}`, { method: 'POST' });
      const data = await res.json();
      const dbRes = await fetch('/api/db');
      if (dbRes.ok) {
        const dbJson = await dbRes.json();
        if (dbJson.data?.books) setBooks(dbJson.data.books);
        if (dbJson.data?.googleSyncLogs) setGoogleSyncLogs(dbJson.data.googleSyncLogs);
      }
      fetchGoogleMerchantStatus();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const bulkSyncBooksToGoogleMerchant = async (bookIds?: string[]) => {
    try {
      const res = await fetch('/api/admin/google-merchant/bulk-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookIds }),
      });
      const data = await res.json();
      const dbRes = await fetch('/api/db');
      if (dbRes.ok) {
        const dbJson = await dbRes.json();
        if (dbJson.data?.books) setBooks(dbJson.data.books);
        if (dbJson.data?.googleSyncLogs) setGoogleSyncLogs(dbJson.data.googleSyncLogs);
      }
      fetchGoogleMerchantStatus();
      return data;
    } catch (err: any) {
      return { total: 0, successful: 0, failed: 0, error: err.message };
    }
  };

  const fetchGoogleMerchantDiagnostics = async () => {
    try {
      const res = await fetch('/api/admin/google-merchant/diagnostics');
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const saveGoogleShoppingSettings = async (settingsPayload: { googleShopping?: any; shippingSettings?: any; returnPolicy?: any }) => {
    try {
      const res = await fetch('/api/admin/google-merchant/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsPayload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          localStorage.setItem('sahayak_settings', JSON.stringify(data.settings));
        }
        fetchGoogleMerchantStatus();
        addAuditLog('Google Shopping Settings', 'Merchant Settings', 'Updated Google Merchant configuration');
      }
    } catch (err: any) {
      console.warn('Failed to save Google Shopping settings:', err);
    }
  };

  // Quick modals
  const openQuickView = (book: Book) => {
    const currentBook = books.find((b) => b.id === book.id) || book;
    setQuickViewBook(currentBook);
    trackEvent('view_book', currentBook.title);
  };

  const closeQuickView = () => setQuickViewBook(null);

  const openSampleReader = (book: Book) => {
    setSampleReaderBook(book);
    trackEvent('read_sample', book.title);
  };

  const closeSampleReader = () => setSampleReaderBook(null);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <StoreContext.Provider
      value={{
        books,
        authors,
        categories,
        reviews,
        blogs,
        coupons,
        settings,
        orders,
        enquiries,
        leads: enquiries,
        subscribers,
        newsletters: subscribers,
        analyticsEvents,
        mediaItems,
        allUsers,
        auditLogs,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        currentUser,
        adminUser,
        sessionToken,
        hasAdminAccess,
        isSuperAdmin,
        wishlist,
        savedBookIds: currentUser?.savedBookIds || [],
        savedArticleIds: currentUser?.savedArticleIds || [],
        cart,
        cartSubtotal,
        cartShipping,
        cartDiscount,
        cartTotal,
        appliedCoupon,
        couponError,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        login,
        loginWithPhone,
        logout,
        adminLogin,
        adminLogout,
        ensureAdminAccess,
        updateUserProfile,
        registerCustomer,
        loginCustomer,
        logoutCustomer,
        forgotPassword,
        resetPassword,
        verifyEmail,
        updateCustomerProfile,
        changePassword,
        toggleSaveBook,
        toggleSaveArticle,
        isBookSaved,
        isArticleSaved,
        adminUpdateUserStatus,
        placeOrder,
        updateOrderStatus,
        getOrderById,
        addReview,
        submitEnquiry,
        submitLead,
        subscribeNewsletter,
        addBook,
        updateBook,
        deleteBook,
        duplicateBook,
        archiveBook,
        toggleFeatureBook,
        reorderBooks,
        updateSettings,
        updateAuthor,
        addAuthor,
        deleteAuthor,
        updateCategory,
        addBlog,
        updateBlog,
        deleteBlog,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCoupon,
        approveReview,
        rejectReview,
        featureReview,
        updateReviewStatus,
        setReviewModeration,
        deleteReview,
        updateEnquiryStatus,
        updateLeadStatus,
        markEnquiryRead,
        deleteEnquiry,
        addMediaItem,
        updateMediaItem,
        deleteMediaItem,
        replaceMediaItem,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        addAuditLog,
        resetToDefaults,
        trackEvent,
        // Google Merchant
        googleMerchantStatus,
        googleSyncLogs,
        fetchGoogleMerchantStatus,
        testGoogleMerchantConnection,
        syncBookToGoogleMerchant,
        removeBookFromGoogleMerchant,
        bulkSyncBooksToGoogleMerchant,
        fetchGoogleMerchantLogs,
        fetchGoogleMerchantDiagnostics,
        saveGoogleShoppingSettings,
        quickViewBook,
        openQuickView,
        closeQuickView,
        adminTargetBookImageEditId,
        setAdminTargetBookImageEditId,
        openAdminBookImageEditor: (bookId: string) => {
          ensureAdminAccess();
          setQuickViewBook(null);
          setAdminTargetBookImageEditId(bookId);
          navigate('/admin/books');
        },
        sampleReaderBook,
        openSampleReader,
        closeSampleReader,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        currentPath,
        navigate,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
