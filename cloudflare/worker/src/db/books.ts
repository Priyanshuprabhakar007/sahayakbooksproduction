export async function getAllBooks(db: any) {
  const { results } = await db.prepare("SELECT * FROM books").all();
  return results.map((b: any) => ({
    ...b,
    tags: b.tags ? JSON.parse(b.tags) : [],
    formats: b.formats ? JSON.parse(b.formats) : [],
    galleryImages: b.gallery_images ? JSON.parse(b.gallery_images) : [],
    previewImages: b.preview_images ? JSON.parse(b.preview_images) : [],
    samplePages: b.sample_pages ? JSON.parse(b.sample_pages) : [],
    purchaseLinks: b.purchase_links ? JSON.parse(b.purchase_links) : {},
    aboutBook: b.about_book ? JSON.parse(b.about_book) : [],
    whatYouWillLearn: b.what_you_will_learn ? JSON.parse(b.what_you_will_learn) : [],
    tableOfContents: b.table_of_contents ? JSON.parse(b.table_of_contents) : [],
    googleIssues: b.google_issues ? JSON.parse(b.google_issues) : [],
  }));
}

export async function getBookByIdOrSlug(db: any, idOrSlug: string) {
  const { results } = await db.prepare("SELECT * FROM books WHERE id = ? OR slug = ?").bind(idOrSlug, idOrSlug).all();
  if (!results || results.length === 0) return null;
  const b = results[0];
  return {
    ...b,
    tags: b.tags ? JSON.parse(b.tags) : [],
    formats: b.formats ? JSON.parse(b.formats) : [],
    galleryImages: b.gallery_images ? JSON.parse(b.gallery_images) : [],
    previewImages: b.preview_images ? JSON.parse(b.preview_images) : [],
    samplePages: b.sample_pages ? JSON.parse(b.sample_pages) : [],
    purchaseLinks: b.purchase_links ? JSON.parse(b.purchase_links) : {},
    aboutBook: b.about_book ? JSON.parse(b.about_book) : [],
    whatYouWillLearn: b.what_you_will_learn ? JSON.parse(b.what_you_will_learn) : [],
    tableOfContents: b.table_of_contents ? JSON.parse(b.table_of_contents) : [],
    googleIssues: b.google_issues ? JSON.parse(b.google_issues) : [],
  };
}
