import fs from 'fs';
import path from 'path';

interface MigrationReport {
  usersDetected: number;
  usersRequiringPasswordReset: number;
  authorsDetected: number;
  categoriesDetected: number;
  booksDetected: number;
  variantsDetected: number;
  mediaDetected: number;
  r2MediaDetected: number;
  base64MediaDetected: number;
  bookImagesGenerated: number;
  blogsDetected: number;
  reviewsDetected: number;
  ordersDetected: number;
  orderItemsDetected: number;
  couponsDetected: number;
  subscribersDetected: number;
  enquiriesDetected: number;
  auditLogsDetected: number;
  analyticsEventsDetected: number;
  googleSyncLogsDetected: number;
  warnings: string[];
  duplicates: string[];
  missingReferences: string[];
}

function escapeSql(val: any): string {
  if (val === null || val === undefined) {
    return 'NULL';
  }
  if (typeof val === 'boolean') {
    return val ? '1' : '0';
  }
  if (typeof val === 'number') {
    return val.toString();
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  }
  // string
  const str = String(val);
  return `'${str.replace(/'/g, "''")}'`;
}

export function runMigrationAndSeed(dryRun = false): MigrationReport {
  const dbPath = path.resolve(process.cwd(), 'data/db.json');
  if (!fs.existsSync(dbPath)) {
    throw new Error('data/db.json not found!');
  }

  const raw = fs.readFileSync(dbPath, 'utf-8');
  const data = JSON.parse(raw);

  const report: MigrationReport = {
    usersDetected: (data.allUsers || []).length,
    usersRequiringPasswordReset: 0,
    authorsDetected: (data.authors || []).length,
    categoriesDetected: (data.categories || []).length,
    booksDetected: (data.books || []).length,
    variantsDetected: 0,
    mediaDetected: (data.mediaItems || []).length,
    r2MediaDetected: 0,
    base64MediaDetected: 0,
    bookImagesGenerated: 0,
    blogsDetected: (data.blogs || []).length,
    reviewsDetected: (data.reviews || []).length,
    ordersDetected: (data.orders || []).length,
    orderItemsDetected: 0,
    couponsDetected: (data.coupons || []).length,
    subscribersDetected: (data.subscribers || []).length,
    enquiriesDetected: (data.leads || []).length,
    auditLogsDetected: (data.auditLogs || []).length,
    analyticsEventsDetected: (data.analyticsEvents || []).length,
    googleSyncLogsDetected: (data.googleSyncLogs || []).length,
    warnings: [],
    duplicates: [],
    missingReferences: [],
  };

  const authorIds = new Set((data.authors || []).map((a: any) => a.id));
  const bookIds = new Set((data.books || []).map((b: any) => b.id));
  const userIds = new Set((data.allUsers || []).map((u: any) => u.id));

  // Set checks for duplicates
  const seenEmails = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenSkus = new Set<string>();
  const seenIsbns = new Set<string>();
  const seenMediaKeys = new Set<string>();

  // Validate users & password security
  for (const u of data.allUsers || []) {
    if (!u.passwordHash || typeof u.passwordHash !== 'string' || u.passwordHash.trim() === '') {
      report.usersRequiringPasswordReset++;
      report.warnings.push(`User ${u.email || u.id} has no valid password_hash and requires a password reset.`);
    }
    if (seenEmails.has(u.email)) {
      report.duplicates.push(`Duplicate user email found: ${u.email}`);
    } else {
      seenEmails.add(u.email);
    }
  }

  // Validate authors
  for (const a of data.authors || []) {
    if (seenSlugs.has(a.slug)) {
      report.duplicates.push(`Duplicate author slug found: ${a.slug}`);
    } else {
      seenSlugs.add(a.slug);
    }
  }

  // Validate books & relationships
  const bookImagesRows: any[] = [];
  for (const b of data.books || []) {
    if (!authorIds.has(b.authorId)) {
      report.missingReferences.push(`Book "${b.title}" (${b.id}) references missing authorId: ${b.authorId}`);
    }
    if (seenSlugs.has(b.slug)) {
      report.duplicates.push(`Duplicate book slug found: ${b.slug}`);
    } else {
      seenSlugs.add(b.slug);
    }
    if (b.sku) {
      if (seenSkus.has(b.sku)) report.duplicates.push(`Duplicate book SKU found: ${b.sku}`);
      else seenSkus.add(b.sku);
    }
    if (b.isbn) {
      if (seenIsbns.has(b.isbn)) report.duplicates.push(`Duplicate book ISBN found: ${b.isbn}`);
      else seenIsbns.add(b.isbn);
    }

    if (Array.isArray(b.variants)) {
      report.variantsDetected += b.variants.length;
    }

    // Generate book_images records from book image fields
    const imageFields: { field: string; type: string; url?: string }[] = [
      { field: 'coverImage', type: 'cover', url: b.coverImage },
      { field: 'backCoverImage', type: 'back_cover', url: b.backCoverImage },
      { field: 'spineImage', type: 'spine', url: b.spineImage },
      { field: 'mockup3DImage', type: 'mockup_3d', url: b.mockup3DImage },
    ];

    for (const img of imageFields) {
      if (img.url) {
        report.bookImagesGenerated++;
        bookImagesRows.push({
          id: `bimg-${b.id}-${img.type}`,
          book_id: b.id,
          media_id: null,
          image_type: img.type,
          sort_order: img.type === 'cover' ? 1 : 2,
          alt_text: `${b.title} - ${img.type}`,
          created_at: b.createdAt || new Date().toISOString(),
        });
      }
    }

    if (Array.isArray(b.galleryImages)) {
      b.galleryImages.forEach((url: string, idx: number) => {
        if (url) {
          report.bookImagesGenerated++;
          bookImagesRows.push({
            id: `bimg-${b.id}-gal-${idx}`,
            book_id: b.id,
            media_id: null,
            image_type: 'gallery',
            sort_order: 10 + idx,
            alt_text: `${b.title} gallery ${idx + 1}`,
            created_at: b.createdAt || new Date().toISOString(),
          });
        }
      });
    }
  }

  // Validate media items & R2 URLs
  for (const m of data.mediaItems || []) {
    const url = m.url || m.publicUrl || '';
    if (url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')) {
      report.r2MediaDetected++;
    } else if (url.startsWith('data:image')) {
      report.base64MediaDetected++;
      report.warnings.push(`Media item ${m.id} (${m.name}) is Base64 encoded — REQUIRES_R2_UPLOAD.`);
    } else if (url.includes('unsplash.com') || url.startsWith('http')) {
      report.warnings.push(`Media item ${m.id} uses external URL (e.g. Unsplash): ${url}`);
    }
    if (m.objectKey || m.r2Key) {
      const key = m.objectKey || m.r2Key;
      if (seenMediaKeys.has(key)) report.duplicates.push(`Duplicate media key: ${key}`);
      else seenMediaKeys.add(key);
    }
  }

  // Validate reviews
  for (const r of data.reviews || []) {
    if (!bookIds.has(r.bookId)) {
      report.missingReferences.push(`Review "${r.id}" references missing bookId: ${r.bookId}`);
    }
  }

  // Validate orders & order items
  for (const o of data.orders || []) {
    if (o.userId && !userIds.has(o.userId)) {
      report.missingReferences.push(`Order "${o.id}" references missing userId: ${o.userId}`);
    }
    if (Array.isArray(o.items)) {
      report.orderItemsDetected += o.items.length;
      for (const item of o.items) {
        if (item.bookId && !bookIds.has(item.bookId)) {
          report.missingReferences.push(`Order item in order "${o.id}" references missing bookId: ${item.bookId}`);
        }
      }
    }
  }

  console.log('=== Sahayak Books D1 Migration & Validation Report ===');
  console.log(JSON.stringify(report, null, 2));

  if (dryRun) {
    return report;
  }

  // Generate SQL seed script
  const sqlLines: Array<string> = [];
  sqlLines.push('-- Sahayak Books Production D1 Seed Script');
  sqlLines.push(`-- Generated at: ${new Date().toISOString()}`);
  sqlLines.push('-- NOTE: Imported legacy users without valid password hashes require password reset (MIGRATION_RESET_REQUIRED)');
  sqlLines.push('BEGIN TRANSACTION;');
  sqlLines.push('');

  // 1. Users
  sqlLines.push('-- --- USERS ---');
  for (const u of data.allUsers || []) {
    const pwdHash = u.passwordHash && typeof u.passwordHash === 'string' && u.passwordHash.trim() !== ''
      ? u.passwordHash
      : 'MIGRATION_RESET_REQUIRED';

    sqlLines.push(
      `INSERT OR REPLACE INTO users (id, name, email, phone, password_hash, role, status, email_verified, verify_token, reset_token, reset_token_expires, avatar, city, country, addresses, wishlist, saved_book_ids, saved_article_ids, order_ids, saved_ebooks, created_at, updated_at, last_login_at) VALUES (${escapeSql(
        u.id
      )}, ${escapeSql(u.name)}, ${escapeSql(u.email)}, ${escapeSql(u.phone)}, ${escapeSql(pwdHash)}, ${escapeSql(
        u.role || 'CUSTOMER'
      )}, ${escapeSql(u.status || 'ACTIVE')}, ${u.emailVerified ? 1 : 0}, ${escapeSql(u.verifyToken)}, ${escapeSql(
        u.resetToken
      )}, ${escapeSql(u.resetTokenExpires)}, ${escapeSql(u.avatar)}, ${escapeSql(u.city)}, ${escapeSql(
        u.country
      )}, ${escapeSql(u.addresses)}, ${escapeSql(u.wishlist)}, ${escapeSql(u.savedBookIds)}, ${escapeSql(
        u.savedArticleIds
      )}, ${escapeSql(u.orderIds)}, ${escapeSql(u.savedEbooks)}, ${escapeSql(
        u.createdAt || u.registrationDate
      )}, ${escapeSql(u.updatedAt)}, ${escapeSql(u.lastLoginAt || u.lastLogin)});`
    );
  }

  // 2. Authors
  sqlLines.push('');
  sqlLines.push('-- --- AUTHORS ---');
  for (const a of data.authors || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO authors (id, slug, name, title, avatar, profile_media_id, cover_image, status, is_featured, image_alt_text, bio, biography, qualifications, expertise, social_links, seo_title, meta_description, email, phone, published_book_count, articles_count, created_at, updated_at) VALUES (${escapeSql(
        a.id
      )}, ${escapeSql(a.slug)}, ${escapeSql(a.name)}, ${escapeSql(a.title)}, ${escapeSql(
        a.avatar
      )}, ${escapeSql(a.profileMediaId)}, ${escapeSql(a.coverImage)}, ${escapeSql(a.status)}, ${
        a.isFeatured ? 1 : 0
      }, ${escapeSql(a.imageAltText)}, ${escapeSql(a.bio)}, ${escapeSql(a.biography)}, ${escapeSql(
        a.qualifications
      )}, ${escapeSql(a.expertise)}, ${escapeSql(a.socialLinks)}, ${escapeSql(a.seoTitle)}, ${escapeSql(
        a.metaDescription
      )}, ${escapeSql(a.email)}, ${escapeSql(a.phone)}, ${escapeSql(a.publishedBookCount || 0)}, ${escapeSql(
        a.articlesCount || 0
      )}, ${escapeSql(a.createdAt)}, ${escapeSql(a.updatedAt)});`
    );
  }

  // 3. Categories
  sqlLines.push('');
  sqlLines.push('-- --- CATEGORIES ---');
  for (const c of data.categories || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO categories (id, slug, name, description, icon_name, book_count, cover_image, created_at, updated_at) VALUES (${escapeSql(
        c.id
      )}, ${escapeSql(c.slug)}, ${escapeSql(c.name)}, ${escapeSql(c.description)}, ${escapeSql(
        c.iconName
      )}, ${escapeSql(c.bookCount || 0)}, ${escapeSql(c.coverImage)}, ${escapeSql(c.createdAt)}, ${escapeSql(
        c.updatedAt
      )});`
    );
  }

  // 4. Media
  sqlLines.push('');
  sqlLines.push('-- --- MEDIA ---');
  for (const m of data.mediaItems || []) {
    const pubUrl = m.url || m.publicUrl || '';
    sqlLines.push(
      `INSERT OR REPLACE INTO media (id, filename, original_filename, r2_key, public_url, mime_type, file_size_bytes, width, height, category, folder, alt_text, caption, storage_provider, uploaded_by, created_at, updated_at) VALUES (${escapeSql(
        m.id
      )}, ${escapeSql(m.name || m.fileName)}, ${escapeSql(m.originalFilename || m.originalFileName)}, ${escapeSql(
        m.objectKey || m.r2Key
      )}, ${escapeSql(pubUrl.startsWith('data:image') ? 'REQUIRES_R2_UPLOAD' : pubUrl)}, ${escapeSql(
        m.mimeType
      )}, ${escapeSql(m.fileSizeBytes || m.fileSize)}, ${escapeSql(m.width)}, ${escapeSql(m.height)}, ${escapeSql(
        m.category
      )}, ${escapeSql(m.folder)}, ${escapeSql(m.altText)}, ${escapeSql(m.caption)}, ${escapeSql(
        m.storageProvider || 'cloudflare-r2'
      )}, ${escapeSql(m.uploadedBy)}, ${escapeSql(m.createdAt || m.date)}, ${escapeSql(m.updatedAt)});`
    );
  }

  // 5. Books
  sqlLines.push('');
  sqlLines.push('-- --- BOOKS ---');
  for (const b of data.books || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO books (id, slug, title, subtitle, short_description, description, author_id, author_name, author_role, co_author, publisher, publication_date, publication_year, edition, language, pages, isbn, isbn10, isbn13, sku, category, category_slug, tags, price, original_price, discount_percent, currency, show_original_price, show_discount_badge, in_stock, stock_count, stock_status, track_inventory, low_stock_threshold, status, is_featured, is_primary_featured, is_bestseller, is_new_release, badge, formats, cover_image, back_cover_image, spine_image, mockup_3d_image, gallery_images, preview_images, sample_pages, pdf_sample_url, ebook_download_url, purchase_links, about_book, what_you_will_learn, table_of_contents, weight, dimensions, meta_title, meta_description, canonical_url, focus_keyword, og_title, og_description, og_image, no_index, rating, review_count, views_count, clicks_count, purchases_count, frequently_bought_with_id, seller, fulfilled_by, delivery, replacement, payment, category_breadcrumb, google_enabled, google_excluded, google_offer_id, google_product_resource_name, google_data_source_name, google_last_synced_at, google_sync_status, google_issue_count, google_issues, google_target_country, google_content_language, google_feed_label, google_product_category, google_product_type, google_custom_label_0, google_custom_label_1, google_custom_label_2, google_condition, google_availability, google_mpn, created_at, updated_at, published_at) VALUES (${escapeSql(
        b.id
      )}, ${escapeSql(b.slug)}, ${escapeSql(b.title)}, ${escapeSql(b.subtitle)}, ${escapeSql(
        b.shortDescription
      )}, ${escapeSql(b.description)}, ${escapeSql(b.authorId)}, ${escapeSql(b.authorName)}, ${escapeSql(
        b.authorRole
      )}, ${escapeSql(b.coAuthor)}, ${escapeSql(b.publisher)}, ${escapeSql(b.publicationDate)}, ${escapeSql(
        b.publicationYear
      )}, ${escapeSql(b.edition)}, ${escapeSql(b.language)}, ${escapeSql(b.pages)}, ${escapeSql(b.isbn)}, ${escapeSql(
        b.isbn10
      )}, ${escapeSql(b.isbn13)}, ${escapeSql(b.sku)}, ${escapeSql(b.category)}, ${escapeSql(
        b.categorySlug
      )}, ${escapeSql(b.tags)}, ${escapeSql(b.price)}, ${escapeSql(b.originalPrice)}, ${escapeSql(
        b.discountPercent
      )}, ${escapeSql(b.currency || 'INR')}, ${b.showOriginalPrice !== false ? 1 : 0}, ${
        b.showDiscountBadge !== false ? 1 : 0
      }, ${b.inStock !== false ? 1 : 0}, ${escapeSql(b.stockCount || 0)}, ${escapeSql(b.stockStatus)}, ${
        b.trackInventory !== false ? 1 : 0
      }, ${escapeSql(b.lowStockThreshold || 5)}, ${escapeSql(b.status || 'published')}, ${
        b.isFeatured ? 1 : 0
      }, ${b.isPrimaryFeatured ? 1 : 0}, ${b.isBestseller ? 1 : 0}, ${b.isNewRelease ? 1 : 0}, ${escapeSql(
        b.badge
      )}, ${escapeSql(b.formats)}, ${escapeSql(b.coverImage)}, ${escapeSql(b.backCoverImage)}, ${escapeSql(
        b.spineImage
      )}, ${escapeSql(b.mockup3DImage)}, ${escapeSql(b.galleryImages)}, ${escapeSql(b.previewImages)}, ${escapeSql(
        b.samplePages
      )}, ${escapeSql(b.pdfSampleUrl)}, ${escapeSql(b.ebookDownloadUrl)}, ${escapeSql(b.purchaseLinks)}, ${escapeSql(
        b.aboutBook
      )}, ${escapeSql(b.whatYouWillLearn)}, ${escapeSql(b.tableOfContents)}, ${escapeSql(b.weight)}, ${escapeSql(
        b.dimensions
      )}, ${escapeSql(b.metaTitle)}, ${escapeSql(b.metaDescription)}, ${escapeSql(b.canonicalUrl)}, ${escapeSql(
        b.focusKeyword
      )}, ${escapeSql(b.ogTitle)}, ${escapeSql(b.ogDescription)}, ${escapeSql(b.ogImage)}, ${
        b.noIndex ? 1 : 0
      }, ${escapeSql(b.rating || 0)}, ${escapeSql(b.reviewCount || 0)}, ${escapeSql(b.viewsCount || 0)}, ${escapeSql(
        b.clicksCount || 0
      )}, ${escapeSql(b.purchasesCount || 0)}, ${escapeSql(b.frequentlyBoughtWithId)}, ${escapeSql(
        b.seller
      )}, ${escapeSql(b.fulfilledBy)}, ${escapeSql(b.delivery)}, ${escapeSql(b.replacement)}, ${escapeSql(
        b.payment
      )}, ${escapeSql(b.categoryBreadcrumb)}, ${b.googleEnabled !== false ? 1 : 0}, ${
        b.googleExcluded ? 1 : 0
      }, ${escapeSql(b.googleOfferId)}, ${escapeSql(b.googleProductResourceName)}, ${escapeSql(
        b.googleDataSourceName
      )}, ${escapeSql(b.googleLastSyncedAt)}, ${escapeSql(b.googleSyncStatus)}, ${escapeSql(
        b.googleIssueCount || 0
      )}, ${escapeSql(b.googleIssues)}, ${escapeSql(b.googleTargetCountry)}, ${escapeSql(
        b.googleContentLanguage
      )}, ${escapeSql(b.googleFeedLabel)}, ${escapeSql(b.googleProductCategory)}, ${escapeSql(
        b.googleProductType
      )}, ${escapeSql(b.googleCustomLabel0)}, ${escapeSql(b.googleCustomLabel1)}, ${escapeSql(
        b.googleCustomLabel2
      )}, ${escapeSql(b.googleCondition)}, ${escapeSql(b.googleAvailability)}, ${escapeSql(b.googleMpn)}, ${escapeSql(
        b.createdAt
      )}, ${escapeSql(b.updatedAt)}, ${escapeSql(b.publishedAt)});`
    );

    // Book Variants
    if (Array.isArray(b.variants)) {
      for (const v of b.variants) {
        sqlLines.push(
          `INSERT OR REPLACE INTO book_variants (id, book_id, name, sku, original_price, selling_price, stock, in_stock, image_media_id, purchase_url, google_offer_id, google_product_resource_name, google_sync_status, created_at, updated_at) VALUES (${escapeSql(
            v.id
          )}, ${escapeSql(b.id)}, ${escapeSql(v.name)}, ${escapeSql(v.sku)}, ${escapeSql(
            v.originalPrice
          )}, ${escapeSql(v.sellingPrice)}, ${escapeSql(v.stock || 0)}, ${v.inStock !== false ? 1 : 0}, ${escapeSql(
            v.image
          )}, ${escapeSql(v.purchaseUrl)}, ${escapeSql(v.googleOfferId)}, ${escapeSql(
            v.googleProductResourceName
          )}, ${escapeSql(v.googleSyncStatus)}, ${escapeSql(b.createdAt)}, ${escapeSql(b.updatedAt)});`
        );
      }
    }
  }

  // 6. Book Images (Generated)
  sqlLines.push('');
  sqlLines.push('-- --- BOOK IMAGES ---');
  for (const bimg of bookImagesRows) {
    sqlLines.push(
      `INSERT OR REPLACE INTO book_images (id, book_id, media_id, image_type, sort_order, alt_text, created_at) VALUES (${escapeSql(
        bimg.id
      )}, ${escapeSql(bimg.book_id)}, ${escapeSql(bimg.media_id)}, ${escapeSql(bimg.image_type)}, ${escapeSql(
        bimg.sort_order
      )}, ${escapeSql(bimg.alt_text)}, ${escapeSql(bimg.created_at)});`
    );
  }

  // 7. Blogs
  sqlLines.push('');
  sqlLines.push('-- --- BLOGS ---');
  for (const bl of data.blogs || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO blogs (id, slug, title, excerpt, content, category, tags, author, author_role, author_avatar, publish_date, read_time, featured_image, status, seo_title, meta_description, created_at, updated_at) VALUES (${escapeSql(
        bl.id
      )}, ${escapeSql(bl.slug)}, ${escapeSql(bl.title)}, ${escapeSql(bl.excerpt)}, ${escapeSql(
        bl.content
      )}, ${escapeSql(bl.category)}, ${escapeSql(bl.tags)}, ${escapeSql(bl.author)}, ${escapeSql(
        bl.authorRole
      )}, ${escapeSql(bl.authorAvatar)}, ${escapeSql(bl.publishDate)}, ${escapeSql(bl.readTime)}, ${escapeSql(
        bl.featuredImage
      )}, ${escapeSql(bl.status || 'published')}, ${escapeSql(bl.seoTitle)}, ${escapeSql(
        bl.metaDescription
      )}, ${escapeSql(bl.publishDate)}, ${escapeSql(bl.publishDate)});`
    );
  }

  // 8. Reviews
  sqlLines.push('');
  sqlLines.push('-- --- REVIEWS ---');
  for (const r of data.reviews || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO reviews (id, book_id, book_title, user_name, user_avatar, rating, title, comment, date, verified_purchase, approved, status, sentiment, featured) VALUES (${escapeSql(
        r.id
      )}, ${escapeSql(r.bookId)}, ${escapeSql(r.bookTitle)}, ${escapeSql(r.userName)}, ${escapeSql(
        r.userAvatar
      )}, ${escapeSql(r.rating)}, ${escapeSql(r.title)}, ${escapeSql(r.comment)}, ${escapeSql(r.date)}, ${
        r.verifiedPurchase ? 1 : 0
      }, ${r.approved ? 1 : 0}, ${escapeSql(r.status || 'Pending')}, ${escapeSql(r.sentiment)}, ${
        r.featured ? 1 : 0
      });`
    );
  }

  // 9. Orders & Order Items (Deterministic IDs: oitm-${order.id}-${index})
  sqlLines.push('');
  sqlLines.push('-- --- ORDERS ---');
  for (const o of data.orders || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO orders (id, order_number, user_id, customer_info, subtotal, shipping, discount, coupon_code, total, payment_method, payment_status, order_status, tracking_steps, tracking_number, courier_partner, estimated_delivery, order_notes, ebook_downloads, date, created_at, updated_at) VALUES (${escapeSql(
        o.id
      )}, ${escapeSql(o.orderNumber)}, ${escapeSql(o.userId || null)}, ${escapeSql(o.customer)}, ${escapeSql(
        o.subtotal
      )}, ${escapeSql(o.shipping || 0)}, ${escapeSql(o.discount || 0)}, ${escapeSql(o.couponCode)}, ${escapeSql(
        o.total
      )}, ${escapeSql(o.paymentMethod)}, ${escapeSql(o.paymentStatus)}, ${escapeSql(o.orderStatus)}, ${escapeSql(
        o.trackingSteps
      )}, ${escapeSql(o.trackingNumber)}, ${escapeSql(o.courierPartner)}, ${escapeSql(
        o.estimatedDelivery
      )}, ${escapeSql(o.orderNotes)}, ${escapeSql(o.ebookDownloads)}, ${escapeSql(o.date)}, ${escapeSql(
        o.date
      )}, ${escapeSql(o.date)});`
    );

    if (Array.isArray(o.items)) {
      o.items.forEach((item: any, index: number) => {
        const itemId = `oitm-${o.id}-${index}`;
        sqlLines.push(
          `INSERT OR REPLACE INTO order_items (id, order_id, book_id, title, author_name, cover_image, format, quantity, unit_price, total_price, created_at) VALUES (${escapeSql(
            itemId
          )}, ${escapeSql(o.id)}, ${escapeSql(item.bookId)}, ${escapeSql(item.title)}, ${escapeSql(
            item.authorName
          )}, ${escapeSql(item.coverImage)}, ${escapeSql(item.format)}, ${escapeSql(item.quantity)}, ${escapeSql(
            item.price
          )}, ${escapeSql(item.price * item.quantity)}, ${escapeSql(o.date)});`
        );
      });
    }
  }

  // 10. Coupons
  sqlLines.push('');
  sqlLines.push('-- --- COUPONS ---');
  for (const cp of data.coupons || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO coupons (id, code, discount_type, discount_value, min_order, max_discount, expiry_date, valid_from, usage_limit, used_count, is_active, applicable_books) VALUES (${escapeSql(
        cp.id
      )}, ${escapeSql(cp.code)}, ${escapeSql(cp.discountType)}, ${escapeSql(cp.discountValue)}, ${escapeSql(
        cp.minOrder || 0
      )}, ${escapeSql(cp.maxDiscount)}, ${escapeSql(cp.expiryDate)}, ${escapeSql(cp.validFrom)}, ${escapeSql(
        cp.usageLimit || 100
      )}, ${escapeSql(cp.usedCount || 0)}, ${cp.isActive !== false ? 1 : 0}, ${escapeSql(
        cp.applicableBooks
      )});`
    );
  }

  // 11. Settings
  sqlLines.push('');
  sqlLines.push('-- --- SETTINGS ---');
  const settingsObj = data.settings || {};
  sqlLines.push(
    `INSERT OR REPLACE INTO settings (id, settings_json, updated_at) VALUES ('default', ${escapeSql(
      settingsObj
    )}, ${escapeSql(new Date().toISOString())});`
  );

  // 12. Enquiries / Leads
  sqlLines.push('');
  sqlLines.push('-- --- ENQUIRIES ---');
  for (const l of data.leads || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO enquiries (id, name, phone, email, subject, message, date, status, interest, company, quantity, city, book_id, book_title, source_page, created_at) VALUES (${escapeSql(
        l.id
      )}, ${escapeSql(l.name)}, ${escapeSql(l.phone)}, ${escapeSql(l.email)}, ${escapeSql(l.subject)}, ${escapeSql(
        l.message
      )}, ${escapeSql(l.date)}, ${escapeSql(l.status || 'New')}, ${escapeSql(l.interest)}, ${escapeSql(
        l.company
      )}, ${escapeSql(l.quantity)}, ${escapeSql(l.city)}, ${escapeSql(l.bookId)}, ${escapeSql(
        l.bookTitle
      )}, ${escapeSql(l.sourcePage)}, ${escapeSql(l.date)});`
    );
  }

  // 13. Subscribers
  sqlLines.push('');
  sqlLines.push('-- --- SUBSCRIBERS ---');
  for (const sub of data.subscribers || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO subscribers (id, email, date, source, created_at) VALUES (${escapeSql(
        sub.id
      )}, ${escapeSql(sub.email)}, ${escapeSql(sub.date)}, ${escapeSql(sub.source)}, ${escapeSql(sub.date)});`
    );
  }

  // 14. Audit Logs
  sqlLines.push('');
  sqlLines.push('-- --- AUDIT LOGS ---');
  for (const log of data.auditLogs || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO audit_logs (id, user_id, user_name, user_role, action, entity_type, entity_id, resource, details, timestamp, created_at) VALUES (${escapeSql(
        log.id
      )}, ${escapeSql(log.userId || null)}, ${escapeSql(log.userName)}, ${escapeSql(log.userRole)}, ${escapeSql(
        log.action
      )}, ${escapeSql(log.entityType || null)}, ${escapeSql(log.entityId || null)}, ${escapeSql(
        log.resource
      )}, ${escapeSql(log.details)}, ${escapeSql(log.timestamp)}, ${escapeSql(log.timestamp)});`
    );
  }

  // 15. Analytics Events
  sqlLines.push('');
  sqlLines.push('-- --- ANALYTICS EVENTS ---');
  for (const ev of data.analyticsEvents || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO analytics_events (id, type, target, metadata, timestamp, device, book_id, created_at) VALUES (${escapeSql(
        ev.id
      )}, ${escapeSql(ev.type)}, ${escapeSql(ev.target)}, ${escapeSql(ev.metadata)}, ${escapeSql(
        ev.timestamp
      )}, ${escapeSql(ev.device)}, ${escapeSql(ev.bookId)}, ${escapeSql(ev.timestamp)});`
    );
  }

  // 16. Google Sync Logs
  sqlLines.push('');
  sqlLines.push('-- --- GOOGLE SYNC LOGS ---');
  for (const gsl of data.googleSyncLogs || []) {
    sqlLines.push(
      `INSERT OR REPLACE INTO google_sync_logs (id, book_id, book_title, variant_id, action, status, request_timestamp, timestamp, completed_timestamp, merchant_resource_name, error_code, safe_error_message, message, issues, duration_ms, created_at) VALUES (${escapeSql(
        gsl.id
      )}, ${escapeSql(gsl.bookId)}, ${escapeSql(gsl.bookTitle)}, ${escapeSql(gsl.variantId)}, ${escapeSql(
        gsl.action
      )}, ${escapeSql(gsl.status)}, ${escapeSql(gsl.requestTimestamp)}, ${escapeSql(gsl.timestamp)}, ${escapeSql(
        gsl.completedTimestamp
      )}, ${escapeSql(gsl.merchantResourceName)}, ${escapeSql(gsl.errorCode)}, ${escapeSql(
        gsl.safeErrorMessage
      )}, ${escapeSql(gsl.message)}, ${escapeSql(gsl.issues)}, ${escapeSql(gsl.durationMs || 0)}, ${escapeSql(
        gsl.timestamp || new Date().toISOString()
      )});`
    );
  }

  sqlLines.push('');
  sqlLines.push('COMMIT;');

  const generatedDir = path.resolve(process.cwd(), 'cloudflare/generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  const seedFilePath = path.join(generatedDir, 'seed-production.sql');
  fs.writeFileSync(seedFilePath, sqlLines.join('\n'), 'utf-8');
  console.log(`✅ Seed SQL generated successfully at: ${seedFilePath}`);

  return report;
}

// Execute if run directly via tsx
if (process.argv[1] && process.argv[1].endsWith('migrate-json-to-d1.ts')) {
  const isDryRun = process.argv.includes('--dry-run');
  runMigrationAndSeed(isDryRun);
}
