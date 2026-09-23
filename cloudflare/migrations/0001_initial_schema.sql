-- Sahayak Books Production D1 Initial Schema
-- Migration: 0001_initial_schema.sql

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  email_verified BOOLEAN DEFAULT 0,
  verify_token TEXT,
  reset_token TEXT,
  reset_token_expires TEXT,
  avatar TEXT,
  city TEXT,
  country TEXT,
  addresses TEXT,
  wishlist TEXT,
  saved_book_ids TEXT,
  saved_article_ids TEXT,
  order_ids TEXT,
  saved_ebooks TEXT,
  created_at TEXT,
  updated_at TEXT,
  last_login_at TEXT
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Authors Table
CREATE TABLE IF NOT EXISTS authors (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  avatar TEXT,
  profile_media_id TEXT,
  cover_image TEXT,
  status TEXT,
  is_featured BOOLEAN DEFAULT 0,
  image_alt_text TEXT,
  bio TEXT,
  biography TEXT,
  qualifications TEXT,
  expertise TEXT,
  social_links TEXT,
  seo_title TEXT,
  meta_description TEXT,
  email TEXT,
  phone TEXT,
  published_book_count INTEGER DEFAULT 0,
  articles_count INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  book_count INTEGER DEFAULT 0,
  cover_image TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- 5. Books Table
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  short_description TEXT,
  description TEXT NOT NULL,
  author_id TEXT,
  author_name TEXT NOT NULL,
  author_role TEXT,
  co_author TEXT,
  publisher TEXT,
  publication_date TEXT,
  publication_year INTEGER,
  edition TEXT,
  language TEXT,
  pages INTEGER,
  isbn TEXT,
  isbn10 TEXT,
  isbn13 TEXT,
  sku TEXT,
  category TEXT,
  category_slug TEXT,
  tags TEXT,
  price REAL NOT NULL,
  original_price REAL NOT NULL,
  discount_percent REAL,
  currency TEXT DEFAULT 'INR',
  show_original_price BOOLEAN DEFAULT 1,
  show_discount_badge BOOLEAN DEFAULT 1,
  in_stock BOOLEAN DEFAULT 1,
  stock_count INTEGER DEFAULT 0,
  stock_status TEXT,
  track_inventory BOOLEAN DEFAULT 1,
  low_stock_threshold INTEGER DEFAULT 5,
  status TEXT DEFAULT 'published',
  is_featured BOOLEAN DEFAULT 0,
  is_primary_featured BOOLEAN DEFAULT 0,
  is_bestseller BOOLEAN DEFAULT 0,
  is_new_release BOOLEAN DEFAULT 0,
  badge TEXT,
  formats TEXT,
  cover_image TEXT,
  back_cover_image TEXT,
  spine_image TEXT,
  mockup_3d_image TEXT,
  gallery_images TEXT,
  preview_images TEXT,
  sample_pages TEXT,
  pdf_sample_url TEXT,
  ebook_download_url TEXT,
  purchase_links TEXT,
  about_book TEXT,
  what_you_will_learn TEXT,
  table_of_contents TEXT,
  weight TEXT,
  dimensions TEXT,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  focus_keyword TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  no_index BOOLEAN DEFAULT 0,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  purchases_count INTEGER DEFAULT 0,
  frequently_bought_with_id TEXT,
  seller TEXT,
  fulfilled_by TEXT,
  delivery TEXT,
  replacement TEXT,
  payment TEXT,
  category_breadcrumb TEXT,
  google_enabled BOOLEAN DEFAULT 1,
  google_excluded BOOLEAN DEFAULT 0,
  google_offer_id TEXT,
  google_product_resource_name TEXT,
  google_data_source_name TEXT,
  google_last_synced_at TEXT,
  google_sync_status TEXT,
  google_issue_count INTEGER DEFAULT 0,
  google_issues TEXT,
  google_target_country TEXT,
  google_content_language TEXT,
  google_feed_label TEXT,
  google_product_category TEXT,
  google_product_type TEXT,
  google_custom_label_0 TEXT,
  google_custom_label_1 TEXT,
  google_custom_label_2 TEXT,
  google_condition TEXT,
  google_availability TEXT,
  google_mpn TEXT,
  created_at TEXT,
  updated_at TEXT,
  published_at TEXT,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL
);

-- 6. Book Variants Table
CREATE TABLE IF NOT EXISTS book_variants (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  original_price REAL,
  selling_price REAL,
  stock INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT 1,
  image_media_id TEXT,
  purchase_url TEXT,
  google_offer_id TEXT,
  google_product_resource_name TEXT,
  google_sync_status TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 7. Media Table (Metadata only, R2 stores actual binaries)
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT,
  r2_key TEXT,
  public_url TEXT NOT NULL,
  mime_type TEXT,
  file_size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  category TEXT,
  folder TEXT,
  alt_text TEXT,
  caption TEXT,
  storage_provider TEXT DEFAULT 'cloudflare-r2',
  uploaded_by TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- 8. Book Images Table
CREATE TABLE IF NOT EXISTS book_images (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  media_id TEXT,
  image_type TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL
);

-- 9. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  tags TEXT,
  author TEXT,
  author_role TEXT,
  author_avatar TEXT,
  publish_date TEXT,
  read_time TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'published',
  seo_title TEXT,
  meta_description TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- 10. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  book_title TEXT,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  rating INTEGER NOT NULL,
  title TEXT,
  comment TEXT,
  date TEXT,
  verified_purchase BOOLEAN DEFAULT 0,
  approved BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  sentiment TEXT,
  featured BOOLEAN DEFAULT 0,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 11. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT,
  customer_info TEXT,
  subtotal REAL NOT NULL,
  shipping REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  coupon_code TEXT,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  order_status TEXT NOT NULL,
  tracking_steps TEXT,
  tracking_number TEXT,
  courier_partner TEXT,
  estimated_delivery TEXT,
  order_notes TEXT,
  ebook_downloads TEXT,
  date TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 12. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  book_id TEXT,
  title TEXT NOT NULL,
  author_name TEXT,
  cover_image TEXT,
  format TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  created_at TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL
);

-- 13. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value REAL NOT NULL,
  min_order REAL DEFAULT 0,
  max_discount REAL,
  expiry_date TEXT,
  valid_from TEXT,
  usage_limit INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  applicable_books TEXT
);

-- 14. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  settings_json TEXT NOT NULL,
  updated_at TEXT
);

-- 15. Media Usage Table (prevents deletion of in-use media)
CREATE TABLE IF NOT EXISTS media_usage (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  created_at TEXT,
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

-- 16. Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  date TEXT,
  status TEXT DEFAULT 'New',
  interest TEXT,
  company TEXT,
  quantity INTEGER,
  city TEXT,
  book_id TEXT,
  book_title TEXT,
  source_page TEXT,
  created_at TEXT
);

-- 17. Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  date TEXT,
  source TEXT,
  created_at TEXT
);

-- 18. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  resource TEXT,
  details TEXT,
  timestamp TEXT,
  created_at TEXT
);

-- 19. Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  target TEXT,
  metadata TEXT,
  timestamp TEXT,
  device TEXT,
  book_id TEXT,
  created_at TEXT
);

-- 20. Google Sync Logs Table
CREATE TABLE IF NOT EXISTS google_sync_logs (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  book_title TEXT,
  variant_id TEXT,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  request_timestamp TEXT,
  timestamp TEXT,
  completed_timestamp TEXT,
  merchant_resource_name TEXT,
  error_code TEXT,
  safe_error_message TEXT,
  message TEXT,
  issues TEXT,
  duration_ms INTEGER,
  created_at TEXT
);
