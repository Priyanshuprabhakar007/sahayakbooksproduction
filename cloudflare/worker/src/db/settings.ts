export async function getSettings(db: any) {
  const { results } = await db.prepare("SELECT settings_json FROM settings WHERE id = 'default'").all();
  if (!results || results.length === 0) return null;
  return JSON.parse(results[0].settings_json);
}
