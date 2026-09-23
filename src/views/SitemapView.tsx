import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { FileCode, Globe, ArrowRight, ExternalLink } from 'lucide-react';

export const SitemapView: React.FC = () => {
  const { books, authors, blogs, categories, navigate } = useStore();
  const [viewMode, setViewMode] = useState<'visual' | 'xml'>('visual');

  const staticPages = [
    { url: '/', title: 'Home - Sahayak Books', priority: '1.0', changefreq: 'daily' },
    { url: '/books', title: 'Complete Books Catalog', priority: '0.9', changefreq: 'daily' },
    { url: '/authors', title: 'Authors & Creators', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', title: 'About Sahayak Associates', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', title: 'Contact Us', priority: '0.7', changefreq: 'monthly' },
    { url: '/track-order', title: 'Order Tracking', priority: '0.6', changefreq: 'always' },
    { url: '/privacy-policy', title: 'Privacy Policy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms-conditions', title: 'Terms & Conditions', priority: '0.3', changefreq: 'yearly' },
    { url: '/shipping-policy', title: 'Shipping Policy', priority: '0.3', changefreq: 'yearly' },
    { url: '/returns-policy', title: 'Returns & Replacement Policy', priority: '0.3', changefreq: 'yearly' },
  ];

  const bookUrls = books.map((b) => ({
    url: `/books/${b.slug}`,
    title: b.title,
    priority: '0.9',
    changefreq: 'weekly',
  }));

  const authorUrls = authors.map((a) => ({
    url: `/authors/${a.slug}`,
    title: `Author: ${a.name}`,
    priority: '0.7',
    changefreq: 'monthly',
  }));

  const allUrls = [
    ...staticPages,
    ...bookUrls,
    ...authorUrls,
  ];

  const generateXml = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>https://sahayakbooks.com${item.url}</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  };

  return (
    <div id="sitemap-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C5A059]">
            <Globe className="w-4 h-4" />
            <span>Search Engine & Directory Registry</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#0B192C]">
            Sahayak Books Index Sitemap
          </h1>
          <p className="text-xs text-stone-500">
            Total {allUrls.length} crawled canonical URLs and resource directories.
          </p>
        </div>

        <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-300 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'visual' ? 'bg-[#0B192C] text-[#C5A059]' : 'text-stone-700'
            }`}
          >
            Visual Directory
          </button>
          <button
            onClick={() => setViewMode('xml')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'xml' ? 'bg-[#0B192C] text-[#C5A059]' : 'text-stone-700'
            }`}
          >
            Raw XML Code
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-3">
            <h3 className="font-serif text-base font-bold text-[#0B192C]">Core Portal Links</h3>
            <ul className="space-y-2">
              {staticPages.map((p) => (
                <li key={p.url}>
                  <button
                    onClick={() => navigate(p.url)}
                    className="text-stone-700 hover:text-[#C5A059] flex items-center justify-between w-full text-left"
                  >
                    <span>{p.title}</span>
                    <span className="font-mono text-stone-400 text-[10px]">{p.url}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-3">
            <h3 className="font-serif text-base font-bold text-[#0B192C]">Published Books</h3>
            <ul className="space-y-2">
              {bookUrls.map((p) => (
                <li key={p.url}>
                  <button
                    onClick={() => navigate(p.url)}
                    className="text-stone-700 hover:text-[#C5A059] flex items-center justify-between w-full text-left truncate"
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="font-mono text-stone-400 text-[10px] shrink-0 ml-2">
                      Priority: {p.priority}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-3">
            <h3 className="font-serif text-base font-bold text-[#0B192C]">Distinguished Authors</h3>
            <ul className="space-y-2">
              {authorUrls.map((p) => (
                <li key={p.url}>
                  <button
                    onClick={() => navigate(p.url)}
                    className="text-stone-700 hover:text-[#C5A059] flex items-center justify-between w-full text-left truncate"
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="font-mono text-stone-400 text-[10px] shrink-0 ml-2">
                      Priority: {p.priority}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-stone-900 text-emerald-400 p-6 rounded-2xl font-mono text-xs overflow-x-auto border border-stone-800 shadow-xl">
          <pre>{generateXml()}</pre>
        </div>
      )}
    </div>
  );
};
