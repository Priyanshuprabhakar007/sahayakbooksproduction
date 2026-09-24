import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { Book } from '../types';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    setIsCartOpen,
    wishlist,
    books,
    toggleWishlist,
    clearWishlist,
    addToCart,
    navigate,
  } = useStore();

  if (!isWishlistOpen) return null;

  // Resolve full book objects from IDs in wishlist
  const wishlistedBooks = wishlist
    .map((id) => books.find((b) => b.id === id))
    .filter((b): b is Book => Boolean(b));

  const handleMoveToCart = (book: Book) => {
    const defaultFormat = book.formats?.[0] || 'Paperback';
    addToCart(book, defaultFormat, 1);
    // Optionally remove from wishlist after moving to cart
    toggleWishlist(book.id);
  };

  const handleMoveAllToCart = () => {
    wishlistedBooks.forEach((book) => {
      const defaultFormat = book.formats?.[0] || 'Paperback';
      addToCart(book, defaultFormat, 1);
    });
    clearWishlist();
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleBookClick = (slug: string) => {
    setIsWishlistOpen(false);
    navigate(`/books/${slug}`);
  };

  return (
    <div
      id="wishlist-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={() => setIsWishlistOpen(false)}
    >
      <div
        className="w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-stone-300 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0B192C] text-[#FAF7F2] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
              <Heart className="w-4 h-4 fill-[#C5A059]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#FAF7F2] flex items-center gap-2">
                <span>Reading Wishlist</span>
                {wishlistedBooks.length > 0 && (
                  <span className="bg-[#C5A059] text-[#0B192C] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {wishlistedBooks.length}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-stone-400">
                Curated titles saved for later acquisition
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone-400 hover:text-[#FAF7F2] hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {wishlistedBooks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shadow-inner">
                <Heart className="w-8 h-8 stroke-1 text-stone-400" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Bookmark titles while browsing scholarly publications, research papers, and classical treatises to review or acquire them here.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsWishlistOpen(false);
                  navigate('/books');
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#0B192C] text-[#C5A059] text-xs font-bold hover:bg-[#152A4A] transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Books Catalog</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 pb-1 border-b border-stone-200">
                <span>{wishlistedBooks.length} {wishlistedBooks.length === 1 ? 'Title' : 'Titles'} Bookmarked</span>
                <button
                  onClick={clearWishlist}
                  className="text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Clear all saved books"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              {wishlistedBooks.map((book) => {
                const discount = book.originalPrice && book.originalPrice > book.price
                  ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={book.id}
                    className="p-3.5 rounded-xl bg-white border border-stone-200/80 shadow-xs hover:border-[#C5A059]/40 transition-all flex gap-3 group"
                  >
                    {/* Cover Thumbnail */}
                    <div
                      onClick={() => handleBookClick(book.slug)}
                      className="w-16 h-22 shrink-0 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 cursor-pointer relative group-hover:shadow-sm transition-shadow"
                    >
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Book Metadata & Actions */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A059] truncate">
                            {book.category || 'General Literature'}
                          </span>
                          <button
                            onClick={() => toggleWishlist(book.id)}
                            className="text-stone-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            title="Remove from wishlist"
                            aria-label={`Remove ${book.title} from wishlist`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4
                          onClick={() => handleBookClick(book.slug)}
                          className="font-serif text-sm font-bold text-[#0B192C] leading-snug line-clamp-1 hover:text-[#C5A059] transition-colors cursor-pointer"
                        >
                          {book.title}
                        </h4>
                        <p className="text-xs text-stone-500 truncate">
                          By {book.authorName}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-2 mt-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-sm text-[#0B192C]">
                            ₹{book.price.toLocaleString('en-IN')}
                          </span>
                          {discount > 0 && book.originalPrice && (
                            <span className="text-[11px] text-stone-400 line-through">
                              ₹{book.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleMoveToCart(book)}
                          className="px-3.5 py-2 min-h-[38px] rounded-xl bg-[#0B192C] text-[#C5A059] hover:bg-[#152A4A] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                          title="Move to Cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {wishlistedBooks.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-stone-200 shadow-md space-y-2.5">
            <button
              onClick={handleMoveAllToCart}
              className="w-full py-3 px-4 rounded-xl bg-[#0B192C] text-[#C5A059] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#152A4A] transition-all shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Move All to Cart &amp; Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsWishlistOpen(false);
                navigate('/books');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-colors text-center cursor-pointer"
            >
              Continue Exploring Catalog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
