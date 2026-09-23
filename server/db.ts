import fs from 'fs';
import path from 'path';
import {
  INITIAL_BOOKS,
  INITIAL_AUTHORS,
  INITIAL_CATEGORIES,
  INITIAL_REVIEWS,
  INITIAL_BLOGS,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
  INITIAL_MEDIA,
  INITIAL_LEADS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
} from '../src/data/initialData';

export interface DatabaseSchema {
  books: typeof INITIAL_BOOKS;
  authors: typeof INITIAL_AUTHORS;
  categories: typeof INITIAL_CATEGORIES;
  reviews: typeof INITIAL_REVIEWS;
  blogs: typeof INITIAL_BLOGS;
  coupons: typeof INITIAL_COUPONS;
  settings: typeof INITIAL_SETTINGS;
  mediaItems: typeof INITIAL_MEDIA;
  leads: typeof INITIAL_LEADS;
  allUsers: typeof INITIAL_USERS;
  auditLogs: typeof INITIAL_AUDIT_LOGS;
  orders: any[];
  subscribers: any[];
  analyticsEvents: any[];
  googleSyncLogs?: any[];
  updatedAt: string;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial default database structure
function getDefaultDb(): DatabaseSchema {
  return {
    books: INITIAL_BOOKS,
    authors: INITIAL_AUTHORS,
    categories: INITIAL_CATEGORIES,
    reviews: INITIAL_REVIEWS,
    blogs: INITIAL_BLOGS,
    coupons: INITIAL_COUPONS,
    settings: INITIAL_SETTINGS,
    mediaItems: INITIAL_MEDIA,
    leads: INITIAL_LEADS,
    allUsers: INITIAL_USERS,
    auditLogs: INITIAL_AUDIT_LOGS,
    orders: [
      {
        id: 'ord-1001',
        orderNumber: 'SB-2026-8941',
        date: '2026-02-27T10:30:00Z',
        customer: {
          fullName: 'Aarav Sharma',
          email: 'aarav.sharma@example.com',
          phone: '+91 98112 34567',
          address: 'Flat 402, Royal Residency, Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pinCode: '201309',
          country: 'India',
        },
        items: [
          {
            bookId: 'book-1',
            title: 'Heyy 18: What an 18 Year Old Should Know',
            authorName: 'Sandeep Sahni',
            coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
            format: 'Paperback',
            price: 399,
            originalPrice: 499,
            quantity: 1,
            inStock: true,
          },
        ],
        subtotal: 399,
        shipping: 60,
        discount: 0,
        total: 459,
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        orderStatus: 'Shipped',
        trackingNumber: 'BLUEDART-89410294',
        courierPartner: 'BlueDart Express',
        estimatedDelivery: 'March 3, 2026',
        trackingSteps: [
          { status: 'Order Confirmed', label: 'Order Confirmed', description: 'Payment verified', timestamp: 'Feb 27, 2026, 10:30 AM', completed: true, current: false },
          { status: 'Processing', label: 'Order Processing', description: 'Inventory reserved', timestamp: 'Feb 27, 2026, 01:15 PM', completed: true, current: false },
          { status: 'Packed', label: 'Book Packaging', description: 'Packed securely', timestamp: 'Feb 28, 2026, 11:00 AM', completed: true, current: false },
          { status: 'Shipped', label: 'In Transit', description: 'Dispatched via BlueDart Express', timestamp: 'Feb 28, 2026, 04:30 PM', completed: true, current: true },
          { status: 'Out for Delivery', label: 'Out for Delivery', description: 'Courier out for delivery', completed: false, current: false },
          { status: 'Delivered', label: 'Delivered', description: 'Delivered to recipient', completed: false, current: false },
        ],
      },
    ],
    subscribers: [
      { id: 'sub-1', email: 'reader.arun@gmail.com', date: '2026-02-20', source: 'Home Footer' },
      { id: 'sub-2', email: 'books.lover@reader.in', date: '2026-02-24', source: 'Newsletter Banner' },
    ],
    analyticsEvents: [
      { id: 'ev-1', type: 'pageview', target: 'Home', timestamp: new Date(Date.now() - 3600000).toISOString(), device: 'desktop' },
      { id: 'ev-2', type: 'view_book', target: 'Heyy 18: What an 18 Year Old Should Know', timestamp: new Date(Date.now() - 1800000).toISOString(), device: 'desktop' },
    ],
    googleSyncLogs: [],
    updatedAt: new Date().toISOString(),
  };
}

// In-memory cache for fast read/write
let inMemoryDb: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(raw);
      return inMemoryDb!;
    } catch (err) {
      console.error('Error reading db.json, falling back to defaults:', err);
    }
  }

  // Create file with initial default data if it doesn't exist
  const defaultDb = getDefaultDb();
  inMemoryDb = defaultDb;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing default db.json:', err);
  }
  return defaultDb;
}

export function saveDatabase(data: Partial<DatabaseSchema>): DatabaseSchema {
  const current = getDatabase();
  const updated: DatabaseSchema = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  inMemoryDb = updated;

  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(updated, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving to db.json:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  }

  return updated;
}
