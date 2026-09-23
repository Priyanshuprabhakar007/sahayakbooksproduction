export async function getAllMedia(db: any) {
  const { results } = await db.prepare("SELECT * FROM media").all();
  return results;
}
