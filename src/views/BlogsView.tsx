import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ChevronRight,
  Share2,
  Tag,
  Check,
  Send,
} from 'lucide-react';

export const BlogsView: React.FC = () => {
  const { blogs, navigate } = useStore();
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const allTags = ['All', 'Governance', 'Corporate Law', 'Banking', 'Economics', 'Executive'];

  const filteredBlogs =
    selectedTag === 'All'
      ? blogs
      : blogs.filter((b) => b.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase())));

  const featuredBlog = blogs[0];

  return (
    <div id="blogs-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A059]">
          <BookOpen className="w-4 h-4" />
          <span>The Sahayak Think-Tank</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B192C]">
          Insights & Scholarly Dispatches
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Critical essays, statutory breakdowns, monetary policy analyses, and executive leadership frameworks published by Sahayak Fellows.
        </p>
      </div>

      {/* Featured Editorial Article */}
      {featuredBlog && (
        <div
          onClick={() => navigate(`/blogs/${featuredBlog.slug}`)}
          className="bg-[#0B192C] text-[#FAF7F2] rounded-3xl overflow-hidden border border-[#C5A059]/40 shadow-2xl grid grid-cols-1 lg:grid-cols-12 cursor-pointer group"
        >
          <div className="lg:col-span-6 overflow-hidden">
            <img
              src={featuredBlog.featuredImage}
              alt={featuredBlog.title}
              className="w-full h-full min-h-[320px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-[#C5A059]">
                <span className="uppercase font-bold tracking-wider">{featuredBlog.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredBlog.readTime}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white group-hover:text-[#C5A059] transition-colors leading-tight">
                {featuredBlog.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed line-clamp-3">
                {featuredBlog.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-stone-400">
              <span>By {featuredBlog.author} • {featuredBlog.publishDate}</span>
              <span className="text-[#C5A059] font-bold flex items-center gap-1">
                <span>Read Full Essay</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tags Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedTag === tag
                ? 'bg-[#0B192C] text-[#FAF7F2] shadow-sm'
                : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredBlogs.map((blog) => (
          <article
            key={blog.id}
            onClick={() => navigate(`/blogs/${blog.slug}`)}
            className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="aspect-[16/10] w-full overflow-hidden bg-stone-100">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="text-[#C5A059] font-semibold uppercase text-[11px]">
                    {blog.category}
                  </span>
                  <span>{blog.readTime}</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#0B192C] group-hover:text-[#C5A059] transition-colors leading-snug line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 flex items-center justify-between text-xs border-t border-stone-100 text-stone-500">
              <span>By {blog.author}</span>
              <span className="text-[#0B192C] group-hover:text-[#C5A059] font-bold">
                Read Article →
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export const BlogDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const { blogs, books, navigate } = useStore();
  const [copied, setCopied] = useState(false);

  const blog = blogs.find((b) => b.slug === slug) || blogs[0];
  const relatedBook = books.find((b) => b.category.includes('Governance') || b.id === blog.relatedBookId) || books[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="blog-detail-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <button onClick={() => navigate('/')} className="hover:text-[#0B192C]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigate('/blogs')} className="hover:text-[#0B192C]">
          Articles
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-800 font-bold truncate max-w-xs">{blog.title}</span>
      </nav>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-xs text-[#C5A059] font-bold uppercase tracking-wider">
          <span>{blog.category}</span>
          <span>•</span>
          <span className="flex items-center gap-1 font-mono text-stone-500 font-normal">
            <Clock className="w-3.5 h-3.5" />
            {blog.readTime}
          </span>
          <span>•</span>
          <span className="text-stone-500 font-normal">{blog.publishDate}</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B192C] leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center justify-between py-4 border-y border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0B192C] text-[#C5A059] font-bold flex items-center justify-center text-sm">
              {blog.author.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">{blog.author}</div>
              <div className="text-[11px] text-stone-500">Senior Research Fellow, Sahayak Associates</div>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share Essay'}</span>
          </button>
        </div>
      </div>

      {/* Featured Banner Image */}
      <div className="w-full aspect-[16/9] rounded-3xl overflow-hidden border border-stone-200 shadow-md">
        <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
      </div>

      {/* Article Body Content */}
      <div className="prose prose-stone max-w-none text-stone-800 font-serif leading-relaxed text-base sm:text-lg space-y-6">
        <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-[#0B192C] first-letter:mr-2">
          {blog.excerpt}
        </p>

        <p>
          Throughout institutional history, the balance between discretionary executive power and structured statutory governance has represented the foundational challenge of resilient organizations. As Indian markets globalize and regulatory oversight intensifies, reliance on ad-hoc leadership intuition is no longer viable.
        </p>

        <h3 className="font-serif text-2xl font-bold text-[#0B192C] pt-4">
          The Three Structural Pillars of Modern Institutional Resilience
        </h3>

        <p>
          First, structural transparency mandates that internal checks operate independently of operational incentives. When compliance reviews are embedded within reporting structures rather than isolated in administrative silos, anomalies are diagnosed before escalating to statutory infractions.
        </p>

        <blockquote className="border-l-4 border-[#C5A059] pl-4 italic text-[#0B192C] bg-stone-50 py-3 rounded-r-xl">
          “Enduring authority is not established through the arbitrary display of power, but through the rigorous stewardship of institutional trust.”
        </blockquote>

        <p>
          Second, continuous professional education must become an institutional imperative rather than an annual compliance exercise. Senior administrators and corporate officers who study updated case compendiums maintain higher clarity during volatile regulatory transitions.
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-stone-200">
        <span className="text-xs font-bold text-stone-500 mr-2 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5" />
          Tags:
        </span>
        {blog.tags.map((t) => (
          <span key={t} className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
            #{t}
          </span>
        ))}
      </div>

      {/* Embedded Related Book CTA */}
      {relatedBook && (
        <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border-2 border-[#C5A059]/50 shadow-md flex flex-col sm:flex-row items-center gap-6">
          <img
            src={relatedBook.coverImage}
            alt={relatedBook.title}
            className="w-24 h-36 object-cover rounded-xl shadow-md border shrink-0"
          />
          <div className="space-y-2 flex-1 text-center sm:text-left">
            <span className="text-[11px] uppercase font-bold text-[#C5A059] tracking-wider">
              Recommended Companion Book
            </span>
            <h4 className="font-serif text-xl font-bold text-[#0B192C]">
              {relatedBook.title}
            </h4>
            <p className="text-xs text-stone-600 line-clamp-2">{relatedBook.description}</p>
            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
              <span className="font-mono font-bold text-sm text-[#0B192C]">₹{relatedBook.price}</span>
              <button
                onClick={() => navigate(`/books/${relatedBook.slug}`)}
                className="px-4 py-2 bg-[#0B192C] text-[#C5A059] text-xs font-bold rounded-xl hover:bg-[#152A4A]"
              >
                View Full Book Dossier →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
