export async function getAllCategories(db: any) {
  const { results } = await db.prepare("SELECT * FROM categories").all();
  return results;
}
