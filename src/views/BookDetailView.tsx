import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';
import { BookFormat } from '../types';
import {
  Star,
  ShoppingBag,
  Heart,
  BookOpen,
  Share2,
  CheckCircle2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Check,
  Award,
  ChevronRight,
  Send,
  MessageCircle,
  Copy,
} from 'lucide-react';

interface BookDetailViewProps {
  slug: string;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({ slug }) => {
  const {
    books,
    authors,
    reviews,
    addToCart,
    toggleWishlist,
    isInWishlist,
    openSampleReader,
    addReview,
    currentUser,
    navigate,
    trackEvent,
  } = useStore();

  const book = books.find((b) => b.slug === slug) || books[0];
  const isWishlisted = isInWishlist(book.id);

  // Photo Gallery state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  React.useEffect(() => {
    setSelectedImage(null);
  }, [book.id]);

  const galleryCards = [
    { id: 'front', label: 'Front Cover', image: book.coverImage },
    { id: 'back', label: 'Back Cover', image: book.backCoverImage }
  ].filter((item) => item.image);

  const activeImage = selectedImage || book.coverImage;

  // Form states
  const [selectedFormat, setSelectedFormat] = useState<BookFormat>(book.formats[0] || 'Hardcover');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'learn' | 'contents' | 'specs'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  // Combo bundle checkbox
  const bundleBook = books.find((b) => b.id !== book.id && b.category === book.category) || books[1];
  const [includeBundle, setIncludeBundle] = useState(true);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState(currentUser?.name || '');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const bookReviews = reviews.filter((r) => r.bookId === book.id || r.bookTitle === book.title);
  const author = authors.find((a) => a.id === book.authorId || a.name === book.authorName);
  const relatedBooks = books.filter((b) => b.id !== book.id && (b.category === book.category || b.authorId === book.authorId));

  // Dynamic price adjustment based on format
  const getFormatPrice = (fmt: BookFormat) => {
    if (fmt === 'eBook') return Math.round(book.price * 0.45);
    if (fmt === 'Hardcover') return Math.round(book.price * 1.25);
    return book.price; // Paperback default
  };

  const currentPrice = getFormatPrice(selectedFormat);
  const bundlePrice = includeBundle ? currentPrice + bundleBook.price : currentPrice;

  const handleAddToCart = () => {
    addToCart(book, selectedFormat, quantity);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(book, selectedFormat, quantity);
    navigate('/checkout');
  };

  const handleBundleBuy = () => {
    addToCart(book, selectedFormat, 1);
    if (includeBundle && bundleBook) {
      addToCart(bundleBook, 'Paperback', 1);
    }
    navigate('/checkout');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = (reviewTitle || '').trim();
    const cleanComment = (reviewComment || '').trim();
    const cleanName = (reviewName || '').trim();

    if (cleanTitle && cleanComment && cleanName && book) {
      addReview({
        bookId: book.id,
        bookTitle: book.title,
        userName: cleanName,
        rating: reviewRating,
        title: cleanTitle,
        comment: cleanComment,
        verifiedPurchase: true,
      });
      setReviewSubmitted(true);
      setReviewTitle('');
      setReviewComment('');
      setTimeout(() => setReviewSubmitted(false), 4000);
    }
  };

  return (
    <div id="book-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <button onClick={() => navigate('/')} className="hover:text-[#0B192C]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigate('/books')} className="hover:text-[#0B192C]">
          Books
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#C5A059] font-medium">{book.category}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-800 font-bold truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Product Showcase (Cover Gallery + Details & Purchasing) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Deluxe Book Cover Spread & Flipbook Trigger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-stone-100 to-stone-200/80 rounded-3xl p-8 border border-stone-200 shadow-md flex items-center justify-center relative overflow-hidden group">
            {/* 3D Book Visualization Container */}
            <div className="relative w-64 sm:w-76 h-92 sm:h-108 rounded-2xl shadow-2xl overflow-hidden border-2 border-stone-300 transform group-hover:scale-105 transition-transform duration-500">
              <img
                src={activeImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none book-spine-effect" />
              {book.isBestseller && (
                <div className="absolute top-3 left-3 bg-[#C5A059] text-[#0B192C] text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                  #1 National Bestseller
                </div>
              )}
            </div>
          </div>

          {/* Book Gallery Photos / Thumbnails in Squircle Frames (matching user mockup exactly) */}
          {galleryCards.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {galleryCards.map((card) => {
                  const isActive = card.image === activeImage;
                  return (
                    <button
                      key={card.id}
                      onClick={() => setSelectedImage(card.image)}
                      className={`relative w-24 sm:w-28 h-32 sm:h-38 p-1.5 sm:p-2 bg-white border-[3px] transition-all duration-300 transform hover:scale-[1.04] flex items-center justify-center overflow-hidden cursor-pointer ${
                        isActive
                          ? 'border-[#2563EB] rounded-[24px] shadow-lg shadow-blue-500/10 scale-102 z-10'
                          : 'border-[#E5E5E5] rounded-[24px] hover:border-stone-300'
                      }`}
                      title={`View ${card.label}`}
                    >
                      <div className="w-full h-full bg-white rounded-[16px] overflow-hidden flex items-center justify-center">
                        <img
                          src={card.image}
                          alt={`${book.title} - ${card.label}`}
                          className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-stone-500 uppercase tracking-wider block text-center pt-1.5">
                {galleryCards.find((c) => c.image === activeImage)?.label || 'Book Preview'}
              </span>
            </div>
          )}

          {/* Action Row below cover */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openSampleReader(book)}
              className="py-3 px-4 rounded-xl bg-white border border-[#C5A059] text-[#0B192C] font-bold text-xs sm:text-sm hover:bg-[#C5A059]/10 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#C5A059]" />
              <span>Read Sample Pages</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-3 px-4 rounded-xl bg-white border border-stone-300 text-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-stone-500" />
                  <span>Share Book</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Full Title, Pricing, Formats, and Checkout */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest leading-relaxed">
                {book.categoryBreadcrumb || `${book.category} • ISBN ${book.isbn}`}
              </span>
              <button
                onClick={() => toggleWishlist(book.id)}
                className={`p-2 rounded-full border transition-all ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'border-stone-200 text-stone-500 hover:text-rose-600'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B192C] leading-tight">
              {book.title}
            </h1>

            {book.subtitle && (
              <p className="text-stone-600 text-base sm:text-lg mt-2 font-medium">
                {book.subtitle}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-200">
              <p className="text-xs sm:text-sm text-stone-700">
                Authored by{' '}
                <button
                  onClick={() => author && navigate(`/authors/${author.slug}`)}
                  className="font-bold text-[#0B192C] hover:text-[#C5A059] hover:underline"
                >
                  {book.authorName}
                </button>
                {book.authorRole && (
                  <span className="text-stone-500 text-xs"> ({book.authorRole})</span>
                )}
              </p>

              <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-xs sm:text-sm">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-stone-900 font-bold">{book.rating}</span>
                <span className="text-stone-400 font-normal">({book.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-stone-100/80 p-5 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#0B192C]">
                ₹{currentPrice}
              </span>
              {book.originalPrice > currentPrice && (
                <span className="font-mono text-base sm:text-lg text-stone-400 line-through">
                  ₹{book.originalPrice}
                </span>
              )}
              {book.discountPercent && (
                <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-xs font-bold">
                  {book.discountPercent}% Savings
                </span>
              )}
            </div>

            {/* Format Selector Pills */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                Select Edition Format:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {book.formats.map((fmt) => {
                  const p = getFormatPrice(fmt);
                  return (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedFormat === fmt
                          ? 'border-[#0B192C] bg-[#0B192C] text-white shadow-md'
                          : 'border-stone-300 bg-white text-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <div className="font-bold text-xs">{fmt}</div>
                      <div className={`font-mono text-xs mt-0.5 ${selectedFormat === fmt ? 'text-[#C5A059]' : 'text-stone-600'}`}>
                        ₹{p}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Stock Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase text-stone-700">Quantity:</span>
                <div className="flex items-center bg-white border border-stone-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-stone-100 text-stone-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-mono font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-stone-100 text-stone-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {book.inStock ? `In Stock • ${book.stockCount} Pristine Copies Ready` : 'Out of Stock'}
              </span>
            </div>

            {/* Main Action CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                id="book-detail-add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!book.inStock}
                className={`py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  isAddedRecently
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#0B192C] hover:bg-[#152A4A] text-white'
                }`}
              >
                {isAddedRecently ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                    <span>Add to Basket</span>
                  </>
                )}
              </button>

              <button
                id="book-detail-buy-now-btn"
                onClick={handleBuyNow}
                disabled={!book.inStock}
                className="py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D8B76E] text-[#0B192C] font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-105 transition-all cursor-pointer"
              >
                <span>Instant Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-stone-600 pt-2">
            <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <Truck className="w-4 h-4 text-[#C5A059] mx-auto mb-1" />
              <div className="font-bold text-stone-800">{book.delivery || 'Express Delivery'}</div>
              <div className="text-[10px] text-stone-500">Fast Shipping</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="font-bold text-stone-800">{book.fulfilledBy ? `Fulfilled by ${book.fulfilledBy}` : '100% Authentic'}</div>
              <div className="text-[10px] text-stone-500">{book.seller ? `Seller: ${book.seller}` : 'Direct from Imprint'}</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <RotateCcw className="w-4 h-4 text-[#C5A059] mx-auto mb-1" />
              <div className="font-bold text-stone-800">{book.replacement || '7-Day Return'}</div>
              <div className="text-[10px] text-stone-500">{book.payment || 'Hassle-Free Exchange'}</div>
            </div>
          </div>
        </div>
      </div>



      {/* Tabs Section: Overview, What You Will Learn, Table of Contents, Specifications */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-8">
        {/* Tab Headers */}
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-4">
          {[
            { id: 'overview', label: 'Book Overview' },
            { id: 'learn', label: 'Key Highlights' },
            { id: 'contents', label: 'Table of Contents' },
            { id: 'specs', label: 'Book Specifications' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0B192C] text-[#FAF7F2] shadow-sm'
                  : 'text-stone-600 hover:text-[#0B192C] hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Editorial Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 max-w-4xl text-stone-700 leading-relaxed text-sm sm:text-base font-serif">
            <p className="first-letter:text-3xl first-letter:font-bold first-letter:text-[#0B192C]">
              {book.description}
            </p>
            <p>
              Published by Sahayak Associates, this book offers clear, actionable insights designed to guide readers with practical wisdom and real-world examples.
            </p>
          </div>
        )}

        {/* Tab 2: What You Will Learn */}
        {activeTab === 'learn' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {(book.whatYouWillLearn || [
              'Develop clear structural frameworks for high-stakes institutional decision making.',
              'Master current regulatory compliance mandates and constitutional checks.',
              'Mitigate systemic risks with proven analytical crisis matrices.',
              'Implement sustainable governance methodologies across multidisciplinary teams.',
            ]).map((point, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-stone-800 font-medium">{point}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Table of Contents */}
        {activeTab === 'contents' && (
          <div className="space-y-3 max-w-3xl">
            {(book.tableOfContents || [
              'Chapter 1: Foundations, Institutional History & Core Principles',
              'Chapter 2: Statutory Frameworks & Regulatory Landscape',
              'Chapter 3: The Architecture of Strategic Decision Making',
              'Chapter 4: Crisis Management & Systemic Risk Resilience',
              'Chapter 5: Leadership Ethics and Modern Corporate Governance',
              'Chapter 6: Case Compendium & Practical Implementation Templates',
            ]).map((chapter, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-stone-200 flex items-center justify-between text-xs sm:text-sm text-stone-800 hover:bg-stone-50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#C5A059]">{idx + 1}.</span>
                  <span className="font-serif font-semibold">{chapter}</span>
                </div>
                <span className="text-xs font-mono text-stone-400">pp. {idx * 45 + 1}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Specifications */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl text-xs">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block">ISBN Number</span>
              <span className="font-mono font-bold text-stone-900">{book.isbn}</span>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block">Publisher</span>
              <span className="font-semibold text-stone-900">{book.publisher}</span>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block">Publication Date</span>
              <span className="font-semibold text-stone-900">{book.publicationDate}</span>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block">Total Page Count</span>
              <span className="font-mono font-bold text-stone-900">{book.pageCount} Pages</span>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block">Language</span>
              <span className="font-semibold text-stone-900">{book.language}</span>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block">Dimensions & Weight</span>
              <span className="font-mono font-semibold text-stone-900">
                {book.dimensions} • {book.weight}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Author Biography Dossier */}
      {author && (
        <section className="bg-gradient-to-r from-[#0B192C] to-[#0E2238] text-[#FAF7F2] rounded-3xl p-6 sm:p-10 border border-[#C5A059]/30 shadow-xl flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-[#C5A059] shadow-lg shrink-0">
            <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5A059] uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>About the Author</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">{author.name}</h3>
            <p className="text-xs text-[#C5A059] font-medium">{author.title}</p>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
              {author.bio}
            </p>
            <button
              onClick={() => navigate(`/authors/${author.slug}`)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#C5A059] hover:underline pt-2"
            >
              <span>Explore all {author.publishedBookCount} works by {author.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* Customer Reviews & Submit Review Form */}
      <section id="reviews-section" className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-200 pb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">
              Reader Reflections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B192C]">
              Customer Reviews ({bookReviews.length})
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-extrabold font-mono text-[#0B192C]">{book.rating}</div>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'fill-current' : 'text-stone-300'}`}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs text-stone-500 max-w-[120px] leading-tight">
              Based on {book.reviewCount} verified patron reviews
            </span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookReviews.map((rev) => (
            <div key={rev.id} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] text-stone-400 font-mono">{rev.date}</span>
              </div>
              <h4 className="font-serif text-sm font-bold text-[#0B192C]">“{rev.title}”</h4>
              <p className="text-xs text-stone-600 leading-relaxed italic">"{rev.comment}"</p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200/60">
                <span className="font-bold text-stone-800">{rev.userName}</span>
                {rev.verifiedPurchase && (
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Buyer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Review Form */}
        <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-2xl border border-stone-300 space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#0B192C]">
            Write a Review for this Book
          </h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Your Rating:</label>
                <div className="flex gap-1 text-amber-500 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-stone-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-stone-700 block mb-1">Your Full Name:</label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Verma"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Review Headline:</label>
              <input
                type="text"
                required
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Invaluable perspective on corporate jurisprudence"
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Detailed Feedback:</label>
              <textarea
                rows={3}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share how this book helped your study, research or professional practice..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0B192C] text-[#C5A059] font-bold text-xs hover:bg-[#152A4A] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Submit Verified Review</span>
              <Send className="w-3.5 h-3.5" />
            </button>
            {reviewSubmitted && (
              <p className="text-xs text-emerald-700 font-semibold">
                Thank you! Your review has been recorded and published.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Related Publications Recommendation Carousel */}
      {relatedBooks.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">
                Complementary Studies
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B192C]">
                Related Books in {book.category}
              </h2>
            </div>
            <button
              onClick={() => navigate('/books')}
              className="text-xs font-bold text-[#0B192C] hover:text-[#C5A059] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedBooks.slice(0, 4).map((relBook) => (
              <BookCard key={relBook.id} book={relBook} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
