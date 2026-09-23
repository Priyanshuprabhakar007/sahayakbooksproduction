export async function getAllBlogs(db: any) {
  const { results } = await db.prepare("SELECT * FROM blogs").all();
  return results.map((b: any) => ({
    ...b,
    content: b.content ? JSON.parse(b.content) : [],
    tags: b.tags ? JSON.parse(b.tags) : [],
  }));
}

export async function getBlogByIdOrSlug(db: any, idOrSlug: string) {
  const { results } = await db.prepare("SELECT * FROM blogs WHERE id = ? OR slug = ?").bind(idOrSlug, idOrSlug).all();
  if (!results || results.length === 0) return null;
  const b = results[0];
  return {
    ...b,
    content: b.content ? JSON.parse(b.content) : [],
    tags: b.tags ? JSON.parse(b.tags) : [],
  };
}
