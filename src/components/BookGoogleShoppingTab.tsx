import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Check,
  Copy,
  Info,
  ShieldCheck,
  Tag,
  BookOpen,
} from 'lucide-react';
import { Book } from '../types';
import { useStore } from '../context/StoreContext';

interface BookGoogleShoppingTabProps {
  book: Partial<Book>;
  onChange: (updated: Partial<Book>) => void;
}

export const BookGoogleShoppingTab: React.FC<BookGoogleShoppingTabProps> = ({
  book,
  onChange,
}) => {
  const { syncBookToGoogleMerchant, removeBookFromGoogleMerchant, settings } = useStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showPayload, setShowPayload] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Pre-flight checks
  const hasValidTitle = Boolean(book.title && book.title.trim().length > 3);
  const hasValidPrice = Boolean(book.price && Number(book.price) > 0);
  const hasValidImage = Boolean(book.coverImage && book.coverImage.startsWith('http'));
  const hasValidIsbn = Boolean(
    book.isbn &&
      (book.isbn.replace(/[-\s]/g, '').length === 10 ||
        book.isbn.replace(/[-\s]/g, '').length === 13)
  );
  const isExcluded = Boolean(book.googleExcluded);
  const isEnabled = book.googleEnabled !== false && !isExcluded;

  const handleSyncNow = async () => {
    if (!book.id) {
      setSyncFeedback('Please save the book first before syncing to Google Merchant Center.');
      return;
    }
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncBookToGoogleMerchant(book.id);
      if (res?.success) {
        setSyncFeedback(
          res.mode === 'live'
            ? 'Successfully synced to Google Merchant API!'
            : 'Validated & staged in Readiness Mode (valid payload generated).'
        );
        onChange({
          ...book,
          googleSyncStatus: 'Approved',
          googleLastSyncedAt: new Date().toISOString(),
        });
      } else {
        setSyncFeedback(res?.message || 'Sync encountered an issue.');
      }
    } catch (e: any) {
      setSyncFeedback(e.message || 'Sync failed.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const handleRemoveFromGoogle = async () => {
    if (!book.id) return;
    setIsSyncing(true);
    try {
      await removeBookFromGoogleMerchant(book.id);
      onChange({
        ...book,
        googleEnabled: false,
        googleExcluded: true,
        googleSyncStatus: 'Not Submitted',
      });
      setSyncFeedback('Book removed from Google Merchant Center.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const currentPayload = {
    channel: 'ONLINE',
    contentLanguage: settings.googleShopping?.targetLanguage || 'en',
    feedLabel: settings.googleShopping?.feedLabel || 'online',
    offerId: book.sku || (book.id ? `BK-${book.id}` : 'BK-DRAFT'),
    targetCountry: settings.googleShopping?.targetCountry || 'IN',
    productAttributes: {
      title: book.title || 'Untitled Book',
      description:
        book.description || 'Scholarly work published by Sahayak Associates.',
      link: `https://sahayakassociates.com/books/${book.slug || book.id || 'preview'}`,
      imageLink: book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
      availability: (Number(book.stockCount) || 0) > 0 ? 'in_stock' : 'out_of_stock',
      condition: book.googleCondition || 'new',
      price: {
        amountMicros: Math.round(Number(book.price || 0) * 1_000_000).toString(),
        currency: settings.googleShopping?.currency || 'INR',
      },
      brand: book.brand || 'Sahayak Associates',
      googleProductCategory: book.googleProductCategory || 'Media > Books',
      gtin: book.isbn || undefined,
      identifierExists: Boolean(book.isbn),
      customLabel0: book.googleCustomLabel0,
      customLabel1: book.googleCustomLabel1,
      customLabel2: book.googleCustomLabel2,
    },
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in duration-200">
      {/* Top Banner & Inclusion Toggle */}
      <div className="p-4 bg-gradient-to-r from-stone-900 to-[#152A4A] rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#C5A059]/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
            <h4 className="font-serif font-bold text-sm text-white">
              Google Shopping & Free Listings Sync
            </h4>
          </div>
          <p className="text-stone-300 text-[11px]">
            Controls whether this scholarly volume is submitted to Google Merchant API v1beta.
          </p>
        </div>

        <label className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl border border-white/20 cursor-pointer self-start sm:self-auto">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => {
              const checked = e.target.checked;
              onChange({
                ...book,
                googleEnabled: checked,
                googleExcluded: !checked,
              });
            }}
            className="w-4 h-4 rounded accent-[#C5A059]"
          />
          <span className="font-bold text-xs text-white">
            {isEnabled ? 'Enabled for Google' : 'Excluded from Google'}
          </span>
        </label>
      </div>

      {/* Sync Feedback Message */}
      {syncFeedback && (
        <div className="p-3 bg-stone-100 border border-stone-300 rounded-xl text-stone-800 font-medium text-xs flex items-center justify-between">
          <span>{syncFeedback}</span>
          <button onClick={() => setSyncFeedback(null)} className="text-stone-500 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Pre-flight Audit Status Box */}
      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
          <h5 className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
            Google Shopping Pre-Flight Validation
          </h5>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              hasValidTitle && hasValidPrice && hasValidImage
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {hasValidTitle && hasValidPrice && hasValidImage ? '100% Eligible' : 'Action Required'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            {hasValidTitle ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span className="text-stone-700">
              {hasValidTitle ? 'Title format valid' : 'Title missing or too short'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasValidPrice ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span className="text-stone-700">
              {hasValidPrice ? `Price: ₹${book.price}` : 'Price must be greater than ₹0'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasValidImage ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span className="text-stone-700">
              {hasValidImage ? 'Permanent HTTPS cover image' : 'Cover image missing'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasValidIsbn ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            )}
            <span className="text-stone-700">
              {hasValidIsbn
                ? `Valid ISBN (${book.isbn}) mapped to GTIN`
                : 'No ISBN: identifier_exists will be false (Compliant)'}
            </span>
          </div>
        </div>
      </div>

      {/* Google-Specific Attributes Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-stone-700 mb-1">
            Google Product Category
          </label>
          <select
            value={book.googleProductCategory || 'Media > Books'}
            onChange={(e) => onChange({ ...book, googleProductCategory: e.target.value })}
            className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-xs"
          >
            <option value="Media > Books">Media &gt; Books (Taxonomy: 784)</option>
            <option value="Media > Books > Non-Fiction">Media &gt; Books &gt; Non-Fiction</option>
            <option value="Media > Books > Non-Fiction > Business & Economics">
              Media &gt; Books &gt; Business &amp; Economics
            </option>
            <option value="Media > Books > Non-Fiction > Law">
              Media &gt; Books &gt; Law
            </option>
            <option value="Media > Books > Reference">Media &gt; Books &gt; Reference</option>
          </select>
          <span className="text-[10px] text-stone-400">
            Standard Google product category taxonomy
          </span>
        </div>

        <div>
          <label className="block font-bold text-stone-700 mb-1">
            Condition &amp; Preservation State
          </label>
          <select
            value={book.googleCondition || 'new'}
            onChange={(e) => onChange({ ...book, googleCondition: e.target.value as any })}
            className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-xs"
          >
            <option value="new">New (Mint print condition)</option>
            <option value="refurbished">Refurbished</option>
            <option value="used">Used (Scholarly archived)</option>
          </select>
          <span className="text-[10px] text-stone-400">Default: New</span>
        </div>

        <div>
          <label className="block font-bold text-stone-700 mb-1">
            Brand / Publisher
          </label>
          <input
            type="text"
            value={book.brand || 'Sahayak Associates'}
            onChange={(e) => onChange({ ...book, brand: e.target.value })}
            className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
          />
          <span className="text-[10px] text-stone-400">Default: Sahayak Associates</span>
        </div>

        <div>
          <label className="block font-bold text-stone-700 mb-1">
            Custom Label 0 (Campaign / Segment)
          </label>
          <input
            type="text"
            placeholder="e.g. Bestseller, Taxation, Wealth"
            value={book.googleCustomLabel0 || ''}
            onChange={(e) => onChange({ ...book, googleCustomLabel0: e.target.value })}
            className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
          />
          <span className="text-[10px] text-stone-400">Used for bidding segmentation in Google Ads</span>
        </div>

        <div>
          <label className="block font-bold text-stone-700 mb-1">
            Custom Label 1 (Edition / Stock Status)
          </label>
          <input
            type="text"
            placeholder="e.g. In Stock, Hardcover, 2026 Edition"
            value={book.googleCustomLabel1 || ''}
            onChange={(e) => onChange({ ...book, googleCustomLabel1: e.target.value })}
            className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block font-bold text-stone-700 mb-1">
            Custom Label 2 (Department / Category)
          </label>
          <input
            type="text"
            placeholder="e.g. Legal, Finance, Business"
            value={book.googleCustomLabel2 || ''}
            onChange={(e) => onChange({ ...book, googleCustomLabel2: e.target.value })}
            className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Sync Status & Action Bar */}
      <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-semibold">Current Google Status:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              book.googleSyncStatus === 'Approved'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : book.googleSyncStatus === 'Pending'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            {book.googleSyncStatus || 'Not Submitted'}
          </span>
          {book.googleLastSyncedAt && (
            <span className="text-[10px] text-stone-400">
              Synced: {new Date(book.googleLastSyncedAt).toLocaleDateString('en-IN')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPayload(!showPayload)}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showPayload ? 'Hide Payload' : 'Preview JSON'}</span>
          </button>

          {book.id && (
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-4 py-2 bg-[#0B192C] text-[#C5A059] font-bold rounded-xl hover:bg-[#152A4A] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync to Google Now'}</span>
            </button>
          )}

          {isEnabled && book.id && (
            <button
              type="button"
              onClick={handleRemoveFromGoogle}
              disabled={isSyncing}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* JSON Payload Inspection Box */}
      {showPayload && (
        <div className="p-4 bg-stone-900 rounded-2xl text-emerald-400 font-mono text-[11px] space-y-2 border border-stone-700">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="text-stone-400 text-[10px] uppercase font-bold">
              Google Merchant API (Products v1beta) Payload
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(currentPayload, null, 2));
                setCopiedPayload(true);
                setTimeout(() => setCopiedPayload(false), 2000);
              }}
              className="text-stone-300 hover:text-white flex items-center gap-1 text-[10px]"
            >
              {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedPayload ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto max-h-60">{JSON.stringify(currentPayload, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default BookGoogleShoppingTab;
