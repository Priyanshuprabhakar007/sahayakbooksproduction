import React from 'react';
import { useStore } from '../context/StoreContext';
import { Hero3D } from '../components/Hero3D';
import { BookCard } from '../components/BookCard';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Award,
  ShieldCheck,
  TrendingUp,
  Star,
  Quote,
  Users,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    books,
    authors,
    reviews,
    settings,
    navigate,
    openSampleReader,
    addToCart,
    trackEvent,
  } = useStore();

  const featuredBooks = books.filter((b) => b.isFeatured);

  // Primary Editorial Spotlight Book
  const spotlightBook =
    books.find((b) => b.id === settings.featuredEditorialBookId) || books[0];

  return (
    <div id="home-page-container" className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION (Interactive 3D Book Experience) */}
      <Hero3D />

      {/* 2. FEATURED BOOKS SHOWCASE */}
      <section id="featured-books-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Imprints</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B192C]">
              Featured Books & Publications
            </h2>
            <p className="text-stone-600 text-sm mt-1 max-w-xl">
              Distinguished works rigorously peer-reviewed and recommended by leading jurists, economists, and civil service mentors.
            </p>
          </div>
        </div>

        {/* Books Grid with 3D Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.slice(0, 8).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            id="view-all-books-btn"
            onClick={() => {
              trackEvent('click', 'Home: View Complete Catalog');
              navigate('/books');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#0B192C] text-[#0B192C] font-bold text-xs sm:text-sm hover:bg-[#0B192C] hover:text-[#FAF7F2] transition-colors shadow-sm cursor-pointer"
          >
            <span>Explore All {books.length} Published Books</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. FEATURED EDITORIAL BOOK SPOTLIGHT */}
      {spotlightBook && (
        <section id="editorial-spotlight-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#0B192C] to-[#061120] text-[#FAF7F2] rounded-3xl p-8 sm:p-12 border-2 border-[#C5A059]/40 shadow-2xl overflow-hidden relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Background gold quote */}
            <Quote className="absolute -top-6 -right-6 w-48 h-48 text-white/5 pointer-events-none" />

            {/* Left: Book 3D Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                onClick={() => navigate(`/books/${spotlightBook.slug}`)}
                className="relative w-60 sm:w-72 h-84 sm:h-96 rounded-2xl shadow-2xl overflow-hidden border-2 border-[#C5A059] cursor-pointer transform hover:scale-105 transition-transform duration-300 group"
              >
                <img
                  src={spotlightBook.coverImage}
                  alt={spotlightBook.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none book-spine-effect" />
                <div className="absolute top-3 left-3 bg-[#C5A059] text-[#0B192C] text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                  Editor's Choice
                </div>
              </div>
            </div>

            {/* Right: Rich Editorial Synopsis */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C5A059] uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Landmark Publication of the Year</span>
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {spotlightBook.title}
                </h3>
                {spotlightBook.subtitle && (
                  <p className="text-stone-300 text-sm sm:text-base mt-2 font-medium">
                    {spotlightBook.subtitle}
                  </p>
                )}
                <p className="text-xs text-[#C5A059] mt-2 font-medium">
                  By {spotlightBook.authorName} ({spotlightBook.authorRole})
                </p>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {spotlightBook.description}
              </p>

              {/* Key Learning Points Checklist */}
              {spotlightBook.whatYouWillLearn && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">
                    Key Learning Frameworks:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
                    {spotlightBook.whatYouWillLearn.slice(0, 4).map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action and Pricing */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
                <div>
                  <span className="font-mono text-3xl font-bold text-white">₹{spotlightBook.price}</span>
                  <span className="font-mono text-sm text-stone-400 line-through ml-2">
                    ₹{spotlightBook.originalPrice}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => addToCart(spotlightBook, 'Hardcover', 1)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D8B76E] text-[#0B192C] font-bold text-xs sm:text-sm hover:brightness-110 transition-all shadow-lg cursor-pointer"
                  >
                    Purchase Deluxe Hardcover
                  </button>
                  <button
                    onClick={() => openSampleReader(spotlightBook)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#C5A059]" />
                    <span>Read Sample Excerpt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. WHY READ SAHAYAK BOOKS? */}
      <section id="why-sahayak-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
            The Publishing Creed
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B192C] mt-1">
            Why Read Sahayak Books?
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-2">
            Every manuscript we publish adheres to the highest standards of academic rigor, clarity of expression, and real-world applicability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            {
              icon: Award,
              title: 'Expertly Written',
              desc: 'Authored exclusively by senior jurists, civil servants, policy deans, and certified master coaches.',
            },
            {
              icon: TrendingUp,
              title: 'Practical Knowledge',
              desc: 'Actionable decision models, drafting templates, and case studies rather than empty theory.',
            },
            {
              icon: BookOpen,
              title: 'Quality Publishing',
              desc: 'Luxury hardcover bindings, acid-free paper, gold foil stamping, and flawless digital eBook formats.',
            },
            {
              icon: ShieldCheck,
              title: 'Trusted Information',
              desc: 'Every statutory clause and macroeconomic chart is verified against current legal and central bank data.',
            },
            {
              icon: Users,
              title: 'Reader-Focused',
              desc: 'Designed with margin annotations, chapter summaries, and dedicated digital reader companions.',
            },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0B192C] text-[#C5A059] flex items-center justify-center mb-4 shadow-sm">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#0B192C] mb-2">{item.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. AUTHOR SPOTLIGHT */}
      <section id="author-spotlight-section" className="bg-[#FAF7F2] py-12 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                Meet Our Faculty & Scholars
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B192C] mt-1">
                Distinguished Authors
              </h2>
            </div>
            <button
              onClick={() => navigate('/authors')}
              className="text-xs font-bold text-[#0B192C] hover:text-[#C5A059] flex items-center gap-1"
            >
              <span>View All Authors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {authors.slice(0, 4).map((author) => (
              <div
                key={author.id}
                onClick={() => navigate(`/authors/${author.slug}`)}
                className="group bg-white rounded-2xl p-6 border border-stone-200/80 hover:border-[#C5A059] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-[#C5A059] shadow-md group-hover:scale-105 transition-transform">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0B192C] group-hover:text-[#C5A059] transition-colors">
                    {author.name}
                  </h3>
                  <p className="text-xs text-[#C5A059] font-medium mt-0.5">{author.title}</p>
                  <p className="text-xs text-stone-600 mt-3 line-clamp-3 leading-relaxed">
                    {author.bio}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="font-mono font-semibold text-stone-800">
                    {author.publishedBookCount} Published Books
                  </span>
                  <span className="text-[#0B192C] group-hover:text-[#C5A059] font-bold">
                    View Works →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. READER REVIEWS & TESTIMONIALS */}
      <section id="reader-reviews-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
            Patron Reflections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B192C] mt-1">
            Voices from Our Readers
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-2">
            Verified feedback from judicial officers, administrative scholars, university professors, and corporate executives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.filter((r) => r.featured).slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-sm flex flex-col justify-between relative"
            >
              <div>
                {/* Rating stars */}
                <div className="flex text-amber-500 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <h4 className="font-serif text-base font-bold text-[#0B192C] mb-2">
                  “{rev.title}”
                </h4>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-stone-100 flex items-center gap-3">
                {rev.userAvatar ? (
                  <img
                    src={rev.userAvatar}
                    alt={rev.userName}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#0B192C] text-[#C5A059] font-bold flex items-center justify-center text-xs">
                    {rev.userName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-[#0B192C]">{rev.userName}</div>
                  <div className="text-[11px] text-[#C5A059] font-medium truncate max-w-[200px]">
                    Purchased: {rev.bookTitle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
