import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';
import {
  User,
  Package,
  BookOpen,
  Heart,
  MapPin,
  Star,
  LogOut,
  Download,
  Truck,
  Eye,
  Trash2,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export const UserDashboardView: React.FC = () => {
  const {
    currentUser,
    orders,
    wishlist,
    books,
    reviews,
    logout,
    addToCart,
    toggleWishlist,
    openSampleReader,
    navigate,
    openAuthModal,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'ebooks' | 'wishlist' | 'addresses' | 'reviews' | 'profile'
  >('orders');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#0B192C] text-[#C5A059] flex items-center justify-center mx-auto shadow-lg">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#0B192C]">
          Reader Sign-In Required
        </h2>
        <p className="text-xs text-stone-600">
          Please log in to view your purchased books, track orders, and access your reading library.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-[#0B192C] text-[#C5A059] font-bold text-xs shadow-md"
        >
          Sign In to Your Account
        </button>
      </div>
    );
  }

  const wishlistedBooks = books.filter((b) => wishlist.includes(b.id));
  const userOrders = orders;
  const userReviews = reviews.filter((r) => r.userName === currentUser.name || r.userId === currentUser.id);

  // Digital eBooks in library
  const digitalBooks = books.filter((b) => b.formats.includes('eBook'));

  return (
    <div id="user-dashboard-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Bar */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#0E2238] to-[#0B192C] text-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#C5A059]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-[#C5A059] p-0.5 shadow-md shrink-0">
            <div className="w-full h-full bg-[#0B192C] rounded-[14px] flex items-center justify-center text-[#C5A059] font-serif font-bold text-2xl">
              {currentUser.name.charAt(0)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-white">{currentUser.name}</h1>
              <span className="px-2 py-0.5 rounded bg-[#C5A059]/20 text-[#C5A059] text-[10px] font-bold uppercase tracking-wider">
                {currentUser.role === 'admin' ? 'Chief Administrator' : 'Verified Reader'}
              </span>
            </div>
            <p className="text-xs text-stone-300">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-[#C5A059] text-[#0B192C] text-xs font-bold rounded-xl hover:brightness-110 shadow-md transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Go to Admin Dashboard</span>
            </button>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs font-semibold rounded-xl border border-white/15 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Navigation Tabs + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Tabs */}
        <aside className="lg:col-span-3 bg-white rounded-2xl p-3 border border-stone-200 shadow-sm space-y-1">
          {[
            { id: 'orders', label: 'My Orders', icon: Package, count: userOrders.length },
            { id: 'ebooks', label: 'eBook Library', icon: BookOpen, count: digitalBooks.length },
            { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, count: wishlistedBooks.length },
            { id: 'reviews', label: 'My Reviews', icon: Star, count: userReviews.length },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'profile', label: 'Account Profile', icon: User },
          ].map((tab) => {
            const IconC = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0B192C] text-[#FAF7F2] shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconC className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#C5A059]' : 'text-stone-500'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-[#C5A059] text-[#0B192C]'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Right Tab Content Panel */}
        <main className="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm min-h-[480px]">
          {/* Tab 1: Orders History */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#0B192C]">
                Your Order Archive ({userOrders.length})
              </h2>

              {userOrders.length === 0 ? (
                <div className="py-12 text-center text-stone-500 space-y-3">
                  <Package className="w-12 h-12 text-stone-400 mx-auto" />
                  <p className="text-xs">You have not placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 text-xs">
                        <div>
                          <span className="font-mono font-bold text-stone-900">{order.id}</span>
                          <span className="text-stone-400 ml-2">• {order.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                            {order.status}
                          </span>
                          <button
                            onClick={() => navigate(`/track-order?ref=${order.trackingNumber}`)}
                            className="px-3 py-1 bg-[#0B192C] text-[#C5A059] text-xs font-bold rounded-lg hover:bg-[#152A4A] transition-colors flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Track</span>
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.coverImage}
                                alt={item.title}
                                className="w-10 h-14 object-cover rounded-md border border-stone-300 shadow-2xs"
                              />
                              <div>
                                <div className="font-serif font-bold text-[#0B192C]">
                                  {item.title}
                                </div>
                                <div className="text-[11px] text-stone-500">
                                  {item.format} • Qty {item.quantity}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-stone-900">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-200 text-xs">
                        <span className="text-stone-500 font-mono">
                          Tracking: {order.trackingNumber} ({order.courierPartner})
                        </span>
                        <div className="font-mono text-sm font-bold text-[#0B192C]">
                          Total: ₹{order.total}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: eBook Digital Reading Library */}
          {activeTab === 'ebooks' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#0B192C]">
                  Digital eBook Library & Readers
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Access and read your licensed electronic publications instantly across desktop and mobile devices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {digitalBooks.map((book) => (
                  <div
                    key={book.id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex gap-4 items-center"
                  >
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-16 h-24 object-cover rounded-lg border border-stone-300 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#C5A059]">
                          eBook Edition
                        </span>
                        <h4 className="font-serif text-sm font-bold text-[#0B192C] truncate">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-stone-500">{book.authorName}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openSampleReader(book)}
                          className="px-3 py-1.5 rounded-lg bg-[#0B192C] text-[#C5A059] text-xs font-bold hover:bg-[#152A4A] flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Now</span>
                        </button>
                        <a
                          href={book.samplePdfUrl || '#'}
                          download
                          className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-600 hover:text-stone-900"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Saved Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#0B192C]">
                Saved Scholarly Reading Wishlist ({wishlistedBooks.length})
              </h2>

              {wishlistedBooks.length === 0 ? (
                <div className="py-12 text-center text-stone-500 space-y-3">
                  <Heart className="w-12 h-12 text-stone-300 mx-auto" />
                  <p className="text-xs">Your wishlist is currently empty.</p>
                  <button
                    onClick={() => navigate('/books')}
                    className="px-4 py-2 rounded-xl bg-[#0B192C] text-[#C5A059] text-xs font-bold"
                  >
                    Explore Publications Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistedBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: My Submitted Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#0B192C]">
                Your Reader Reviews & Academic Endorsements
              </h2>

              <div className="space-y-4">
                {userReviews.length === 0 ? (
                  <p className="text-xs text-stone-500">You have not submitted any reviews yet.</p>
                ) : (
                  userReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{rev.bookTitle}</span>
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <h4 className="font-serif font-bold text-stone-800">“{rev.title}”</h4>
                      <p className="text-stone-600 italic">"{rev.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#0B192C]">
                Saved Addresses
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border-2 border-[#C5A059] bg-[#FAF7F2] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B192C] uppercase text-[10px] tracking-wider">
                      Default Shipping Address
                    </span>
                    <span className="px-2 py-0.5 bg-[#C5A059] text-[#0B192C] font-bold rounded text-[10px]">
                      Primary
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900">{currentUser.name}</h4>
                  <p className="text-stone-600 leading-relaxed">
                    Faculty Housing Block B, National Law School Campus, Nagarbhavi, Bengaluru, Karnataka - 560072
                  </p>
                  <p className="text-stone-500 font-mono">Phone: {currentUser.phone || '+91 9876543210'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Profile & Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="font-serif text-xl font-bold text-[#0B192C]">
                Profile Credentials & Information
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full p-2.5 bg-stone-200 border border-stone-300 rounded-xl text-stone-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue={currentUser.phone || '9876543210'}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-[#0B192C] text-[#C5A059] text-xs font-bold rounded-xl shadow-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
