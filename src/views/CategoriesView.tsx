import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';
import {
  Layers,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Scale,
  Landmark,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Users,
  Compass,
} from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { categories, books, navigate } = useStore();

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'law-justice':
        return Scale;
      case 'education-academics':
        return GraduationCap;
      case 'business-corporate':
        return Briefcase;
      case 'finance-economics':
        return TrendingUp;
      case 'public-policy-governance':
        return Landmark;
      case 'leadership-management':
        return Users;
      default:
        return BookOpen;
    }
  };

  return (
    <div id="categories-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A059]">
          <Layers className="w-4 h-4" />
          <span>Intellectual Classifications</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B192C]">
          Browse by Subject Discipline
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Navigate our specialized publishing catalogue organized into rigorous professional and academic categories.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const IconC = getCategoryIcon(cat.slug);
          const bookCount = books.filter((b) => b.categorySlug === cat.slug || b.category === cat.name).length;

          return (
            <div
              key={cat.id}
              onClick={() => navigate(`/categories/${cat.slug}`)}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 hover:border-[#C5A059] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 group-hover:bg-[#0B192C] text-[#0B192C] group-hover:text-[#C5A059] flex items-center justify-center transition-colors shadow-2xs">
                  <IconC className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#0B192C] group-hover:text-[#C5A059] transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-stone-700">
                  {bookCount} Volume{bookCount !== 1 ? 's' : ''} in Catalog
                </span>
                <span className="text-[#0B192C] group-hover:text-[#C5A059] font-bold flex items-center gap-1">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CategoryDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const { categories, books, navigate } = useStore();

  const category = categories.find((c) => c.slug === slug) || categories[0];
  const categoryBooks = books.filter(
    (b) => b.categorySlug === category.slug || b.category === category.name
  );

  return (
    <div id="category-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <button onClick={() => navigate('/')} className="hover:text-[#0B192C]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigate('/categories')} className="hover:text-[#0B192C]">
          Disciplines
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-800 font-bold">{category.name}</span>
      </nav>

      {/* Hero */}
      <div className="bg-[#0B192C] text-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#C5A059]/40 shadow-xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">
          Scholarly Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          {category.name}
        </h1>
        <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
          {category.description}
        </p>
        <div className="pt-2">
          <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-mono">
            {categoryBooks.length} Publications Available
          </span>
        </div>
      </div>

      {/* Category Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoryBooks.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </div>
  );
};
