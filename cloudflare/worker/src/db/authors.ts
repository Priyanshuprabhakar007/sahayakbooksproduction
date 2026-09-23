export function mapAuthorRow(a: any) {
  if (!a) return null;
  return {
    ...a,
    profileMediaId: a.profile_media_id !== undefined ? a.profile_media_id : a.profileMediaId,
    coverImage: a.cover_image !== undefined ? a.cover_image : a.coverImage,
    socialLinks: a.social_links ? (typeof a.social_links === 'string' ? JSON.parse(a.social_links) : a.social_links) : (a.socialLinks || {}),
    isFeatured: a.is_featured !== undefined ? !!a.is_featured : a.isFeatured,
    imageAltText: a.image_alt_text !== undefined ? a.image_alt_text : a.imageAltText,
    seoTitle: a.seo_title !== undefined ? a.seo_title : a.seoTitle,
    metaDescription: a.meta_description !== undefined ? a.meta_description : a.metaDescription,
    publishedBookCount: a.published_book_count !== undefined ? a.published_book_count : a.publishedBookCount,
    articlesCount: a.articles_count !== undefined ? a.articles_count : a.articlesCount,
    createdAt: a.created_at !== undefined ? a.created_at : a.createdAt,
    updatedAt: a.updated_at !== undefined ? a.updated_at : a.updatedAt,
    avatar: a.avatar !== undefined ? a.avatar : a.avatar,
    qualifications: a.qualifications ? (typeof a.qualifications === 'string' ? JSON.parse(a.qualifications) : a.qualifications) : (a.qualifications || []),
    expertise: a.expertise ? (typeof a.expertise === 'string' ? JSON.parse(a.expertise) : a.expertise) : (a.expertise || []),
  };
}

export async function getAllAuthors(db: any) {
  const { results } = await db.prepare("SELECT * FROM authors").all();
  return (results || []).map(mapAuthorRow);
}

export async function getAuthorByIdOrSlug(db: any, idOrSlug: string) {
  const { results } = await db.prepare("SELECT * FROM authors WHERE id = ? OR slug = ?").bind(idOrSlug, idOrSlug).all();
  if (!results || results.length === 0) return null;
  return mapAuthorRow(results[0]);
}
