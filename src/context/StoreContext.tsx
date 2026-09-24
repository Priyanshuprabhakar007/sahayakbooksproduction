import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { isAuthorizedAdminAccount } from '../utils/auth';
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
  addToCart: (book: Book, format?: BookFormat, quantity?: number) => Promise<boolean>;
  refreshCart: () => Promise<void>;
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
  adminLogin: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string; error?: string }>;
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
  placeOrder: (customer: Order['customer'], paymentMethod: PaymentMethod, orderNotes?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courier?: string) => Promise<void>;
  getOrderById: (orderIdOrNumber: string) => Order | undefined;

  // Review & Enquiry
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  submitEnquiry: (enquiry: Omit<ContactEnquiry, 'id' | 'date' | 'status'>) => Promise<void>;
  submitLead: (lead: Omit<ContactEnquiry, 'id' | 'date' | 'status'>) => Promise<void>;
  subscribeNewsletter: (email: string, source?: string) => Promise<{ success: boolean; message: string }>;

  // Admin Book CRUD operations
  addBook: (book: Omit<Book, 'id'>) => Promise<Book>;
  updateBook: (book: Book) => Promise<Book>;
  deleteBook: (bookId: string) => Promise<void>;
  duplicateBook: (bookId: string) => Promise<Book | undefined>;
  archiveBook: (bookId: string) => Promise<void>;
  toggleFeatureBook: (bookId: string) => Promise<void>;
  reorderBooks: (newBooks: Book[]) => void;

  // Admin Settings & Content
  updateSettings: (newSettings: Partial<WebsiteSettings>) => void;
  updateAuthor: (author: Author) => Promise<Author>;
  addAuthor: (author: Omit<Author, 'id'>) => Promise<Author>;
  deleteAuthor: (authorId: string) => Promise<void>;
  updateCategory: (category: Category) => void;
  addBlog: (blog: Omit<BlogPost, 'id'>) => void;
  updateBlog: (blog: BlogPost) => void;
  deleteBlog: (blogId: string) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<void>;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => Promise<void>;
  toggleCoupon: (couponId: string) => Promise<void>;

  // Reviews moderation
  approveReview: (reviewId: string) => Promise<void>;
  rejectReview: (reviewId: string) => Promise<void>;
  featureReview: (reviewId: string) => void;
  updateReviewStatus: (reviewId: string, featuredOrApproved: boolean) => void;
  setReviewModeration: (reviewId: string, status: ReviewStatus) => void;
  deleteReview: (reviewId: string) => Promise<void>;

  // Leads & Enquiries
  updateEnquiryStatus: (id: string, status: ContactEnquiry['status']) => Promise<void>;
  updateLeadStatus: (id: string, status: ContactEnquiry['status']) => Promise<void>;
  markEnquiryRead: (id: string) => void;
  deleteEnquiry: (id: string) => Promise<void>;

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

