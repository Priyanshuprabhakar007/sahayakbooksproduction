import React, { useState } from 'react';
import { Book, BookFormat } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Eye, ShoppingBag, Star, BookOpen, Sparkles, Check } from 'lucide-react';

interface BookCardProps {
  book: Book;
  compact?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, compact = false }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    openQuickView,
    openSampleReader,
    navigate,
    trackEvent,
  } = useStore();

  const [selectedFormat, setSelectedFormat] = useState<BookFormat>(book.formats[0] || 'Paperback');
  const [isAddedRecently, setIsAddedRecently] = useState(false);
  const isWishlisted = isInWishlist(book.id);

  const handleCardClick = () => {
    trackEvent('view_book', book.title);
    navigate(`/books/${book.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(book, selectedFormat, 1);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(book.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickView(book);
  };

  const handleReadSample = (e: React.MouseEvent) => {
    e.stopPropagation();
    openSampleReader(book);
  };

  return (
    <div
      id={`book-card-${book.id}`}
      onClick={handleCardClick}
      className="group relative bg-[#FAF7F2] rounded-2xl border border-stone-200/80 hover:border-[#C5A059]/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Cover Image & Hover Badges Container */}
      <div className="relative w-full aspect-[3/4] bg-stone-100 overflow-hidden flex items-center justify-center p-4">
        {/* Book Visual with 3D Tilt Effect on hover */}
        <div className="relative w-full h-full max-h-[280px] rounded-lg shadow-md group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2 group-hover:rotate-1 group-hover:scale-[1.03] overflow-hidden border border-stone-300/60">
          <img
            src={book.coverImage}
            alt={book.title}
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 pointer-events-none book-spine-effect" />
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {book.isBestseller && (
            <span className="bg-[#0B192C] text-[#C5A059] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm border border-[#C5A059]/30">
              Bestseller
            </span>
          )}
          {book.isNewRelease && (
            <span className="bg-[#C5A059] text-[#0B192C] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              New Release
            </span>
          )}
          {book.discountPercent && book.discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              {book.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-toggle-${book.id}`}
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-20 shadow-md ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Action Overlay on Hover */}
        <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
          <button
            onClick={handleQuickView}
            className="flex-1 py-2 px-3 rounded-lg bg-[#0B192C]/90 hover:bg-[#0B192C] text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Quick View</span>
          </button>
          <button
            onClick={handleReadSample}
            className="py-2 px-3 rounded-lg bg-[#C5A059] hover:bg-[#D8B76E] text-[#0B192C] text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-lg"
            title="Read Sample Chapter"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sample</span>
          </button>
        </div>
      </div>

      {/* Book Metadata Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="text-[#C5A059] font-medium tracking-wide uppercase text-[11px]">
              {book.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{book.rating}</span>
              <span className="text-stone-400 font-normal">({book.reviewCount})</span>
            </div>
          </div>

          {/* Book Title */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#0B192C] group-hover:text-[#C5A059] transition-colors line-clamp-2 leading-snug">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-stone-600 mt-1 font-medium truncate">
            By <span className="text-stone-800 font-semibold">{book.authorName}</span>
          </p>

          {/* Formats Pills */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {book.formats.map((fmt) => (
              <button
                key={fmt}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFormat(fmt);
                }}
                className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                  selectedFormat === fmt
                    ? 'border-[#C5A059] bg-[#C5A059]/10 text-[#0B192C] font-semibold'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-[#0B192C]">₹{book.price}</span>
              {book.originalPrice > book.price && (
                <span className="text-xs font-mono text-stone-400 line-through">
                  ₹{book.originalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block">
              {book.inStock ? 'In Stock (Ships in 24h)' : 'Out of Stock'}
            </span>
          </div>

          <button
            id={`add-to-cart-${book.id}`}
            onClick={handleAddToCart}
            disabled={!book.inStock}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isAddedRecently
                ? 'bg-emerald-700 text-white'
                : book.inStock
                ? 'bg-[#0B192C] hover:bg-[#C5A059] hover:text-[#0B192C] text-[#FAF7F2]'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
            title="Add to Shopping Cart"
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
