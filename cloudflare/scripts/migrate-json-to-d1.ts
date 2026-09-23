import fs from 'fs';
import path from 'path';

interface MigrationReport {
  dryRun: boolean;
  usersDetected: number;
  authorsDetected: number;
  categoriesDetected: number;
  booksDetected: number;
  variantsDetected: number;
  mediaDetected: number;
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

export function runMigrationDryRun(): MigrationReport {
  const dbPath = path.resolve(process.cwd(), 'data/db.json');
  if (!fs.existsSync(dbPath)) {
    throw new Error('data/db.json not found!');
  }

  const raw = fs.readFileSync(dbPath, 'utf-8');
  const data = JSON.parse(raw);

  const report: MigrationReport = {
    dryRun: true,
    usersDetected: (data.allUsers || []).length,
    authorsDetected: (data.authors || []).length,
    categoriesDetected: (data.categories || []).length,
    booksDetected: (data.books || []).length,
    variantsDetected: 0,
    mediaDetected: (data.mediaItems || []).length,
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

  // Count variants and order items
  if (Array.isArray(data.books)) {
    for (const book of data.books) {
      if (Array.isArray(book.variants)) {
        report.variantsDetected += book.variants.length;
      }
    }
  }

  if (Array.isArray(data.orders)) {
    for (const order of data.orders) {
      if (Array.isArray(order.items)) {
        report.orderItemsDetected += order.items.length;
      }
    }
  }

  // Detect R2 URLs in media
  if (Array.isArray(data.mediaItems)) {
    for (const media of data.mediaItems) {
      const url = media.url || media.publicUrl || '';
      if (url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')) {
        // Valid R2 URL detected - metadata record will be created
      } else if (url.startsWith('data:image')) {
        report.warnings.push(`Media item ${media.id} uses base64 data URI. Recommended to upload to R2.`);
      }
    }
  }

  console.log('=== Sahayak Books D1 Migration Dry Run Report ===');
  console.log(JSON.stringify(report, null, 2));
  return report;
}

// Execute if run directly via tsx
if (process.argv[1] && process.argv[1].endsWith('migrate-json-to-d1.ts')) {
  runMigrationDryRun();
}
