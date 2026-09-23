import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';
import { BookFormat } from '../types';
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  X,
  Star,
  Check,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const BooksCatalogView: React.FC = () => {
  const {
    books = [],
    categories = [],
    authors = [],
    searchQuery = '',
    setSearchQuery,
    selectedCategory = 'all',
    setSelectedCategory,
    openQuickView,
    openSampleReader,
    addToCart,
    navigate,
  } = useStore();

  // Filters State
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filtered & Sorted books calculation
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search query filter
        const queryClean = (searchQuery || '').trim();
        if (queryClean) {
          const q = queryClean.toLowerCase();
          const matchesTitle = (book.title || '').toLowerCase().includes(q);
          const matchesAuthor = (book.authorName || '').toLowerCase().includes(q);
          const matchesCategory = (book.category || '').toLowerCase().includes(q);
          const matchesIsbn = (book.isbn || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesAuthor && !matchesCategory && !matchesIsbn) return false;
        }

        // Category filter
        if (selectedCategory && selectedCategory !== 'all') {
          if (book.categorySlug !== selectedCategory && !book.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
            return false;
          }
        }

        // Author filter
        if (selectedAuthor !== 'all') {
          const matchId = book.authorId === selectedAuthor;
          const matchName = (book.authorName || '').toLowerCase().includes(selectedAuthor.toLowerCase());
          const matchCoAuthor = (book.coAuthor || '').toLowerCase().includes(selectedAuthor.toLowerCase());
          if (!matchId && !matchName && !matchCoAuthor) {
            return false;
          }
        }

        // Format filter
        if (selectedFormat !== 'all') {
          if (!book.formats.includes(selectedFormat as BookFormat)) {
            return false;
          }
        }

        // Price range filter
        if (priceRange !== 'all') {
          if (priceRange === 'under-400' && book.price >= 400) return false;
          if (priceRange === '400-600' && (book.price < 400 || book.price > 600)) return false;
          if (priceRange === '600-800' && (book.price < 600 || book.price > 800)) return false;
          if (priceRange === '800-plus' && book.price <= 800) return false;
        }

        // Rating filter
        if (minRating > 0 && book.rating < minRating) {
          return false;
        }

        // In Stock filter
        if (inStockOnly && !book.inStock) {
          return false;
        }

        // Language filter
        if (selectedLanguage !== 'all' && book.language !== selectedLanguage) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return b.publicationYear - a.publicationYear;
        // Default: featured
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [
    books,
    searchQuery,
    selectedCategory,
    selectedAuthor,
    selectedFormat,
    priceRange,
    minRating,
    inStockOnly,
    selectedLanguage,
    sortBy,
  ]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedAuthor('all');
    setSelectedFormat('all');
    setPriceRange('all');
    setMinRating(0);
    setInStockOnly(false);
    setSelectedLanguage('all');
    setSortBy('featured');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCategory) ||
    selectedAuthor !== 'all' ||
    selectedFormat !== 'all' ||
    priceRange !== 'all' ||
    minRating > 0 ||
    inStockOnly ||
    selectedLanguage !== 'all';

  return (
    <div id="books-catalog-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
              <span>Sahayak Library & Books</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B192C]">
              Complete Publications Catalog
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Authoritative texts across governance, constitutional jurisprudence, economic strategy, and leadership.
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, author, ISBN..."
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#0B192C] shadow-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar (Sort & Views) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden px-3.5 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-800 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
              <span>Filters {hasActiveFilters && '(Active)'}</span>
            </button>

            <span className="text-xs text-stone-500 font-medium">
              Showing <strong className="text-stone-900 font-mono">{filteredBooks.length}</strong> of{' '}
              <strong className="text-stone-900 font-mono">{books.length}</strong> books
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium ml-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort by dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#0B192C]"
              >
                <option value="featured">Featured Imprints</option>
                <option value="newest">Newest Releases</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode (Grid vs List) */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-[#0B192C] shadow-xs' : 'text-stone-400'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white text-[#0B192C] shadow-xs' : 'text-stone-400'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Body (Sidebar + Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Filters (Desktop + Mobile Drawer) */}
        <aside
          className={`lg:col-span-3 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 ${
            isMobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif text-base font-bold text-[#0B192C] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
              <span>Refine Catalog</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] text-rose-600 hover:underline font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          {/* 1. Category Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              Knowledge Discipline
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center justify-between transition-colors ${
                  !selectedCategory
                    ? 'bg-[#0B192C] text-[#FAF7F2] font-semibold'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>All Disciplines</span>
                <span className="font-mono text-[11px] opacity-75">{books.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center justify-between transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-[#0B192C] text-[#FAF7F2] font-semibold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="font-mono text-[11px] opacity-75">{cat.bookCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Authors Filter */}
          <div className="border-t border-stone-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5 flex items-center justify-between">
              <span>Author / Scholar</span>
              {selectedAuthor !== 'all' && (
                <button
                  onClick={() => setSelectedAuthor('all')}
                  className="text-[10px] text-[#C5A059] hover:underline font-bold"
                >
                  Clear
                </button>
              )}
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedAuthor('all')}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center justify-between transition-colors ${
                  selectedAuthor === 'all'
                    ? 'bg-[#0B192C] text-[#FAF7F2] font-semibold'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>All Authors</span>
                <span className="font-mono text-[11px] opacity-75">{books.length}</span>
              </button>
              {authors.map((auth) => {
                const count = books.filter(
                  (b) =>
                    b.authorId === auth.id ||
                    (b.authorName || '').toLowerCase().includes(auth.name.toLowerCase()) ||
                    (b.coAuthor || '').toLowerCase().includes(auth.name.toLowerCase())
                ).length;
                const isSelected = selectedAuthor === auth.id || selectedAuthor === auth.name;
                return (
                  <button
                    key={auth.id}
                    onClick={() => setSelectedAuthor(isSelected ? 'all' : auth.id)}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#0B192C] text-[#FAF7F2] font-semibold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="truncate">{auth.name}</span>
                    <span className="font-mono text-[11px] opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Format Filter */}
          <div className="border-t border-stone-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              Edition Format
            </h4>
            <div className="grid grid-cols-3 gap-1.5">
              {['all', 'Paperback', 'Hardcover', 'eBook'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`py-1.5 px-2 text-[11px] rounded-lg border font-medium text-center transition-all ${
                    selectedFormat === fmt
                      ? 'border-[#0B192C] bg-[#0B192C] text-white'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {fmt === 'all' ? 'All' : fmt}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Price Filter */}
          <div className="border-t border-stone-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              Price Range
            </h4>
            <div className="space-y-1 text-xs text-stone-600">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under-400', label: 'Under ₹400' },
                { id: '400-600', label: '₹400 - ₹600' },
                { id: '600-800', label: '₹600 - ₹800' },
                { id: '800-plus', label: '₹800 and Above' },
              ].map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 py-1 cursor-pointer hover:text-stone-900"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={priceRange === p.id}
                    onChange={() => setPriceRange(p.id)}
                    className="accent-[#0B192C]"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Minimum Rating Filter */}
          <div className="border-t border-stone-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              Customer Rating
            </h4>
            <div className="space-y-1 text-xs text-stone-600">
              {[4.8, 4.5, 4.0, 0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setMinRating(rate)}
                  className={`w-full py-1 px-2 rounded-lg text-left flex items-center gap-2 ${
                    minRating === rate ? 'bg-stone-100 font-bold text-stone-900' : 'hover:bg-stone-50'
                  }`}
                >
                  {rate > 0 ? (
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(rate) ? 'fill-current' : 'text-stone-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-stone-700 text-xs">{rate}★ & up</span>
                    </div>
                  ) : (
                    <span>All Ratings</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 5. In-Stock Switch */}
          <div className="border-t border-stone-100 pt-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                In Stock Only
              </span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-[#0B192C]"
              />
            </label>
          </div>
        </aside>

        {/* Right Product Grid / List Results */}
        <div className="lg:col-span-9">
          {filteredBooks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-800">
                No matching publications found
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                We could not find any books matching your selected filters. Try clearing your search query or loosening price/category restrictions.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 rounded-xl bg-[#0B192C] text-[#C5A059] text-xs font-bold hover:bg-[#152A4A] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => navigate(`/books/${book.slug}`)}
                  className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-[#C5A059] shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 cursor-pointer"
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-28 sm:w-32 h-40 object-cover rounded-xl border border-stone-300 shadow-sm shrink-0 self-center sm:self-start"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                        <span className="text-[#C5A059] font-semibold uppercase text-[11px]">
                          {book.category}
                        </span>
                        <div className="flex items-center text-amber-500 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="ml-1">{book.rating}</span>
                          <span className="text-stone-400 font-normal ml-1">
                            ({book.reviewCount})
                          </span>
                        </div>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[#0B192C] hover:text-[#C5A059] transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-stone-600 mt-0.5">By {book.authorName}</p>

                      <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {book.formats.map((fmt) => (
                          <span
                            key={fmt}
                            className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-stone-100">
                      <div>
                        <span className="font-mono text-xl font-bold text-[#0B192C]">
                          ₹{book.price}
                        </span>
                        {book.originalPrice > book.price && (
                          <span className="font-mono text-xs text-stone-400 line-through ml-2">
                            ₹{book.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openSampleReader(book);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                        >
                          Read Sample
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(book, 'Paperback', 1);
                          }}
                          className="px-4 py-1.5 rounded-lg bg-[#0B192C] text-[#C5A059] text-xs font-bold hover:bg-[#152A4A]"
                        >
                          Add to Basket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
