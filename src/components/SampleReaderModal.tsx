import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ShoppingBag,
  Sliders,
  Type,
  Sun,
  Moon,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';

export const SampleReaderModal: React.FC = () => {
  const { sampleReaderBook, closeSampleReader, addToCart, navigate } = useStore();

  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [readerTheme, setReaderTheme] = useState<'parchment' | 'ivory' | 'dark'>('parchment');

  if (!sampleReaderBook) return null;

  const book = sampleReaderBook;
  const samplePages = book.samplePages && book.samplePages.length > 0 ? book.samplePages : [
    {
      pageNumber: 1,
      chapterTitle: 'Chapter 1: Foundations & Core Principles',
      title: 'Prologue & Executive Summary',
      content: [
        `Welcome to the preview excerpt of "${book.title}", published under the scholarly imprint of Sahayak Associates.`,
        'Every disciplined reader recognizes that enduring knowledge requires deep focus, structured inquiry, and practical application.',
        book.description,
        'In the subsequent chapters, the author meticulously breaks down historical precedents, strategic risk matrices, and case analyses drawn directly from institutional practice.',
      ],
    },
    {
      pageNumber: 2,
      chapterTitle: 'Chapter 1: Foundations & Core Principles',
      title: 'Section 1.2: The Core Analytical Framework',
      content: [
        'To navigate volatility, modern practitioners cannot rely solely on historical intuitions or static playbooks.',
        'The Sahayak Framework introduces three interdependent pillars: First, structural clarity; second, moral responsibility in executive discretion; third, continuous operational refinement.',
        'When these three dimensions are integrated into institutional memory, resilience emerges naturally.',
      ],
    },
  ];

  const totalPages = samplePages.length;
  const activePage = samplePages[currentPage] || samplePages[0];

  const themeClasses = {
    parchment: 'bg-[#F4ECE1] text-[#2C221E] border-[#D8C7B5]',
    ivory: 'bg-[#FAF7F2] text-[#1A1A1A] border-[#E8E1D5]',
    dark: 'bg-[#111827] text-[#E5E7EB] border-[#374151]',
  };

  const textSizes = {
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-loose',
    xlarge: 'text-lg sm:text-xl leading-loose',
  };

  const handleBuyNow = () => {
    addToCart(book, 'Hardcover', 1);
    closeSampleReader();
    navigate('/checkout');
  };

  return (
    <div
      id="sample-reader-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={closeSampleReader}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0B192C] rounded-3xl shadow-2xl overflow-hidden border border-[#C5A059]/40 flex flex-col h-[90vh] max-h-[850px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="bg-[#061120] text-[#FAF7F2] px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] truncate">
                Digital Sample Excerpt • Sahayak Reader
              </div>
              <h3 className="font-serif text-xs sm:text-sm font-bold text-white truncate">
                {book.title}
              </h3>
            </div>
          </div>

          {/* Reader Preferences & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Font Size Selector */}
            <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 rounded font-serif ${
                  fontSize === 'normal' ? 'bg-[#C5A059] text-[#0B192C] font-bold' : 'text-stone-300'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded font-serif text-sm ${
                  fontSize === 'large' ? 'bg-[#C5A059] text-[#0B192C] font-bold' : 'text-stone-300'
                }`}
              >
                A+
              </button>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center bg-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setReaderTheme('parchment')}
                className={`p-1.5 rounded ${
                  readerTheme === 'parchment' ? 'bg-[#C5A059] text-[#0B192C]' : 'text-stone-300'
                }`}
                title="Parchment Theme"
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReaderTheme('ivory')}
                className={`p-1.5 rounded ${
                  readerTheme === 'ivory' ? 'bg-[#C5A059] text-[#0B192C]' : 'text-stone-300'
                }`}
                title="Ivory Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReaderTheme('dark')}
                className={`p-1.5 rounded ${
                  readerTheme === 'dark' ? 'bg-[#C5A059] text-[#0B192C]' : 'text-stone-300'
                }`}
                title="Dark Reading Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              id="close-reader-btn"
              onClick={closeSampleReader}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Center Canvas (Simulated Editorial Book Spread) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-[#071322]">
          <div
            className={`w-full max-w-2xl min-h-[480px] p-6 sm:p-10 rounded-2xl shadow-2xl border transition-all duration-300 flex flex-col justify-between ${themeClasses[readerTheme]}`}
          >
            <div>
              {/* Chapter Header */}
              <div className="border-b border-current/15 pb-4 mb-6 flex items-center justify-between text-xs opacity-75">
                <span className="font-semibold tracking-wider uppercase font-mono">
                  {activePage.chapterTitle}
                </span>
                <span className="font-serif italic">{book.authorName}</span>
              </div>

              {/* Section Title */}
              <h2 className="font-serif text-xl sm:text-2xl font-bold mb-5 tracking-tight text-center">
                {activePage.title}
              </h2>

              {/* Excerpt Body Paragraphs */}
              <div className={`space-y-4 font-serif ${textSizes[fontSize]}`}>
                {activePage.content.map((para, idx) => (
                  <p key={idx} className="first-letter:text-2xl first-letter:font-bold">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Page Number Footer */}
            <div className="pt-8 mt-6 border-t border-current/15 flex items-center justify-between text-xs opacity-70">
              <span>Sahayak Associates Publishing</span>
              <span className="font-mono font-bold">
                Page {activePage.pageNumber} of {totalPages} (Sample)
              </span>
              <span>ISBN: {book.isbn}</span>
            </div>
          </div>
        </div>

        {/* Bottom Pagination & Buy Action Bar */}
        <div className="bg-[#061120] px-4 sm:px-6 py-3.5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Pagination Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </button>

            <span className="text-xs text-stone-400 font-mono">
              Sample Page {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1"
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Upsell to Purchase Full Edition */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="hidden md:block text-right">
              <span className="text-[11px] text-stone-400 block">Enjoying this chapter?</span>
              <span className="text-xs font-bold text-[#C5A059] font-mono">
                Full Edition: ₹{book.price}
              </span>
            </div>

            <button
              id="reader-purchase-btn"
              onClick={handleBuyNow}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D8B76E] text-[#0B192C] text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg hover:brightness-110 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Purchase Full Book</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
