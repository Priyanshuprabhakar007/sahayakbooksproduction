import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod } from '../types';
import {
  Truck,
  Lock,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartShipping,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponError,
    currentUser,
    placeOrder,
    navigate,
  } = useStore();

  // Shipping Form State
  const [shippingInfo, setShippingInfo] = useState({
    fullName: currentUser?.name || 'Aarav Sharma',
    email: currentUser?.email || 'aarav.sharma@example.com',
    phone: currentUser?.phone || '9876543210',
    addressLine1: 'Flat 402, Royal Residency, Sector 62',
    addressLine2: 'Near City Centre',
    city: 'Noida',
    state: 'Uttar Pradesh',
    postalCode: '201309',
    country: 'India',
  });

  // Payment Selection State
  const [paymentMethod] = useState<PaymentMethod>('UPI');
  const [couponCode, setCouponCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-200 mx-auto flex items-center justify-center text-stone-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#0B192C]">Your Basket is Empty</h2>
        <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto">
          Please add books to your basket before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate('/books')}
          className="px-6 py-2.5 rounded-xl bg-[#0B192C] text-[#C5A059] font-bold text-xs"
        >
          Browse Book Catalog
        </button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate 1.2s realistic gateway processing
    setTimeout(() => {
      const order = placeOrder(shippingInfo, paymentMethod);
      setIsProcessing(false);
      navigate(`/order-success/${order.id}`);
    }, 1200);
  };

  return (
    <div id="checkout-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit Encrypted Secure Checkout</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#0B192C]">
          Finalize Your Book Order
        </h1>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shipping & Payment Modules */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#0B192C] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#C5A059]" />
              <span>Shipping & Delivery Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.fullName}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-bold mb-1">Email for Invoices & Tracking</label>
                <input
                  type="email"
                  required
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-bold mb-1">Street Address / House No.</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.addressLine1}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">City</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">State</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">PIN / Postal Code</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.postalCode}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C] font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Country</label>
                <input
                  type="text"
                  disabled
                  value={shippingInfo.country}
                  className="w-full p-2.5 bg-stone-200 border border-stone-300 rounded-xl text-stone-600 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#0B192C] flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs font-mono text-stone-500 font-normal">
              {cart.length} Publication{cart.length !== 1 ? 's' : ''}
            </span>
          </h2>

          {/* Cart Items Compact List */}
          <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
            {cart.map((item) => (
              <div key={`${item.bookId}-${item.format}`} className="pt-3 first:pt-0 flex gap-3">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-12 h-16 object-cover rounded-lg border border-stone-300 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-serif font-bold text-[#0B192C] truncate">
                      {item.title}
                    </h3>
                    <div className="text-[10px] text-stone-500">
                      {item.format} • Qty {item.quantity}
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#0B192C]">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Box */}
          <div className="pt-2 border-t border-stone-100">
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <span className="font-medium">
                  Coupon <strong>{appliedCoupon.code}</strong> (-₹{cartDiscount})
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-rose-600 hover:underline font-bold text-[11px]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon (e.g. SAHAYAK10)"
                  className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-xl uppercase"
                />
                <button
                  type="button"
                  onClick={() => couponCode && applyCoupon(couponCode)}
                  className="px-3 py-1.5 bg-stone-800 text-white rounded-xl text-xs font-bold"
                >
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-stone-900">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Express Shipping</span>
              <span className="font-mono font-semibold text-stone-900">
                {cartShipping === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${cartShipping}`}
              </span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Special Promo</span>
                <span className="font-mono">-₹{cartDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#0B192C] pt-2 border-t border-stone-200">
              <span>Total Payable</span>
              <span className="font-mono text-xl text-[#0B192C]">₹{cartTotal}</span>
            </div>
          </div>

          {/* Place Order CTA Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#D8B76E] text-[#0B192C] font-bold text-sm shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Authorizing Transaction...</span>
            ) : (
              <>
                <span>Complete Purchase (₹{cartTotal})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center text-[10px] text-stone-500 space-y-1">
            <p>✓ Fast Dispatch within 24 Hours from Delhi Imprint Warehouse</p>
            <p>✓ Complete Tax Invoice and Delivery Tracking SMS Provided</p>
          </div>
        </div>
      </form>
    </div>
  );
};
