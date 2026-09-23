import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, BookOpen, Sparkles, Shield, Star, Award, CheckCircle2 } from 'lucide-react';

export const Hero3D: React.FC = () => {
  const { settings, books, navigate, openQuickView, trackEvent } = useStore();
  const heroRef = useRef<HTMLDivElement>(null);

  // Mouse parallax state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePos({ x: 0, y: 0 });
  };

  const featuredBook1 = books[0] || null; // The Art of Strategic Governance
  const featuredBook2 = books[1] || null; // Foundations of Corporate Law
  const featuredBook3 = books[3] || null; // Investment Dictionary

  return (
    <section
      ref={heroRef}
      id="hero-section"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[90vh] bg-gradient-to-b from-[#0B192C] via-[#0D213A] to-[#FAF7F2] text-[#FAF7F2] overflow-hidden flex items-center justify-center pt-8 pb-20 select-none"
    >
      {/* Background ambient gold & midnight glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-[#C5A059]/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#FAF7F2] to-transparent pointer-events-none" />

        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#C5A059_1px,transparent_1px),linear-gradient(to_bottom,#C5A059_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Editorial Text Column */}
        <div className="lg:col-span-7 space-y-6 lg:pr-6 text-center lg:text-left">
          {/* Powerful Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF7F2] leading-[1.15]">
            {settings.heroHeading}
          </h1>

          {/* Supporting Subheading */}
          <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
            {settings.heroSubheading}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button
              id="hero-explore-books-btn"
              onClick={() => {
                trackEvent('click', 'Hero: Explore Books');
                navigate('/books');
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D8B76E] text-[#0B192C] font-bold text-sm sm:text-base hover:brightness-110 shadow-lg shadow-[#C5A059]/25 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{settings.heroPrimaryBtnText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-view-bestsellers-btn"
              onClick={() => {
                trackEvent('click', 'Hero: View Bestsellers');
                navigate('/bestsellers');
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#FAF7F2] border border-white/20 font-semibold text-sm sm:text-base backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>{settings.heroSecondaryBtnText}</span>
            </button>
          </div>

          {/* Customer Rating highlight */}
          <div className="pt-4 flex items-center justify-center lg:justify-start gap-3 text-xs text-stone-400">
            <div className="flex text-[#C5A059]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
              ))}
            </div>
            <span>
              <strong className="text-white font-semibold">4.9/5 Rating</strong> from over 12,000+ legal scholars, civil servants & executives
            </span>
          </div>
        </div>

        {/* Right 3D Interactive Floating Book Composition */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[440px] perspective-1500">
          {/* Layer 1: Background book (Priya Malhotra) */}
          {featuredBook3 && (
            <div
              onClick={() => openQuickView(featuredBook3)}
              style={{
                transform: `translate3d(${mousePos.x * -25 - 90}px, ${mousePos.y * -25 - 40}px, -120px) rotateY(${mousePos.x * 15 - 12}deg) rotateX(${mousePos.y * -15 + 8}deg)`,
                transition: isHovering ? 'transform 0.15s ease-out' : 'transform 0.8s ease-in-out',
              }}
              className="absolute w-44 sm:w-52 h-64 sm:h-76 rounded-xl shadow-2xl overflow-hidden cursor-pointer border border-[#C5A059]/30 transform-style-3d group z-10 hover:scale-105"
            >
              <img
                src={featuredBook3.coverImage}
                alt={featuredBook3.title}
                className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[10px] text-[#C5A059] uppercase tracking-wider font-semibold">
                  Personal Finance
                </span>
                <span className="text-xs font-serif text-white font-bold truncate">
                  {featuredBook3.title}
                </span>
              </div>
            </div>
          )}

          {/* Layer 2: Secondary book */}
          {featuredBook2 && (
            <div
              onClick={() => openQuickView(featuredBook2)}
              style={{
                transform: `translate3d(${mousePos.x * 30 + 80}px, ${mousePos.y * 30 + 40}px, -50px) rotateY(${mousePos.x * -18 + 15}deg) rotateX(${mousePos.y * 18 - 5}deg)`,
                transition: isHovering ? 'transform 0.15s ease-out' : 'transform 0.8s ease-in-out',
              }}
              className="absolute w-48 sm:w-56 h-72 sm:h-80 rounded-xl shadow-2xl overflow-hidden cursor-pointer border border-white/20 transform-style-3d group z-20 hover:scale-105"
            >
              <img
                src={featuredBook2.coverImage}
                alt={featuredBook2.title}
                className="w-full h-full object-cover group-hover:contrast-105 transition-all"
              />
              <div className="absolute top-2 right-2 bg-[#0B192C]/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-[#C5A059] font-bold border border-[#C5A059]/30">
                Life Lessons
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/95 via-[#0B192C]/20 to-transparent p-3.5 flex flex-col justify-end">
                <span className="text-xs font-serif text-white font-bold line-clamp-1">
                  {featuredBook2.title}
                </span>
                <span className="text-[11px] text-stone-300">₹{featuredBook2.price}</span>
              </div>
            </div>
          )}

          {/* Layer 3: Center Primary Focus Book (The Art of Strategic Governance) */}
          {featuredBook1 && (
            <div
              onClick={() => openQuickView(featuredBook1)}
              style={{
                transform: `translate3d(${mousePos.x * 45}px, ${mousePos.y * 45}px, 40px) rotateY(${mousePos.x * -25}deg) rotateX(${mousePos.y * 25}deg)`,
                transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.6s ease-in-out',
              }}
              className="relative w-56 sm:w-64 h-80 sm:h-96 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden cursor-pointer border-2 border-[#C5A059] transform-style-3d group z-30 hover:scale-[1.03]"
            >
              <img
                src={featuredBook1.coverImage}
                alt={featuredBook1.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Gold spine foil sheen */}
              <div className="absolute inset-0 pointer-events-none book-spine-effect" />

              {/* Bestseller Badge */}
              <div className="absolute top-3 left-3 bg-[#C5A059] text-[#0B192C] text-xs font-extrabold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>#1 Bestseller</span>
              </div>

              {/* Bottom detail pill */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/80 to-transparent p-4 flex flex-col justify-end text-left">
                <div className="text-[11px] text-[#C5A059] font-medium tracking-wide uppercase">
                  Featured Masterpiece
                </div>
                <div className="text-sm sm:text-base font-serif font-bold text-white line-clamp-1">
                  {featuredBook1.title}
                </div>
                <div className="text-xs text-stone-300 mt-0.5 flex items-center justify-between">
                  <span>{featuredBook1.authorName}</span>
                  <span className="font-mono text-[#C5A059] font-bold">₹{featuredBook1.price}</span>
                </div>
              </div>
            </div>
          )}

          {/* Floating Bookmark & Quotes Accent */}
          <div
            style={{
              transform: `translate3d(${mousePos.x * -40 + 120}px, ${mousePos.y * -40 - 110}px, 80px)`,
              transition: isHovering ? 'transform 0.15s ease-out' : 'transform 0.9s ease-in-out',
            }}
            className="absolute -top-6 right-2 sm:right-4 z-40 bg-[#0B192C]/90 backdrop-blur-md border border-[#C5A059]/50 rounded-xl p-3 shadow-xl max-w-[200px] pointer-events-none hidden sm:block"
          >
            <div className="flex items-center gap-1 text-[#C5A059] text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Editorial Selection</span>
            </div>
            <p className="text-[11px] italic text-stone-200 leading-snug">
              “Knowledge is not a destination, but a sacred covenant of leadership.”
            </p>
          </div>

          {/* Floating Gold Particles Decoration */}
          <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full border border-[#C5A059]/40 bg-[#C5A059]/10 animate-pulse pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
