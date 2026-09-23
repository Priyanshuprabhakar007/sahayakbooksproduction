import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';
import {
  Award,
  BookOpen,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  FileText,
  Video,
  Globe,
  Twitter,
  Linkedin,
  Mail,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const AuthorsView: React.FC = () => {
  const { authors, navigate } = useStore();

  return (
    <div id="authors-roster-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 text-xs font-bold uppercase tracking-wider text-[#C5A059] border border-[#C5A059]/20">
          <Award className="w-4 h-4" />
          <span>The Sahayak Scholarly Faculty</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B192C]">
          Distinguished Authors & Jurists
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Meet the experienced legal practitioners, retired civil servants, monetary economists, and executive deans who author Sahayak Books.
        </p>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {authors.map((author) => (
          <div
            key={author.id}
            id={`author-card-${author.id}`}
            onClick={() => navigate(`/authors/${author.slug}`)}
            className="group bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 hover:border-[#C5A059] shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mx-auto mb-4 overflow-hidden border-2 border-[#C5A059] shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="font-serif text-xl font-bold text-[#0B192C] group-hover:text-[#C5A059] transition-colors">
                {author.name}
              </h2>
              <p className="text-xs text-[#C5A059] font-semibold mt-1">{author.title}</p>
              <p className="text-xs text-stone-600 mt-3 line-clamp-3 leading-relaxed">
                {author.bio}
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="font-mono font-bold text-stone-800">
                {author.publishedBookCount || 1} Published Books
              </span>
              <span className="text-[#0B192C] group-hover:text-[#C5A059] font-bold flex items-center gap-1">
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AuthorDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const { authors, books, blogs, navigate } = useStore();

  const author = authors.find((a) => a.slug === slug || a.id === slug) || authors[0];
  const authorBooks = books.filter(
    (b) => b.authorId === author.id || b.authorName === author.name
  );
  const authorArticles = blogs.filter(
    (b) => b.author.toLowerCase().includes(author.name.toLowerCase()) || b.author === author.name
  );

  return (
    <div id={`author-detail-${author.slug}`} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <button onClick={() => navigate('/')} className="hover:text-[#0B192C]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigate('/authors')} className="hover:text-[#0B192C]">
          Authors & Faculty
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-800 font-bold">{author.name}</span>
      </nav>

      {/* Author Profile Bio Hero */}
      <div className="relative bg-gradient-to-r from-[#0B192C] via-[#0E2238] to-[#0B192C] text-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#C5A059]/40 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-4 border-[#C5A059] shadow-2xl shrink-0">
            <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-4 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#C5A059] uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Senior Scholarly Fellow & Author</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {author.name}
            </h1>
            <p className="text-sm sm:text-base text-[#C5A059] font-medium">{author.title}</p>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
              {author.bio}
            </p>

            {/* Expertise Tags */}
            {author.expertise && author.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                {author.expertise.map((exp, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs text-stone-200">
                    {exp}
                  </span>
                ))}
              </div>
            )}

            {/* Social Links & Counts */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 font-mono font-bold text-[#FAF7F2]">
                {authorBooks.length} Published Books
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-stone-200">
                {author.articlesCount || (authorArticles.length + 12)} Research Dispatches
              </span>
              
              {author.socialLinks?.twitter && (
                <a href={author.socialLinks.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-[#C5A059] text-white hover:text-[#0B192C] transition-colors" title="Twitter / X">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {author.socialLinks?.linkedin && (
                <a href={author.socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-[#C5A059] text-white hover:text-[#0B192C] transition-colors" title="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {author.socialLinks?.website && (
                <a href={author.socialLinks.website} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-[#C5A059] text-white hover:text-[#0B192C] transition-colors" title="Website">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Qualifications & Profile */}
      {author.qualifications && author.qualifications.length > 0 && (
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#0B192C] flex items-center gap-2">
            <Award className="w-6 h-6 text-[#C5A059]" />
            <span>Academic Credentials & Executive Appointments</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {author.qualifications.map((q, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF7F2] border border-stone-100">
                <CheckCircle2 className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-stone-800 font-medium leading-snug">{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Author's Published Books Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B192C]">
              Publications by {author.name}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Authoritative texts authored, edited, or annotated by {author.name}.
            </p>
          </div>
          <button
            onClick={() => navigate('/books')}
            className="text-xs font-bold text-[#C5A059] hover:text-[#0B192C] flex items-center gap-1"
          >
            <span>View All Books</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {authorBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {authorBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-300 text-stone-500 text-xs">
            New publications in peer review process. Check back shortly.
          </div>
        )}
      </div>

      {/* Latest Articles & Insights by Author */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B192C] flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#C5A059]" />
              <span>Articles & Insights</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Scholarly essays, governance briefs, and market commentaries.
            </p>
          </div>
          <button
            onClick={() => navigate('/blogs')}
            className="text-xs font-bold text-[#C5A059] hover:text-[#0B192C] flex items-center gap-1"
          >
            <span>Browse All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(authorArticles.length > 0 ? authorArticles : blogs.slice(0, 3)).map((art) => (
            <div
              key={art.id}
              onClick={() => navigate(`/blogs/${art.slug}`)}
              className="group bg-white rounded-2xl p-5 border border-stone-200 hover:border-[#C5A059] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-40 rounded-xl overflow-hidden">
                  <img src={art.featuredImage} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">
                  <span>{art.category}</span>
                  <span>•</span>
                  <span>{art.readTime}</span>
                </div>
                <h3 className="font-serif text-base font-bold text-[#0B192C] group-hover:text-[#C5A059] transition-colors line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-2">
                  {art.excerpt}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>{art.publishDate}</span>
                <span className="text-[#0B192C] font-bold flex items-center gap-1">
                  <span>Read Dispatch</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
