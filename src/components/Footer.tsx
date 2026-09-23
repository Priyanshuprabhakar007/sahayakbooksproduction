import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  Heart,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, categories, subscribeNewsletter, navigate, trackEvent, ensureAdminAccess } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = (newsletterEmail || '').trim();
    if (cleanEmail) {
      const res = subscribeNewsletter(cleanEmail, 'Website Footer');
      setNewsletterMsg({ success: res.success, text: res.message });
      if (res.success) setNewsletterEmail('');
      setTimeout(() => setNewsletterMsg(null), 5000);
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <footer id="main-footer" className="bg-[#061120] text-stone-300 border-t border-[#C5A059]/20 pt-16 pb-8">
      {/* Top Newsletter Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gradient-to-r from-[#0B192C] via-[#0E2238] to-[#0B192C] rounded-3xl p-8 sm:p-12 border border-[#C5A059]/30 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 text-[#C5A059] text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>The Sahayak Dispatches</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              New Books. New Ideas. Delivered.
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm">
              Subscribe to receive weekly scholarly essays, new release announcements, author dialogues, and exclusive patron discounts directly to your inbox.
            </p>
          </div>

          <div className="w-full lg:w-auto min-w-[320px] max-w-md">
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your academic / work email..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#C5A059]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#C5A059] to-[#D8B76E] text-[#0B192C] font-bold text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            {newsletterMsg && (
              <p
                className={`text-xs mt-2 text-center sm:text-left font-medium ${
                  newsletterMsg.success ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {newsletterMsg.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10 text-xs">
        {/* Column 1: Brand & Legacy */}
        <div className="lg:col-span-2 space-y-4">
          {(() => {
            const activeFooterLogo =
              settings.footerLogo || settings.mainLogo || settings.logoUrl || settings.darkLogo || '';
            const logoHeight = settings.logoHeight || 40;
            const logoPadding = settings.logoPadding || 0;

            return (
              <div
                onClick={() => handleNavClick('/')}
                className="flex items-center gap-3 cursor-pointer group select-none"
              >
                {activeFooterLogo ? (
                  <img
                    src={activeFooterLogo}
                    alt={settings.brandName}
                    style={{
                      maxHeight: `${Math.max(28, Math.min(logoHeight, 52))}px`,
                      padding: `${logoPadding}px`,
                    }}
                    className="w-auto max-w-[180px] object-contain group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#C5A059] p-0.5 shadow-md shrink-0">
                    <div className="w-full h-full bg-[#0B192C] rounded-[7px] flex items-center justify-center text-[#C5A059]">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>
                )}
                <div>
                  <span className="font-brand-display text-2xl font-bold tracking-wider text-[#FAF7F2] group-hover:text-[#C5A059] transition-colors">
                    {settings.brandName.toUpperCase()}
                  </span>
                  <p className="text-[10px] tracking-widest uppercase text-[#C5A059] font-medium">
                    Powered by {settings.parentCompany}
                  </p>
                </div>
              </div>
            );
          })()}

          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
            “{settings.tagline}” — Founded to champion rigorous, practical, and transformative publications across Indian governance, constitutional law, monetary economics, and executive leadership.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-2">
            {['Twitter', 'LinkedIn', 'YouTube', 'Instagram'].map((network) => (
              <a
                key={network}
                href={`https://${network.toLowerCase()}.com`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#C5A059]/20 hover:text-[#C5A059] text-stone-300 flex items-center justify-center border border-white/10 transition-colors"
                title={network}
              >
                <span className="text-[10px] font-bold">{network.slice(0, 2)}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Bookstore & Publishing Navigation */}
        <div className="space-y-3">
          <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
            Explore Platform
          </h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleNavClick('/books')}
                className="hover:text-[#C5A059] transition-colors text-stone-400 text-left"
              >
                All Published Books
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('/authors')}
                className="hover:text-[#C5A059] transition-colors text-stone-400 text-left"
              >
                Distinguished Authors
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('/about')}
                className="hover:text-[#C5A059] transition-colors text-stone-400 text-left"
              >
                About Sahayak Associates
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('/contact')}
                className="hover:text-[#C5A059] transition-colors text-stone-400 text-left"
              >
                Contact Advisory Desk
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('/track-order')}
                className="hover:text-[#C5A059] transition-colors text-stone-400 text-left"
              >
                Track Shipment
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('/dashboard')}
                className="hover:text-[#C5A059] transition-colors text-stone-400 text-left"
              >
                Reader Dashboard
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Administrative Headquarters */}
        <div className="space-y-3">
          <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
            Headquarters
          </h3>
          <div className="space-y-2.5 text-stone-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <p className="leading-snug">{settings.officeAddress}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
              <a href={`tel:${settings.contactPhone}`} className="hover:text-white">
                {settings.contactPhone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-white truncate">
                {settings.contactEmail}
              </a>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <p>{settings.businessHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Policies, Copyright & Admin link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <div>
          © {new Date().getFullYear()} <strong className="text-stone-300">Sahayak Books</strong>. A division of <strong>Sahayak Associates</strong>. All rights reserved.
        </div>

        {/* Policy Links */}
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => handleNavClick('/privacy')} className="hover:text-[#C5A059] transition-colors">
            Privacy Policy
          </button>
          <span>•</span>
          <button onClick={() => handleNavClick('/terms')} className="hover:text-[#C5A059] transition-colors">
            Terms & Conditions
          </button>
          <span>•</span>
          <button onClick={() => handleNavClick('/shipping-policy')} className="hover:text-[#C5A059] transition-colors">
            Shipping & Logistics
          </button>
          <span>•</span>
          <button onClick={() => handleNavClick('/return-policy')} className="hover:text-[#C5A059] transition-colors">
            Returns & Refund
          </button>
          <span>•</span>
          <button
            onClick={() => handleNavClick('/sitemap')}
            className="hover:text-[#C5A059] transition-colors font-mono text-[11px]"
          >
            sitemap.xml
          </button>
          <span>•</span>
          <button
            onClick={() => {
              ensureAdminAccess();
              handleNavClick('/admin');
            }}
            className="text-[#C5A059] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Center</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
