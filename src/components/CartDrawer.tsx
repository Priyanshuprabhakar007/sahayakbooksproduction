import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Tag,
  CheckCircle,
  Truck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartShipping,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    settings,
    navigate,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, settings.freeShippingThreshold - cartSubtotal);
  const shippingProgress = Math.min(100, (cartSubtotal / settings.freeShippingThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCoupon = (couponInput || '').trim();
    if (cleanCoupon) {
      applyCoupon(cleanCoupon);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-stone-300 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#0B192C] text-[#FAF7F2] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-serif text-lg font-bold">Your Book Basket</h2>
            <span className="bg-[#C5A059] text-[#0B192C] text-xs font-bold px-2 py-0.5 rounded-full">
              {totalCount} item{totalCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            id="close-cart-drawer-btn"
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-[#FAF7F2] p-3.5 border-b border-stone-200">
          <div className="flex items-center justify-between text-xs font-medium text-stone-700 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#C5A059]" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong className="font-mono text-[#0B192C]">₹{remainingForFreeShipping}</strong> more for <strong>Free Express Shipping</strong>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Unlocked Free Express Nationwide Delivery!
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] font-bold text-stone-500">
              ₹{cartSubtotal}/₹{settings.freeShippingThreshold}
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C5A059] to-emerald-600 transition-all duration-500 rounded-full"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-stone-200">
          {cart.length === 0 ? (
            <div className="py-16 text-center text-stone-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-200/80 mx-auto flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-800">Your basket is empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Discover insightful books on personal growth, finance, and practical life lessons.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/books');
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#0B192C] text-[#C5A059] text-xs font-bold hover:bg-[#152A4A] transition-colors"
              >
                Browse Books Catalog
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.bookId}-${item.format}`} className="pt-3 first:pt-0 flex gap-3">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-16 h-22 object-cover rounded-lg border border-stone-300 shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-[#0B192C] line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.bookId, item.format)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">{item.authorName}</p>
                    <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded font-medium">
                      {item.format}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-stone-300 rounded-md bg-white">
                      <button
                        onClick={() => updateCartQuantity(item.bookId, item.format, item.quantity - 1)}
                        className="p-1 hover:bg-stone-100 text-stone-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.bookId, item.format, item.quantity + 1)}
                        className="p-1 hover:bg-stone-100 text-stone-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-[#0B192C]">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Panel */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-stone-300 space-y-3">
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{cartDiscount})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] text-rose-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon (e.g. SAHAYAK10)"
                    className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#0B192C] uppercase"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-stone-800 hover:bg-[#0B192C] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-stone-900">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Nationwide Shipping</span>
                <span className="font-mono font-semibold text-stone-900">
                  {cartShipping === 0 ? (
                    <span className="text-emerald-700 uppercase font-bold">FREE</span>
                  ) : (
                    `₹${cartShipping}`
                  )}
                </span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Special Discount</span>
                  <span className="font-mono">-₹{cartDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#0B192C] pt-2 border-t border-stone-200">
                <span>Estimated Total</span>
                <span className="font-mono text-base text-[#0B192C]">₹{cartTotal}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              id="proceed-checkout-btn"
              onClick={handleCheckout}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D8B76E] text-[#0B192C] font-bold text-sm shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-4 text-[10px] text-stone-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                256-Bit Encrypted Payment
              </span>
              <span>•</span>
              <span>100% Genuine Publications</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
