export async function getAllAuthors(db: any) {
  const { results } = await db.prepare("SELECT * FROM authors").all();
  return results.map((a: any) => ({
    ...a,
    qualifications: a.qualifications ? JSON.parse(a.qualifications) : [],
    expertise: a.expertise ? JSON.parse(a.expertise) : [],
    socialLinks: a.social_links ? JSON.parse(a.social_links) : {},
  }));
}

export async function getAuthorByIdOrSlug(db: any, idOrSlug: string) {
  const { results } = await db.prepare("SELECT * FROM authors WHERE id = ? OR slug = ?").bind(idOrSlug, idOrSlug).all();
  if (!results || results.length === 0) return null;
  const a = results[0];
  return {
    ...a,
    qualifications: a.qualifications ? JSON.parse(a.qualifications) : [],
    expertise: a.expertise ? JSON.parse(a.expertise) : [],
    socialLinks: a.social_links ? JSON.parse(a.social_links) : {},
  };
}
