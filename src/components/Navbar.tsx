import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    settings,
    cart,
    wishlist,
    currentUser,
    openAuthModal,
    logout,
    setIsCartOpen,
    setIsWishlistOpen,
    currentPath,
    navigate,
    books,
    trackEvent,
    ensureAdminAccess,
    hasAdminAccess,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartCount = (cart || []).reduce((acc, item) => acc + (item.quantity || 0), 0);

  const cleanNavSearch = (searchQuery || '').trim();
  const filteredBooks = cleanNavSearch
    ? (books || []).filter(
        (b) =>
          (b.title || '').toLowerCase().includes(cleanNavSearch.toLowerCase()) ||
          (b.authorName || '').toLowerCase().includes(cleanNavSearch.toLowerCase()) ||
          (b.category || '').toLowerCase().includes(cleanNavSearch.toLowerCase()) ||
          (b.isbn || '').toLowerCase().includes(cleanNavSearch.toLowerCase()) ||
          (b.tags || []).some((t) => (t || '').toLowerCase().includes(cleanNavSearch.toLowerCase()))
      )
    : [];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Books', path: '/books' },
    { label: 'Authors', path: '/authors' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      {settings.announcementBarEnabled && settings.announcementBarText && (
        <div id="announcement-bar" className="bg-[#0B192C] text-[#FAF7F2] py-2 px-4 text-xs font-medium tracking-wide text-center border-b border-[#C5A059]/20 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
          <span>{settings.announcementBarText}</span>
        </div>
      )}

      {/* Main Sticky Header */}
      <header
        id="main-navbar"
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0B192C]/95 backdrop-blur-md text-[#FAF7F2] shadow-xl border-b border-[#C5A059]/20 py-3'
            : 'bg-[#0B192C] text-[#FAF7F2] border-b border-[#C5A059]/15 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          {(() => {
            const activeLogo = settings.mainLogo || settings.logoUrl || settings.darkLogo || '';
            const logoHeight = settings.logoHeight || 40;
            const logoPadding = settings.logoPadding || 0;

            return (
              <div
                id="brand-logo-btn"
                onClick={() => handleNavClick('/')}
                className="flex items-center gap-3 cursor-pointer group select-none"
              >
                {activeLogo ? (
                  <img
                    src={activeLogo}
                    alt={settings.brandName}
                    style={{
                      maxHeight: `${logoHeight}px`,
                      height: `${logoHeight}px`,
                      padding: `${logoPadding}px`,
                    }}
                    className="w-auto max-w-[200px] object-contain group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div
                    style={{
                      height: `${Math.min(logoHeight, 48)}px`,
                      width: `${Math.min(logoHeight, 48)}px`,
                    }}
                    className="rounded-lg bg-gradient-to-br from-[#C5A059] to-[#8C6D2D] p-0.5 shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0 flex items-center justify-center"
                  >
                    <div className="w-full h-full bg-[#0B192C] rounded-[7px] flex items-center justify-center text-[#C5A059]">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>
                )}
                <div>
                  <div className="font-brand-display text-xl sm:text-2xl font-bold tracking-wider text-[#FAF7F2] group-hover:text-[#C5A059] transition-colors flex items-center gap-1.5">
                    {settings.brandName.toUpperCase()}
                  </div>
                  <div className="text-[10px] tracking-widest uppercase text-[#C5A059] font-medium -mt-1 opacity-90">
                    Powered by {settings.parentCompany}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/' ? currentPath === '/' : currentPath.startsWith(link.path);
              return (
                <button
                  key={link.path}
                  id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#C5A059] bg-[#C5A059]/10 font-semibold'
                      : 'text-stone-300 hover:text-[#FAF7F2] hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              id="search-open-btn"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full text-stone-300 hover:text-[#C5A059] hover:bg-white/5 transition-colors"
              title="Search books, authors, ISBNs"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              id="wishlist-btn"
              onClick={() => setIsWishlistOpen(true)}
              className="p-2 rounded-full text-stone-300 hover:text-[#C5A059] hover:bg-white/5 transition-colors relative cursor-pointer"
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C5A059] text-[#0B192C] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              id="cart-toggle-btn"
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-full text-stone-300 hover:text-[#C5A059] hover:bg-white/5 transition-colors relative flex items-center gap-1.5"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="bg-[#C5A059] text-[#0B192C] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Account / Profile Menu */}
            <div className="relative" ref={dropdownRef}>
              {currentUser ? (
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#C5A059]/40 text-xs text-stone-200 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#C5A059] text-[#0B192C] font-bold flex items-center justify-center text-xs overflow-hidden">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate font-medium">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>
              ) : (
                <button
                  id="login-btn-header"
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#C5A059] text-[#0B192C] text-xs font-semibold hover:bg-[#E0BA70] transition-colors shadow-sm cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && currentUser && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 bg-[#0B192C] border border-[#C5A059]/30 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider">Signed in as</p>
                    <p className="text-sm font-semibold text-[#FAF7F2] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
                  </div>

                  <button
                    id="dropdown-nav-account"
                    onClick={() => {
                      handleNavClick('/account');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:bg-white/5 hover:text-[#C5A059] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#C5A059]" />
                    <span>My Account</span>
                  </button>

                  <button
                    id="dropdown-nav-orders"
                    onClick={() => {
                      handleNavClick('/account/orders');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:bg-white/5 hover:text-[#C5A059] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                    <span>Order History</span>
                  </button>

                  <button
                    id="dropdown-nav-saved-books"
                    onClick={() => {
                      handleNavClick('/account/saved-books');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:bg-white/5 hover:text-[#C5A059] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#C5A059]" />
                    <span>Saved Books</span>
                  </button>

                  {hasAdminAccess && (
                    <button
                      id="dropdown-nav-admin"
                      onClick={() => {
                        ensureAdminAccess();
                        handleNavClick('/admin');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:bg-white/5 hover:text-[#C5A059] transition-colors flex items-center gap-2 border-t border-white/5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                      <span>Admin Panel</span>
                    </button>
                  )}

                  <button
                    id="dropdown-nav-logout"
                    onClick={() => {
                      logout();
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 border-t border-white/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct 1-Click Admin Access Button */}
            {hasAdminAccess && (
              <button
                id="header-admin-btn"
                onClick={() => {
                  ensureAdminAccess();
                  handleNavClick('/admin');
                }}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  currentPath.startsWith('/admin')
                    ? 'bg-[#C5A059] text-[#0B192C] border-[#C5A059] shadow-sm'
                    : 'bg-white/5 text-[#C5A059] border-[#C5A059]/40 hover:bg-[#C5A059] hover:text-[#0B192C]'
                }`}
                title="Open Sahayak Admin Control Center (/admin)"
                aria-label="Admin Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Admin</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-300 hover:text-[#FAF7F2] hover:bg-white/5"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Full Screen Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="lg:hidden bg-[#061120] border-b border-[#C5A059]/20 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200"
          >
            {/* Mobile Header Brand Identity */}
            {(() => {
              const activeLogo = settings.mainLogo || settings.logoUrl || settings.darkLogo || '';
              const logoHeight = settings.logoHeight || 40;
              const logoPadding = settings.logoPadding || 0;

              return (
                <div
                  onClick={() => handleNavClick('/')}
                  className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl border border-white/10 cursor-pointer"
                >
                  {activeLogo ? (
                    <img
                      src={activeLogo}
                      alt={settings.brandName}
                      style={{
                        maxHeight: `${Math.min(logoHeight, 36)}px`,
                        padding: `${Math.min(logoPadding, 4)}px`,
                      }}
                      className="w-auto object-contain shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C5A059] to-[#8C6D2D] p-0.5 flex items-center justify-center shrink-0">
                      <div className="w-full h-full bg-[#0B192C] rounded-md flex items-center justify-center text-[#C5A059]">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-brand-display text-sm font-bold text-[#FAF7F2] tracking-wider truncate">
                      {settings.brandName.toUpperCase()}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-[#C5A059] font-medium truncate">
                      {settings.parentCompany}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/5 hover:text-[#C5A059] flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </button>
              ))}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsWishlistOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/5 hover:text-[#C5A059] flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#C5A059]" />
                  <span>Reading Wishlist</span>
                </div>
                {wishlist.length > 0 && (
                  <span className="bg-[#C5A059] text-[#0B192C] text-xs font-bold px-2 py-0.5 rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              {hasAdminAccess && (
                <button
                  onClick={() => {
                    ensureAdminAccess();
                    handleNavClick('/admin');
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#C5A059] hover:text-[#0B192C] transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                  <span>Sahayak Admin Panel (/admin)</span>
                </button>
              )}

              {!currentUser ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#C5A059] text-[#0B192C] text-sm font-bold shadow-md text-center"
                >
                  Reader Sign In / Register
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNavClick('/dashboard');
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#C5A059] text-[#0B192C] text-sm font-bold shadow-md text-center"
                >
                  My Reader Account
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Interactive Smart Search Overlay */}
      {isSearchOpen && (
        <div
          id="search-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col items-center pt-16 px-4 animate-in fade-in duration-200"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#0B192C] border border-[#C5A059]/40 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#C5A059]" />
              <input
                ref={searchInputRef}
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                  }
                }}
                placeholder="Search by book title, author, category, ISBN, or topic..."
                className="w-full bg-transparent text-lg text-[#FAF7F2] placeholder-stone-400 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-stone-400 hover:text-white p-1 cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestions / Results */}
            <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-white/5">
              {(searchQuery || '').trim() === '' ? (
                <div className="space-y-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#C5A059]">
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Strategic Governance', 'Corporate Law', 'Financial Economics', 'Civil Services Blueprint', 'Vedic Wisdom', 'Priya Malhotra', 'Supreme Court'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setSearchQuery(item)}
                        className="text-xs bg-white/5 hover:bg-[#C5A059]/20 hover:text-[#C5A059] text-stone-300 px-3 py-1.5 rounded-full transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredBooks.length > 0 ? (
                <div className="space-y-2 py-1">
                  <p className="text-xs font-semibold text-stone-400 mb-3">
                    Found {filteredBooks.length} book{filteredBooks.length > 1 ? 's' : ''}
                  </p>
                  {filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleNavClick(`/books/${book.slug}`)}
                      className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded shadow-md border border-white/10 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#FAF7F2] group-hover:text-[#C5A059] truncate">
                          {book.title}
                        </div>
                        <div className="text-xs text-stone-400 truncate">
                          {book.authorName} • <span className="text-[#C5A059]">{book.category}</span>
                        </div>
                        <div className="text-xs font-mono text-stone-300 mt-0.5">
                          ₹{book.price}{' '}
                          <span className="line-through text-stone-500 text-[11px]">
                            ₹{book.originalPrice}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#C5A059] group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-stone-400 text-sm">
                  No books found matching "{searchQuery}". Try searching for governance, law, or authors.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
