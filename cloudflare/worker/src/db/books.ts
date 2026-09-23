export function mapBookRow(b: any) {
  if (!b) return null;
  return {
    ...b,
    coverImage: b.cover_image !== undefined ? b.cover_image : b.coverImage,
    backCoverImage: b.back_cover_image !== undefined ? b.back_cover_image : b.backCoverImage,
    spineImage: b.spine_image !== undefined ? b.spine_image : b.spineImage,
    mockup3DImage: b.mockup_3d_image !== undefined ? b.mockup_3d_image : b.mockup3DImage,
    
    galleryImages: b.gallery_images ? (typeof b.gallery_images === 'string' ? JSON.parse(b.gallery_images) : b.gallery_images) : (b.galleryImages || []),
    previewImages: b.preview_images ? (typeof b.preview_images === 'string' ? JSON.parse(b.preview_images) : b.preview_images) : (b.previewImages || []),
    samplePages: b.sample_pages ? (typeof b.sample_pages === 'string' ? JSON.parse(b.sample_pages) : b.sample_pages) : (b.samplePages || []),
    purchaseLinks: b.purchase_links ? (typeof b.purchase_links === 'string' ? JSON.parse(b.purchase_links) : b.purchase_links) : (b.purchaseLinks || {}),
    aboutBook: b.about_book ? (typeof b.about_book === 'string' ? JSON.parse(b.about_book) : b.about_book) : (b.aboutBook || []),
    whatYouWillLearn: b.what_you_will_learn ? (typeof b.what_you_will_learn === 'string' ? JSON.parse(b.what_you_will_learn) : b.what_you_will_learn) : (b.whatYouWillLearn || []),
    tableOfContents: b.table_of_contents ? (typeof b.table_of_contents === 'string' ? JSON.parse(b.table_of_contents) : b.table_of_contents) : (b.tableOfContents || []),
    googleIssues: b.google_issues ? (typeof b.google_issues === 'string' ? JSON.parse(b.google_issues) : b.google_issues) : (b.googleIssues || []),
    tags: b.tags ? (typeof b.tags === 'string' ? JSON.parse(b.tags) : b.tags) : (b.tags || []),
    formats: b.formats ? (typeof b.formats === 'string' ? JSON.parse(b.formats) : b.formats) : (b.formats || []),

    originalPrice: b.original_price !== undefined ? b.original_price : b.originalPrice,
    discountPercent: b.discount_percent !== undefined ? b.discount_percent : b.discountPercent,
    authorId: b.author_id !== undefined ? b.author_id : b.authorId,
    authorName: b.author_name !== undefined ? b.author_name : b.authorName,
    authorRole: b.author_role !== undefined ? b.author_role : b.authorRole,
    publicationDate: b.publication_date !== undefined ? b.publication_date : b.publicationDate,
    publicationYear: b.publication_year !== undefined ? b.publication_year : b.publicationYear,
    categorySlug: b.category_slug !== undefined ? b.category_slug : b.categorySlug,
    stockCount: b.stock_count !== undefined ? b.stock_count : b.stockCount,
    inStock: b.in_stock !== undefined ? !!b.in_stock : b.inStock,
    stockStatus: b.stock_status !== undefined ? b.stock_status : b.stockStatus,
    trackInventory: b.track_inventory !== undefined ? !!b.track_inventory : b.trackInventory,
    lowStockThreshold: b.low_stock_threshold !== undefined ? b.low_stock_threshold : b.lowStockThreshold,

    isFeatured: b.is_featured !== undefined ? !!b.is_featured : b.isFeatured,
    isPrimaryFeatured: b.is_primary_featured !== undefined ? !!b.is_primary_featured : b.isPrimaryFeatured,
    isBestseller: b.is_bestseller !== undefined ? !!b.is_bestseller : b.isBestseller,
    isNewRelease: b.is_new_release !== undefined ? !!b.is_new_release : b.isNewRelease,

    showOriginalPrice: b.show_original_price !== undefined ? !!b.show_original_price : b.showOriginalPrice,
    showDiscountBadge: b.show_discount_badge !== undefined ? !!b.show_discount_badge : b.showDiscountBadge,

    metaTitle: b.meta_title !== undefined ? b.meta_title : b.metaTitle,
    metaDescription: b.meta_description !== undefined ? b.meta_description : b.metaDescription,
    canonicalUrl: b.canonical_url !== undefined ? b.canonical_url : b.canonicalUrl,
    focusKeyword: b.focus_keyword !== undefined ? b.focus_keyword : b.focusKeyword,

    reviewCount: b.review_count !== undefined ? b.review_count : b.reviewCount,
    viewsCount: b.views_count !== undefined ? b.views_count : b.viewsCount,
    clicksCount: b.clicks_count !== undefined ? b.clicks_count : b.clicksCount,
    purchasesCount: b.purchases_count !== undefined ? b.purchases_count : b.purchasesCount,
    frequentlyBoughtWithId: b.frequently_bought_with_id !== undefined ? b.frequently_bought_with_id : b.frequentlyBoughtWithId,

    updatedAt: b.updated_at !== undefined ? b.updated_at : b.updatedAt,
    createdAt: b.created_at !== undefined ? b.created_at : b.createdAt,
  };
}

export async function getAllBooks(db: any) {
  const { results } = await db.prepare("SELECT * FROM books").all();
  return (results || []).map(mapBookRow);
}

export async function getBookByIdOrSlug(db: any, idOrSlug: string) {
  const { results } = await db.prepare("SELECT * FROM books WHERE id = ? OR slug = ?").bind(idOrSlug, idOrSlug).all();
  if (!results || results.length === 0) return null;
  return mapBookRow(results[0]);
}
