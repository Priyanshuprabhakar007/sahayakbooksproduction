import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  User,
  Package,
  Bookmark,
  BookOpen,
  Star,
  Shield,
  LogOut,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Clock,
  Trash2,
  Download,
} from 'lucide-react';

export const CustomerAccountView: React.FC = () => {
  const {
    currentUser,
    logoutCustomer,
    updateCustomerProfile,
    changePassword,
    navigate,
    orders,
    books,
    blogs,
    reviews,
    savedBookIds,
    savedArticleIds,
    wishlist,
    toggleWishlist,
    toggleSaveBook,
    toggleSaveArticle,
    addToCart,
    currentPath,
  } = useStore();

  // Determine active sub-tab from path (e.g. /account/orders, /account/saved-books, /account/saved-articles, /account/reviews, /account/security)
  const getSubTab = () => {
    if (currentPath.includes('/orders')) return 'orders';
    if (
      currentPath.includes('/saved-books') ||
      currentPath.includes('tab=wishlist') ||
      currentPath.includes('/wishlist')
    )
      return 'saved-books';
    if (currentPath.includes('/saved-articles')) return 'saved-articles';
    if (currentPath.includes('/reviews')) return 'reviews';
    if (currentPath.includes('/security')) return 'security';
    return 'profile';
  };

  const activeTab = getSubTab();

  // Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileCity, setProfileCity] = useState(currentUser?.city || '');
  const [profileCountry, setProfileCountry] = useState(currentUser?.country || 'India');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // If not logged in, render unauthorized invitation screen
  if (!currentUser) {
    return (
      <div id="account-unauthorized" className="min-h-screen bg-[#FDFBF7] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-[#EADBCE]">
          <div className="w-16 h-16 rounded-full bg-[#0B192C] text-[#C5A059] flex items-center justify-center mx-auto mb-4 shadow-md">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#0B192C]">Reader Account Required</h2>
          <p className="mt-3 text-sm text-gray-600 font-sans leading-relaxed">
            Please sign in or register to access your personal library, manage orders, and view saved dispatches.
          </p>
          <div className="mt-8 space-y-3">
            <button
              id="unauth-signin-btn"
              onClick={() => navigate('/login?returnTo=/account')}
              className="w-full py-3.5 px-4 bg-[#0B192C] text-white font-semibold rounded-xl hover:bg-[#1E3E62] shadow-md transition"
            >
              Sign In to Your Account
            </button>
            <button
              id="unauth-register-btn"
              onClick={() => navigate('/register?returnTo=/account')}
              className="w-full py-3.5 px-4 border border-[#0B192C] text-[#0B192C] font-semibold rounded-xl hover:bg-[#F4EBE1] transition"
            >
              Create New Reader Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsUpdatingProfile(true);

    const result = await updateCustomerProfile({
      name: profileName,
      phone: profilePhone,
      city: profileCity,
      country: profileCountry,
      avatar: profileAvatar,
    });

    setIsUpdatingProfile(false);
    if (result.success) {
      setProfileMsg({ type: 'success', text: result.message || 'Profile details updated successfully.' });
    } else {
      setProfileMsg({ type: 'error', text: result.error || 'Failed to update profile.' });
    }
  };

  // Handle Security Update
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);

    if (newPassword !== confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    const result = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setIsUpdatingPassword(false);

    if (result.success) {
      setSecurityMsg({ type: 'success', text: result.message || 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setSecurityMsg({ type: 'error', text: result.error || 'Password change failed.' });
    }
  };

  // Saved books filtering (combines account savedBookIds and localStorage/store wishlist)
  const userSavedBooks = books.filter(
    (b) => savedBookIds.includes(b.id) || wishlist.includes(b.id)
  );

  // Saved articles filtering
  const userSavedArticles = blogs.filter((b) => savedArticleIds.includes(b.id));

  // User reviews filtering
  const userReviews = reviews.filter(
    (r) => r.userName.toLowerCase() === currentUser.name.toLowerCase() || (r as any).userId === currentUser.id
  );

  // User orders filtering
  const userOrders = orders.filter(
    (o) =>
      o.customer.email.toLowerCase() === currentUser.email.toLowerCase() ||
      currentUser.orderIds?.includes(o.id)
  );

  return (
    <div id="customer-account-page" className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Profile Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EADBCE] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B192C] via-[#C5A059] to-[#0B192C]"></div>

          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0B192C] text-[#C5A059] flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-md overflow-hidden flex-shrink-0">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">{currentUser.name}</h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4EBE1] text-[#0B192C] border border-[#EADBCE]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> Verified Reader
                </span>
                {currentUser.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Email Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 font-sans mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" /> {currentUser.email}
              </p>
              <p className="text-xs text-gray-400 font-sans mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Registered Member since {currentUser.registrationDate || '2026'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
            <button
              id="account-logout-btn"
              onClick={async () => {
                await logoutCustomer();
                navigate('/login');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" /> Log Out Session
            </button>
          </div>
        </div>

        {/* Dashboard Grid & Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2 bg-white p-4 rounded-2xl border border-[#EADBCE] shadow-sm h-fit">
            <button
              id="account-tab-profile"
              onClick={() => navigate('/account')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-[#0B192C] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#FDFBF7] hover:text-[#0B192C]'
              }`}
            >
              <span className="flex items-center gap-3">
                <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#C5A059]' : 'text-gray-400'}`} />
                My Profile
              </span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              id="account-tab-orders"
              onClick={() => navigate('/account/orders')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'orders'
                  ? 'bg-[#0B192C] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#FDFBF7] hover:text-[#0B192C]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-[#C5A059]' : 'text-gray-400'}`} />
                Order History
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 font-bold">
                {userOrders.length}
              </span>
            </button>

            <button
              id="account-tab-saved-books"
              onClick={() => navigate('/account/saved-books')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'saved-books'
                  ? 'bg-[#0B192C] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#FDFBF7] hover:text-[#0B192C]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Bookmark className={`w-4 h-4 ${activeTab === 'saved-books' ? 'text-[#C5A059]' : 'text-gray-400'}`} />
                Saved Books
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 font-bold">
                {savedBookIds.length}
              </span>
            </button>

            <button
              id="account-tab-saved-articles"
              onClick={() => navigate('/account/saved-articles')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'saved-articles'
                  ? 'bg-[#0B192C] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#FDFBF7] hover:text-[#0B192C]'
              }`}
            >
              <span className="flex items-center gap-3">
                <BookOpen className={`w-4 h-4 ${activeTab === 'saved-articles' ? 'text-[#C5A059]' : 'text-gray-400'}`} />
                Saved Dispatches
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 font-bold">
                {savedArticleIds.length}
              </span>
            </button>

            <button
              id="account-tab-reviews"
              onClick={() => navigate('/account/reviews')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'reviews'
                  ? 'bg-[#0B192C] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#FDFBF7] hover:text-[#0B192C]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Star className={`w-4 h-4 ${activeTab === 'reviews' ? 'text-[#C5A059]' : 'text-gray-400'}`} />
                My Reviews
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 font-bold">
                {userReviews.length}
              </span>
            </button>

            <button
              id="account-tab-security"
              onClick={() => navigate('/account/security')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'security'
                  ? 'bg-[#0B192C] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#FDFBF7] hover:text-[#0B192C]'
              }`}
            >
              <span className="flex items-center gap-3">
                <KeyRound className={`w-4 h-4 ${activeTab === 'security' ? 'text-[#C5A059]' : 'text-gray-400'}`} />
                Security & Password
              </span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </div>

          {/* Main Content View Container */}
          <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-2xl border border-[#EADBCE] shadow-sm">
            {/* TAB 1: PROFILE MANAGEMENT */}
            {activeTab === 'profile' && (
              <div id="account-section-profile" className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-serif font-bold text-[#0B192C]">Personal Profile Settings</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage your contact details, shipping location preferences, and reader avatar.
                  </p>
                </div>

                {profileMsg && (
                  <div
                    className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
                      profileMsg.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    {profileMsg.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className="font-medium">{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                      />
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        Email address cannot be modified directly.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        City / State
                      </label>
                      <input
                        type="text"
                        value={profileCity}
                        onChange={(e) => setProfileCity(e.target.value)}
                        placeholder="e.g. New Delhi, Delhi"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={profileCountry}
                        onChange={(e) => setProfileCountry(e.target.value)}
                        placeholder="India"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Avatar Image URL
                      </label>
                      <input
                        type="url"
                        value={profileAvatar}
                        onChange={(e) => setProfileAvatar(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="px-6 py-3 bg-[#0B192C] text-white font-semibold text-sm rounded-xl hover:bg-[#1E3E62] transition shadow-md disabled:opacity-50"
                    >
                      {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div id="account-section-orders" className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-serif font-bold text-[#0B192C]">Your Order History</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Track dispatches, view digital receipts, and manage purchased literature.
                  </p>
                </div>

                {userOrders.length === 0 ? (
                  <div className="text-center py-12 bg-[#FDFBF7] rounded-2xl border border-dashed border-gray-300 p-8">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-serif font-bold text-gray-700">No Orders Found Yet</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      You haven't placed any book orders with Sahayak Associates yet. Explore our publications to get started!
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-5 px-5 py-2.5 bg-[#0B192C] text-white text-xs font-semibold rounded-xl hover:bg-[#1E3E62] transition"
                    >
                      Browse Publications
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-[#FDFBF7] p-4 sm:p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className="text-xs font-semibold text-[#C5A059] uppercase tracking-wider block">
                              Order #{order.orderNumber}
                            </span>
                            <span className="text-xs text-gray-500">
                              Placed on {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                order.orderStatus === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                            <span className="text-base font-serif font-bold text-[#0B192C]">₹{order.total}</span>
                          </div>
                        </div>

                        <div className="p-4 sm:p-5 divide-y divide-gray-100">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                              <div className="flex items-center gap-4">
                                <img
                                  src={item.coverImage}
                                  alt={item.title}
                                  className="w-12 h-16 object-cover rounded-lg shadow-sm border border-gray-200"
                                />
                                <div>
                                  <p className="text-sm font-semibold text-[#0B192C] font-serif">{item.title}</p>
                                  <p className="text-xs text-gray-500">
                                    By {item.authorName} • <span className="font-medium text-gray-700">{item.format}</span> x{item.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SAVED BOOKS */}
            {activeTab === 'saved-books' && (
              <div id="account-section-saved-books" className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-serif font-bold text-[#0B192C]">Saved Books & Literature</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Your personal reading shortlist and saved academic texts.
                  </p>
                </div>

                {userSavedBooks.length === 0 ? (
                  <div className="text-center py-12 bg-[#FDFBF7] rounded-2xl border border-dashed border-gray-300 p-8">
                    <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-serif font-bold text-gray-700">No Saved Books Yet</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Click the bookmark icon on any book page to save publications to your personal account library.
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-5 px-5 py-2.5 bg-[#0B192C] text-white text-xs font-semibold rounded-xl hover:bg-[#1E3E62] transition"
                    >
                      Explore Books Catalog
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userSavedBooks.map((book) => (
                      <div
                        key={book.id}
                        className="p-4 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition flex gap-4 relative group"
                      >
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-20 h-28 object-cover rounded-xl shadow-sm border border-gray-200 flex-shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-serif font-bold text-[#0B192C] line-clamp-2">{book.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">{book.authorName}</p>
                            <p className="text-sm font-bold text-[#0B192C] mt-2">₹{book.price}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => addToCart(book, 'Paperback', 1)}
                              className="px-3 py-1.5 bg-[#0B192C] text-white text-xs font-semibold rounded-lg hover:bg-[#1E3E62] transition flex-1"
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={() => {
                                if (savedBookIds.includes(book.id)) {
                                  toggleSaveBook(book.id);
                                }
                                if (wishlist.includes(book.id)) {
                                  toggleWishlist(book.id);
                                }
                              }}
                              title="Remove from saved books"
                              className="p-1.5 text-gray-400 hover:text-red-600 transition hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SAVED ARTICLES */}
            {activeTab === 'saved-articles' && (
              <div id="account-section-saved-articles" className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-serif font-bold text-[#0B192C]">Saved Research Dispatches</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Bookmarked articles, editorial dispatches, and scholarly essays.
                  </p>
                </div>

                {userSavedArticles.length === 0 ? (
                  <div className="text-center py-12 bg-[#FDFBF7] rounded-2xl border border-dashed border-gray-300 p-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-serif font-bold text-gray-700">No Saved Dispatches Yet</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Save articles from the Sahayak Editorial Desk to read or reference later.
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-5 px-5 py-2.5 bg-[#0B192C] text-white text-xs font-semibold rounded-xl hover:bg-[#1E3E62] transition"
                    >
                      Browse Editorial Desk
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userSavedArticles.map((art) => (
                      <div
                        key={art.id}
                        className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F4EBE1] text-[#0B192C] uppercase tracking-wider">
                            {art.category}
                          </span>
                          <h3 className="text-base font-serif font-bold text-[#0B192C]">{art.title}</h3>
                          <p className="text-xs text-gray-500">By {art.author} • Published {art.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/blog/${art.slug}`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B192C] text-white text-xs font-semibold rounded-xl hover:bg-[#1E3E62] transition"
                          >
                            Read Article <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleSaveArticle(art.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: MY REVIEWS */}
            {activeTab === 'reviews' && (
              <div id="account-section-reviews" className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-serif font-bold text-[#0B192C]">Submitted Reader Reviews</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Reviews and academic commentary submitted for Sahayak publications.
                  </p>
                </div>

                {userReviews.length === 0 ? (
                  <div className="text-center py-12 bg-[#FDFBF7] rounded-2xl border border-dashed border-gray-300 p-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-serif font-bold text-gray-700">No Reviews Submitted Yet</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Share your reflections and reviews on books you have read.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userReviews.map((rev) => (
                      <div key={rev.id} className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              rev.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rev.status}
                          </span>
                        </div>
                        <p className="text-sm font-serif font-semibold text-[#0B192C]">{rev.title}</p>
                        <p className="text-xs text-gray-600 font-sans leading-relaxed">{rev.comment}</p>
                        <p className="text-[11px] text-gray-400 pt-1">Submitted on {rev.date}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
              <div id="account-section-security" className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-serif font-bold text-[#0B192C]">Security & Authentication</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Update your password and manage active login credentials.
                  </p>
                </div>

                {securityMsg && (
                  <div
                    className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
                      securityMsg.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    {securityMsg.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className="font-medium">{securityMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A059]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A059]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A059]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="w-full py-3 bg-[#0B192C] text-white font-semibold text-sm rounded-xl hover:bg-[#1E3E62] transition shadow-md disabled:opacity-50"
                    >
                      {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