export const normalizeAppPath = (raw?: string | null): string => {
  if (!raw) return '/';
  let cleaned = raw.trim();

  while (cleaned.startsWith('#')) {
    cleaned = cleaned.substring(1).trim();
  }

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

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Core Public Data State
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [authors, setAuthors] = useState<Author[]>(INITIAL_AUTHORS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [settings, setSettings] = useState<WebsiteSettings>(INITIAL_SETTINGS);

  const [orders, setOrders] = useState<Order[]>([]);
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_MEDIA);

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() => {
    const saved = localStorage.getItem('sahayak_analytics');
    return saved ? JSON.parse(saved) : [];
  });

  // Session Token State
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem('sahayak_session_token');
  });

  // Authoritative Customer and Admin Users
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);

  const hasAdminAccess = isAuthorizedAdminAccount(adminUser);
  const isSuperAdmin = isAuthorizedAdminAccount(adminUser) && (adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'ADMIN');

  // Google Merchant Center & Shopping State
  const [googleMerchantStatus, setGoogleMerchantStatus] = useState<any | null>(null);
  const [googleSyncLogs, setGoogleSyncLogs] = useState<GoogleMerchantSyncLog[]>([]);

  // Admin Data Loader
  const loadAdminData = useCallback(async (token: string) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [ordersRes, reviewsRes, enquiriesRes, subscribersRes, couponsRes, usersRes, logsRes] = await Promise.all([
        fetch('/api/admin/orders', { headers }).catch(() => null),
        fetch('/api/admin/reviews', { headers }).catch(() => null),
        fetch('/api/admin/enquiries', { headers }).catch(() => null),
        fetch('/api/admin/subscribers', { headers }).catch(() => null),
        fetch('/api/coupons', { headers }).catch(() => null),
        fetch('/api/admin/users', { headers }).catch(() => null),
        fetch('/api/admin/audit-logs', { headers }).catch(() => null),
      ]);

      if (ordersRes?.ok) {
        const d = await ordersRes.json();
        if (d.success && Array.isArray(d.orders)) setOrders(d.orders);
      }
      if (reviewsRes?.ok) {
        const d = await reviewsRes.json();
        if (d.success && Array.isArray(d.reviews)) setReviews(d.reviews);
      }
      if (enquiriesRes?.ok) {
        const d = await enquiriesRes.json();
        if (d.success && Array.isArray(d.enquiries)) setEnquiries(d.enquiries);
      }
      if (subscribersRes?.ok) {
        const d = await subscribersRes.json();
        if (d.success && Array.isArray(d.subscribers)) setSubscribers(d.subscribers);
      }
      if (couponsRes?.ok) {
        const d = await couponsRes.json();
        if (d.success && Array.isArray(d.coupons)) setCoupons(d.coupons);
      }
      if (usersRes?.ok) {
        const d = await usersRes.json();
        if (d.success && Array.isArray(d.users)) setAllUsers(d.users);
      }
      if (logsRes?.ok) {
        const d = await logsRes.json();
        if (d.success && Array.isArray(d.auditLogs)) setAuditLogs(d.auditLogs);
      }
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    }
  }, []);

  // Helper to sync local guest cart into user's D1 cart and load user's cart & orders
  const syncAndFetchUserCartAndOrders = async (token: string) => {
    const guestCartRaw = localStorage.getItem('sahayak_cart');
    if (guestCartRaw) {
      try {
        const guestCart: CartItem[] = JSON.parse(guestCartRaw);
        if (Array.isArray(guestCart) && guestCart.length > 0) {
          let allMergedSuccessfully = true;
          for (const item of guestCart) {
            try {
              const res = await fetch('/api/cart/items', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  bookId: item.bookId,
                  format: item.format,
                  quantity: item.quantity,
                }),
              });
              if (!res.ok) {
                allMergedSuccessfully = false;
              } else {
                const d = await res.json();
                if (!d.success) allMergedSuccessfully = false;
              }
            } catch (err) {
              allMergedSuccessfully = false;
              console.warn('Failed to merge guest cart item into D1:', item, err);
            }
          }
          if (allMergedSuccessfully) {
            localStorage.removeItem('sahayak_cart');
          } else {
            console.warn('Some guest cart items could not be merged; preserving local guest cart backup.');
          }
        } else {
          localStorage.removeItem('sahayak_cart');
        }
      } catch (e) {
        console.warn('Guest cart merge parse error:', e);
      }
    }

    try {
      const cartRes = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        if (cartData.success && Array.isArray(cartData.items)) {
          setCart(cartData.items);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch user cart:', e);
    }

    try {
      const ordersRes = await fetch('/api/orders/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success && Array.isArray(ordersData.orders)) {
          setOrders(ordersData.orders);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch user orders:', e);
    }
  };

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
            if (isAuthorizedAdminAccount(data.user)) {
              setAdminUser(data.user);
              loadAdminData(sessionToken);
            } else {
              setAdminUser(null);
              setAllUsers([]);
              setAuditLogs([]);
            }
            syncAndFetchUserCartAndOrders(sessionToken);
          } else {
            setSessionToken(null);
            setCurrentUser(null);
            setAdminUser(null);
            setCart([]);
            setOrders([]);
            setAllUsers([]);
            setAuditLogs([]);
            localStorage.removeItem('sahayak_session_token');
          }
        })
        .catch(() => {
          setSessionToken(null);
          setCurrentUser(null);
          setAdminUser(null);
          setCart([]);
          setOrders([]);
          setAllUsers([]);
          setAuditLogs([]);
          localStorage.removeItem('sahayak_session_token');
          localStorage.removeItem('sahayak_current_user');
          localStorage.removeItem('sahayak_admin_user');
        });
    } else {
      setCurrentUser(null);
      setAdminUser(null);
      setAllUsers([]);
      setAuditLogs([]);
      localStorage.removeItem('sahayak_current_user');
      localStorage.removeItem('sahayak_admin_user');
    }
  }, [sessionToken, loadAdminData]);

  // Wishlist & Cart
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('sahayak_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const token = localStorage.getItem('sahayak_session_token');
    if (token) return []; // Boot with empty cart if authenticated session exists; server cart will load via GET /api/cart
    const saved = localStorage.getItem('sahayak_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
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

  const getActiveLocationPath = (): string => {
    try {
      const rawHash = window.location.hash ? window.location.hash.trim() : '';
      const strippedHash = rawHash.replace(/^#+/, '').trim();

      if (strippedHash) {
        const [cleanHashPart] = strippedHash.split('?');
        const trimmed = cleanHashPart.trim();
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
        return normalizeAppPath(strippedHash);
      }

      const rawPathname = (window.location.pathname || '').trim();
      const [cleanPathname] = rawPathname.split('?');
      const trimmedPath = cleanPathname.trim();

      if (
        !trimmedPath ||
        trimmedPath === '/' ||
        trimmedPath === '/home' ||
        trimmedPath === 'home' ||
        trimmedPath === '/index.html'
      ) {
        return '/';
      }

      return normalizeAppPath(rawPathname);
    } catch {
      return '/';
    }
  };

  const [currentPath, setCurrentPath] = useState<string>(() => getActiveLocationPath());
  const isHydratedRef = useRef(false);

  // Helper to persist direct entity mutations to server
  const persistToServer = useCallback(
    async (endpoint: string, method: string, payload: any) => {
      const token = localStorage.getItem('sahayak_session_token');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body: method === 'GET' ? undefined : JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error(
          `Persistence failed: ${method} ${endpoint}`,
          response.status,
          data
        );

        throw new Error(
          data?.error ||
          `Server returned ${response.status} while saving`
        );
      }

      return data;
    },
    []
  );

  // Hydrate Public Catalog Data from Server Database on mount
  useEffect(() => {
    let isMounted = true;
    async function loadServerDb() {
      try {
        const endpoints = [
          '/api/books',
          '/api/authors',
          '/api/categories',
          '/api/blogs',
          '/api/media',
          '/api/settings',
          '/api/reviews'
        ];
        const responses = await Promise.all(endpoints.map(ep => fetch(ep)));
        const data = await Promise.all(responses.map(r => r.json()));
        
        if (isMounted) {
          if (data[0].success && Array.isArray(data[0].books)) setBooks(data[0].books);
          if (data[1].success && Array.isArray(data[1].authors)) setAuthors(data[1].authors);
          if (data[2].success && Array.isArray(data[2].categories)) setCategories(data[2].categories);
          if (data[3].success && Array.isArray(data[3].blogs)) setBlogs(data[3].blogs);
          if (data[4].success && Array.isArray(data[4].mediaItems)) setMediaItems(data[4].mediaItems);
          if (data[5].success && data[5].settings) setSettings(prev => ({ ...prev, ...data[5].settings }));
          if (data[6].success && Array.isArray(data[6].reviews)) setReviews(data[6].reviews);
          isHydratedRef.current = true;
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

  // Clean legacy server-owned keys from localStorage on boot
  useEffect(() => {
    const legacyKeys = [
      'sahayak_books',
      'sahayak_authors',
      'sahayak_categories',
      'sahayak_reviews',
      'sahayak_blogs',
      'sahayak_coupons',
      'sahayak_settings',
      'sahayak_media',
      'sahayak_current_user',
      'sahayak_admin_user',
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  }, []);

  useEffect(() => {
    localStorage.setItem('sahayak_analytics', JSON.stringify(analyticsEvents));
  }, [analyticsEvents]);

  useEffect(() => {
    localStorage.setItem('sahayak_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (!sessionToken) {
      localStorage.setItem('sahayak_cart', JSON.stringify(cart));
    }
  }, [cart, sessionToken]);

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
  const refreshCart = useCallback(async (): Promise<void> => {
    const token = sessionToken || localStorage.getItem('sahayak_session_token');
    if (!token) return;
    try {
      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setCart(data.items);
        }
      }
    } catch (err) {
      console.warn('Failed to refresh user cart:', err);
    }
  }, [sessionToken]);

  const addToCart = async (
    book: Book,
    format: BookFormat = 'Paperback',
    quantity: number = 1
  ): Promise<boolean> => {
    if (sessionToken && currentUser) {
      try {
        const res = await fetch('/api/cart/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ bookId: book.id, format, quantity }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setCart(data.items);
          trackEvent('add_to_cart', book.title, { format, quantity, price: book.price });
          setIsCartOpen(true);
          return true;
        }
        return false;
      } catch (e) {
        console.warn('Failed to add item to server cart:', e);
        return false;
      }
    } else {
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
      return true;
    }
  };

  const updateCartQuantity = async (bookId: string, format: BookFormat, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId, format);
      return;
    }
    if (sessionToken && currentUser) {
      try {
        const res = await fetch('/api/cart/items', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ bookId, format, quantity }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setCart(data.items);
        }
      } catch (e) {
        console.warn('Failed to update server cart quantity:', e);
      }
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.bookId === bookId && item.format === format ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = async (bookId: string, format: BookFormat) => {
    if (sessionToken && currentUser) {
      try {
        const res = await fetch('/api/cart/items', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ bookId, format }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setCart(data.items);
        }
      } catch (e) {
        console.warn('Failed to remove item from server cart:', e);
      }
    } else {
      setCart((prev) => prev.filter((item) => !(item.bookId === bookId && item.format === format)));
    }
  };

  const clearCart = async () => {
    if (sessionToken && currentUser) {
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
      } catch (e) {
        console.warn('Failed to clear server cart:', e);
      }
    }
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
    loginCustomer({ email, password: '' });
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
    logoutCustomer();
  };

  const adminLogin = async (
    email: string,
    password: string,
    rememberMe?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (data.success) {
        if (isAuthorizedAdminAccount(data.user)) {
          setSessionToken(data.sessionToken);
          localStorage.setItem('sahayak_session_token', data.sessionToken);
          setCurrentUser(data.user);
          setAdminUser(data.user);
          await loadAdminData(data.sessionToken);
          addAuditLog('Admin Login', 'Admin Session', `Successful login as ${data.user.role} (${data.user.email})`);
          return { success: true };
        } else {
          setAdminUser(null);
          return { success: false, error: 'This account is not authorized for Admin access.' };
        }
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (err: any) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const adminLogout = async () => {
    const token = sessionToken || localStorage.getItem('sahayak_session_token');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    addAuditLog('Admin Logout', 'Admin Session', `Logged out admin session`);
    setSessionToken(null);
    setAdminUser(null);
    setCurrentUser(null);
    setAllUsers([]);
    setAuditLogs([]);
    localStorage.removeItem('sahayak_session_token');
    localStorage.removeItem('sahayak_current_user');
    localStorage.removeItem('sahayak_admin_user');
    navigate('/');
  };

  const ensureAdminAccess = () => {
    // No-op in production.
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);
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
          await syncAndFetchUserCartAndOrders(json.sessionToken);
        }
        if (json.user) {
          const customerUser = { ...json.user, role: 'CUSTOMER' as const };
          setCurrentUser(customerUser);
        }
        setAdminUser(null);
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
          await syncAndFetchUserCartAndOrders(json.sessionToken);
        }
        if (json.user) {
          setCurrentUser(json.user);
          if (isAuthorizedAdminAccount(json.user)) {
            setAdminUser(json.user);
            await loadAdminData(json.sessionToken);
          } else {
            setAdminUser(null);
          }
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
    const token = sessionToken || localStorage.getItem('sahayak_session_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionToken: token }),
        });
      } catch (e) {
        console.warn('Logout notification error:', e);
      }
    }
    setSessionToken(null);
    setCurrentUser(null);
    setAdminUser(null);
    setCart([]);
    setOrders([]);
    setAllUsers([]);
    setAuditLogs([]);
    localStorage.removeItem('sahayak_session_token');
    localStorage.removeItem('sahayak_current_user');
    localStorage.removeItem('sahayak_admin_user');
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      return { success: true, message: json.message || 'If an account exists with this email, password reset instructions have been sent.' };
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
  const placeOrder = async (
    customer: Order['customer'],
    paymentMethod: PaymentMethod,
    orderNotes?: string
  ): Promise<Order> => {
    if (!sessionToken || !currentUser) {
      throw new Error('You must be signed in to place an order.');
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        customerInfo: customer,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        orderNotes,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success || !json.order) {
      throw new Error(json.error || 'Failed to place order on server.');
    }

    const newOrder: Order = json.order;
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setAppliedCoupon(null);

    if (currentUser) {
      const userOrders = [...(currentUser.orderIds || []), newOrder.id];
      setCurrentUser({
        ...currentUser,
        orderIds: userOrders,
      });
    }

    addAuditLog('New Order Placed', newOrder.orderNumber, `Customer: ${customer.fullName} | Amount: ₹${newOrder.total}`);
    trackEvent('checkout_completed', `Order Placed: ${newOrder.orderNumber}`, { total: newOrder.total, itemsCount: newOrder.items.length });
    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    courier?: string
  ) => {
    try {
      await persistToServer(`/api/admin/orders/${orderId}`, 'PUT', {
        orderStatus: status,
        trackingNumber,
        courierPartner: courier,
      });
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
    } catch (err) {
      console.error('Failed to update order status:', err);
      throw err;
    }
  };

  const getOrderById = (orderIdOrNumber: string) => {
    return orders.find((o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber);
  };

  // Review & Enquiry
  const addReview = async (reviewData: Omit<Review, 'id' | 'date'>) => {
    const sentiment: 'Positive' | 'Neutral' | 'Negative' =
      reviewData.rating >= 4 ? 'Positive' : reviewData.rating === 3 ? 'Neutral' : 'Negative';

    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      approved: false,
      status: 'Pending',
      sentiment,
      verifiedPurchase: true,
    };
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      setReviews((prev) => [newRev, ...prev]);
      addAuditLog('New Review Submitted', reviewData.bookTitle, `Rating: ${reviewData.rating}★ by ${reviewData.userName} (Status: Pending)`);
      trackEvent('review_submitted', `Review for: ${reviewData.bookTitle}`);
    } catch (e) {
      console.warn('Failed to post review to server:', e);
    }
  };

  const approveReview = async (reviewId: string) => {
    try {
      await persistToServer(`/api/reviews/${reviewId}`, 'PUT', { status: 'Approved', approved: true });
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, approved: true, status: 'Approved' } : r))
      );
      const targetRev = reviews.find((r) => r.id === reviewId);
      if (targetRev) {
        addAuditLog('Review Approved', targetRev.bookTitle, `Approved review by ${targetRev.userName}`);
      }
    } catch (err) {
      console.error('Failed to approve review:', err);
      throw err;
    }
  };

  const rejectReview = async (reviewId: string) => {
    try {
      await persistToServer(`/api/reviews/${reviewId}`, 'PUT', { status: 'Rejected', approved: false });
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, approved: false, status: 'Rejected' } : r))
      );
      const targetRev = reviews.find((r) => r.id === reviewId);
      if (targetRev) {
        addAuditLog('Review Rejected', targetRev.bookTitle, `Rejected review by ${targetRev.userName}`);
      }
    } catch (err) {
      console.error('Failed to reject review:', err);
      throw err;
    }
  };

  const setReviewModeration = (reviewId: string, status: ReviewStatus) => {
    if (status === 'Approved') {
      approveReview(reviewId);
    } else if (status === 'Rejected') {
      rejectReview(reviewId);
    } else {
      persistToServer(`/api/reviews/${reviewId}`, 'PUT', { status: 'Pending', approved: false }).catch(() => {});
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, approved: false, status: 'Pending' } : r))
      );
    }
  };

  const featureReview = (reviewId: string) => {
    const target = reviews.find(r => r.id === reviewId);
    if (!target) return;
    const nextFeatured = !target.featured;
    persistToServer(`/api/reviews/${reviewId}`, 'PUT', { featured: nextFeatured }).catch(() => {});
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, featured: nextFeatured } : r)));
  };

  const updateReviewStatus = (reviewId: string, featuredOrApproved: boolean) => {
    persistToServer(`/api/reviews/${reviewId}`, 'PUT', { featured: featuredOrApproved, approved: true, status: 'Approved' }).catch(() => {});
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, featured: featuredOrApproved, approved: true, status: 'Approved' } : r))
    );
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await persistToServer(`/api/reviews/${reviewId}`, 'DELETE', {});
      const target = reviews.find((r) => r.id === reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      if (target) {
        addAuditLog('Review Deleted', target.bookTitle, `Removed reader review by ${target.userName}`);
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      throw err;
    }
  };

  // Leads & Contact Enquiries
  const submitEnquiry = async (enquiryData: Omit<ContactEnquiry, 'id' | 'date' | 'status'>) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryData),
      });
      const data = await res.json();
      if (data.success) {
        const newEnq: ContactEnquiry = {
          ...enquiryData,
          id: `enq-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          status: 'New',
        };
        setEnquiries((prev) => [newEnq, ...prev]);
        trackEvent('lead_submitted', enquiryData.subject);
      }
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
    }
  };

  const submitLead = submitEnquiry;

  const updateEnquiryStatus = async (id: string, status: ContactEnquiry['status']) => {
    try {
      await persistToServer(`/api/admin/enquiries/${id}`, 'PUT', { status });
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
      addAuditLog('Lead Status Updated', id, `Status changed to: ${status}`);
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
      throw err;
    }
  };

  const updateLeadStatus = updateEnquiryStatus;

  const markEnquiryRead = (id: string) => {
    updateEnquiryStatus(id, 'In Review');
  };

  const deleteEnquiry = async (id: string) => {
    try {
      await persistToServer(`/api/admin/enquiries/${id}`, 'DELETE', {});
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      addAuditLog('Lead Deleted', id, 'Removed from lead pipeline');
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
      throw err;
    }
  };

  const subscribeNewsletter = async (email: string, source: string = 'Website') => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, source }),
      });
      const data = await res.json();
      if (data.success) {
        const newSub: NewsletterSubscriber = {
          id: `sub-${Date.now()}`,
          email: cleanEmail,
          date: new Date().toISOString().split('T')[0],
          source,
        };
        setSubscribers((prev) => {
          if (prev.some((s) => s.email.toLowerCase() === cleanEmail)) return prev;
          return [newSub, ...prev];
        });
        trackEvent('click', `Newsletter Subscribed: ${cleanEmail}`);
        return { success: true, message: data.message || 'Subscribed successfully!' };
      } else {
        return { success: false, message: data.error || 'Subscription failed.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Server error.' };
    }
  };

  // Admin Book CRUD
  const addBook = async (bookData: Omit<Book, 'id'>): Promise<Book> => {
    const slug =
      bookData.slug ||
      bookData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const tempBook: Book = {
      ...bookData,
      id: `book-${Date.now()}`,
      slug,
      status: bookData.status || 'published',
      rating: bookData.rating || 5.0,
      reviewCount: bookData.reviewCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const resData = await persistToServer('/api/books', 'POST', tempBook);
      const savedBook = resData?.book || tempBook;
      setBooks((prev) => [savedBook, ...prev]);
      addAuditLog('Book Created', savedBook.title, `Added new publication: ₹${savedBook.price}`);
      return savedBook;
    } catch (err) {
      console.error('Failed to create book on server:', err);
      throw err;
    }
  };

  const updateBook = async (updatedBook: Book): Promise<Book> => {
    const calculatedDiscount =
      updatedBook.originalPrice > updatedBook.price && updatedBook.originalPrice > 0
        ? Math.round(((updatedBook.originalPrice - updatedBook.price) / updatedBook.originalPrice) * 100)
        : 0;

    const modified: Book = {
      ...updatedBook,
      discountPercent: calculatedDiscount,
      updatedAt: new Date().toISOString(),
    };

    try {
      const data = await persistToServer(`/api/books/${updatedBook.id}`, 'PUT', modified);
      const savedBook = data?.book || modified;
      setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? savedBook : b)));
      if (quickViewBook?.id === updatedBook.id) {
        setQuickViewBook(savedBook);
      }
      addAuditLog('Book Updated', savedBook.title, `Updated price to ₹${savedBook.price}, Stock: ${savedBook.stockCount}`);
      return savedBook;
    } catch (err: any) {
      console.error('Failed to update book:', err);
      throw err;
    }
  };

  const deleteBook = async (bookId: string) => {
    const target = books.find((b) => b.id === bookId);
    try {
      await persistToServer(`/api/books/${bookId}`, 'DELETE', {});
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      if (target) {
        addAuditLog('Book Deleted', target.title, `Permanently removed book ID: ${bookId}`);
      }
    } catch (err) {
      console.error('Failed to delete book:', err);
      throw err;
    }
  };

  const duplicateBook = async (bookId: string): Promise<Book | undefined> => {
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

    try {
      const resData = await persistToServer('/api/books', 'POST', copy);
      const savedBook = resData?.book || copy;
      setBooks((prev) => [savedBook, ...prev]);
      addAuditLog('Book Duplicated', savedBook.title, `Created draft clone from: ${original.title}`);
      return savedBook;
    } catch (err) {
      console.error('Failed to duplicate book:', err);
      throw err;
    }
  };

  const archiveBook = async (bookId: string) => {
    try {
      await persistToServer(`/api/books/${bookId}`, 'PUT', { status: 'archived' });
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, status: 'archived', updatedAt: new Date().toISOString() } : b))
      );
      const target = books.find((b) => b.id === bookId);
      if (target) {
        addAuditLog('Book Archived', target.title, 'Status changed to archived');
      }
    } catch (err) {
      console.error('Failed to archive book:', err);
      throw err;
    }
  };

  const toggleFeatureBook = async (bookId: string) => {
    const target = books.find((b) => b.id === bookId);
    if (target) {
      const nextFeatured = !target.isFeatured;
      try {
        await persistToServer(`/api/books/${bookId}`, 'PUT', { isFeatured: nextFeatured });
        setBooks((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, isFeatured: nextFeatured } : b))
        );
      } catch (err) {
        console.error('Failed to toggle feature book:', err);
        throw err;
      }
    }
  };

  const reorderBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    addAuditLog('Books Reordered', 'Books Catalog', 'Catalog display ordering updated');
  };

  // Settings & Content
  const updateSettings = async (newSettings: Partial<WebsiteSettings>) => {
    try {
      const resData = await persistToServer('/api/settings', 'PUT', newSettings);
      const updated = resData?.settings || newSettings;
      setSettings((prev) => ({ ...prev, ...updated }));
      addAuditLog('Website Settings Updated', 'Global Settings', 'Updated settings in database');
    } catch (err) {
      console.error('Failed to update settings:', err);
      throw err;
    }
  };

  const updateAuthor = async (updatedAuthor: Author): Promise<Author> => {
    try {
      const data = await persistToServer(`/api/authors/${updatedAuthor.id}`, 'PUT', updatedAuthor);
      const savedAuthor = data?.author || updatedAuthor;
      setAuthors((prev) => prev.map((a) => (a.id === updatedAuthor.id ? savedAuthor : a)));
      addAuditLog('Author Profile Updated', savedAuthor.name, 'Updated author profile');
      return savedAuthor;
    } catch (err: any) {
      console.error('Failed to update author:', err);
      throw err;
    }
  };

  const addAuthor = async (authorData: Omit<Author, 'id'>): Promise<Author> => {
    const tempId = `author-${Date.now()}`;
    const payload = { ...authorData, id: tempId };
    try {
      const data = await persistToServer('/api/authors', 'POST', payload);
      const savedAuthor = data?.author || payload;
      setAuthors((prev) => [...prev, savedAuthor]);
      addAuditLog('New Author Added', savedAuthor.name, 'Added author profile');
      return savedAuthor;
    } catch (err: any) {
      console.error('Failed to add author:', err);
      throw err;
    }
  };

  const deleteAuthor = async (authorId: string) => {
    const target = authors.find((a) => a.id === authorId);
    try {
      await persistToServer(`/api/authors/${authorId}`, 'DELETE', {});
      setAuthors((prev) => prev.filter((a) => a.id !== authorId));
      if (target) {
        addAuditLog('Author Deleted', target.name, `Removed author ID: ${authorId}`);
      }
    } catch (err: any) {
      console.error('Failed to delete author:', err);
      throw err;
    }
  };

  const updateCategory = async (updatedCat: Category) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === updatedCat.id ? updatedCat : c));
      persistToServer('/api/categories', 'PUT', { categories: updated }).catch(() => {});
      return updated;
    });
  };

  const addBlog = async (blogData: Omit<BlogPost, 'id'>) => {
    const tempBlog: BlogPost = {
      ...blogData,
      id: `blog-${Date.now()}`,
    };
    try {
      const data = await persistToServer('/api/blogs', 'POST', tempBlog);
      const savedBlog = data?.blog || tempBlog;
      setBlogs((prev) => [savedBlog, ...prev]);
      addAuditLog('Blog Created', savedBlog.title, `Added new article by ${savedBlog.author}`);
    } catch (err) {
      console.error('Failed to create blog:', err);
      throw err;
    }
  };

  const updateBlog = async (updatedBlog: BlogPost) => {
    try {
      const data = await persistToServer(`/api/blogs/${updatedBlog.id}`, 'PUT', updatedBlog);
      const savedBlog = data?.blog || updatedBlog;
      setBlogs((prev) => prev.map((bg) => (bg.id === updatedBlog.id ? savedBlog : bg)));
      addAuditLog('Blog Updated', savedBlog.title, 'Updated essay content');
    } catch (err) {
      console.error('Failed to update blog:', err);
      throw err;
    }
  };

  const deleteBlog = async (blogId: string) => {
    const target = blogs.find((b) => b.id === blogId);
    try {
      await persistToServer(`/api/blogs/${blogId}`, 'DELETE', {});
      setBlogs((prev) => prev.filter((bg) => bg.id !== blogId));
      if (target) {
        addAuditLog('Blog Deleted', target.title, `Removed article ID: ${blogId}`);
      }
    } catch (err) {
      console.error('Failed to delete blog:', err);
      throw err;
    }
  };

  // Coupons
  const addCoupon = async (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
    };
    try {
      await persistToServer('/api/coupons', 'POST', newCoupon);
      setCoupons((prev) => [newCoupon, ...prev]);
      addAuditLog('Coupon Created', newCoupon.code, `Discount: ${newCoupon.discountValue}${newCoupon.discountType === 'percentage' ? '%' : '₹'}`);
    } catch (err) {
      console.error('Failed to create coupon:', err);
      throw err;
    }
  };

  const updateCoupon = (updatedCoupon: Coupon) => {
    persistToServer(`/api/coupons/${updatedCoupon.id}`, 'PUT', updatedCoupon).catch(() => {});
    setCoupons((prev) => prev.map((c) => (c.id === updatedCoupon.id ? updatedCoupon : c)));
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      await persistToServer(`/api/coupons/${couponId}`, 'DELETE', {});
      setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      throw err;
    }
  };

  const toggleCoupon = async (couponId: string) => {
    const target = coupons.find((c) => c.id === couponId);
    if (!target) return;
    const nextActive = !target.isActive;
    try {
      await persistToServer(`/api/coupons/${couponId}`, 'PUT', { isActive: nextActive });
      setCoupons((prev) => prev.map((c) => (c.id === couponId ? { ...c, isActive: nextActive } : c)));
    } catch (err) {
      console.error('Failed to toggle coupon:', err);
      throw err;
    }
  };

  // Media Management
  const addMediaItem = (itemData: Partial<MediaItem> & Omit<MediaItem, 'date'>): MediaItem => {
    const newItem: MediaItem = {
      id: itemData.id || `med-${Date.now()}`,
      name: itemData.name || 'Untitled Media',
      url: itemData.url || itemData.publicUrl || '',
      publicUrl: itemData.publicUrl || itemData.url,
      objectKey: itemData.objectKey,
      folder: itemData.folder || 'Books',
      category: itemData.category,
      mimeType: itemData.mimeType,
      size: itemData.size,
      fileSize: itemData.fileSize,
      fileSizeBytes: itemData.fileSizeBytes,
      dimensions: itemData.dimensions,
      width: itemData.width,
      height: itemData.height,
      altText: itemData.altText,
      caption: itemData.caption,
      storageProvider: itemData.storageProvider || 'cloudflare-r2',
      uploadedBy: itemData.uploadedBy,
      createdAt: itemData.createdAt || new Date().toISOString(),
      updatedAt: itemData.updatedAt || new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      ...itemData,
    };
    setMediaItems((prev) => {
      if (prev.some(m => m.id === newItem.id)) {
        return prev.map(m => m.id === newItem.id ? newItem : m);
      }
      return [newItem, ...prev];
    });
    addAuditLog('Media Uploaded', newItem.name, `Folder: ${newItem.folder}`);
    return newItem;
  };

  const updateMediaItem = (item: MediaItem) => {
    setMediaItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
    addAuditLog('Media Updated', item.name, 'Updated metadata or caption');
  };

  const deleteMediaItem = async (id: string) => {
    const target = mediaItems.find((m) => m.id === id);
    try {
      await persistToServer(`/api/media/${id}`, 'DELETE', {});
      setMediaItems((prev) => prev.filter((m) => m.id !== id));
      if (target) {
        addAuditLog('Media Deleted', target.name, `Removed media asset ID: ${id}`);
      }
    } catch (err) {
      console.error('Failed to delete media item:', err);
      throw err;
    }
  };

  const replaceMediaItem = (id: string, newUrl: string) => {
    setMediaItems((prev) => prev.map((m) => (m.id === id ? { ...m, url: newUrl } : m)));
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
    localStorage.removeItem('sahayak_session_token');
    localStorage.removeItem('sahayak_cart');
    localStorage.removeItem('sahayak_wishlist');
    localStorage.removeItem('sahayak_analytics');
    window.location.reload();
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
        refreshCart,
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
