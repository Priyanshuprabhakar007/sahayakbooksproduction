function safeJsonParse(val: any, fallback: any) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export function mapAuthorRow(a: any) {
  if (!a) return null;
  return {
    ...a,
    profileMediaId: a.profile_media_id !== undefined ? a.profile_media_id : a.profileMediaId,
    coverImage: a.cover_image !== undefined ? a.cover_image : a.coverImage,
    isFeatured: a.is_featured !== undefined ? !!a.is_featured : a.isFeatured,
    imageAltText: a.image_alt_text !== undefined ? a.image_alt_text : a.imageAltText,
    socialLinks: safeJsonParse(a.social_links !== undefined ? a.social_links : a.socialLinks, {}),
    seoTitle: a.seo_title !== undefined ? a.seo_title : a.seoTitle,
    metaDescription: a.meta_description !== undefined ? a.meta_description : a.metaDescription,
    publishedBookCount: a.published_book_count !== undefined ? Number(a.published_book_count) : (a.publishedBookCount !== undefined ? Number(a.publishedBookCount) : 0),
    articlesCount: a.articles_count !== undefined ? Number(a.articles_count) : (a.articlesCount !== undefined ? Number(a.articlesCount) : 0),
    createdAt: a.created_at !== undefined ? a.created_at : a.createdAt,
    updatedAt: a.updated_at !== undefined ? a.updated_at : a.updatedAt,
    avatar: a.avatar !== undefined ? a.avatar : '',
    email: a.email !== undefined ? a.email : '',
    phone: a.phone !== undefined ? a.phone : '',
    name: a.name !== undefined ? a.name : '',
    slug: a.slug !== undefined ? a.slug : '',
    title: a.title !== undefined ? a.title : '',
    status: a.status !== undefined ? a.status : 'active',
    bio: a.bio !== undefined ? a.bio : '',
    biography: a.biography !== undefined ? a.biography : '',
    qualifications: safeJsonParse(a.qualifications, []),
    expertise: safeJsonParse(a.expertise, []),
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
