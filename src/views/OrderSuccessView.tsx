import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Truck,
  Download,
  ArrowRight,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface OrderSuccessViewProps {
  orderId: string;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({ orderId }) => {
  const { orders, navigate } = useStore();

  const order = orders.find((o) => o.id === orderId) || orders[0];

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A059', '#0B192C', '#10B981'],
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold">Order not found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-[#0B192C] text-white rounded-xl text-xs font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div id="order-success-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Congratulatory Header */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#0E2238] to-[#0B192C] text-[#FAF7F2] rounded-3xl p-8 sm:p-12 text-center border border-[#C5A059]/40 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-[#C5A059] text-[#0B192C] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Payment & Order Confirmed</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Thank You for Your Patronage!
        </h1>

        <p className="text-stone-300 text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
          Your scholarly order has been logged into our fulfillment registry. A formal tax invoice and courier tracking dispatch have been transmitted to your email.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-stone-200">
          <div className="px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15">
            Order Reference: <strong className="text-[#C5A059] font-mono">{order.id}</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15">
            Tracking No: <strong className="text-white font-mono">{order.trackingNumber}</strong>
          </div>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#0B192C]">Dispatch Dossier</h2>
            <p className="text-xs text-stone-500">
              Estimated Delivery:{' '}
              <strong className="text-stone-800 font-semibold">{order.estimatedDelivery}</strong>
            </p>
          </div>

          <button
            onClick={() => navigate(`/track-order?ref=${order.trackingNumber}`)}
            className="px-4 py-2 bg-[#0B192C] text-[#C5A059] text-xs font-bold rounded-xl hover:bg-[#152A4A] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Truck className="w-4 h-4" />
            <span>Track Live Shipment</span>
          </button>
        </div>

        {/* Purchased Books List */}
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-14 h-20 object-cover rounded-lg border border-stone-300 shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-sm font-bold text-[#0B192C] truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600">{item.authorName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 bg-stone-200 text-stone-700 rounded font-medium">
                    {item.format}
                  </span>
                  <span className="text-xs text-stone-500 font-mono">Qty: {item.quantity}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-[#0B192C]">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Shipping & Payment Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 text-xs">
          <div className="space-y-1.5">
            <h4 className="font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Consignee Delivery Address</span>
            </h4>
            <p className="font-semibold text-stone-900">{order.shippingAddress.fullName}</p>
            <p className="text-stone-600 leading-relaxed">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              <br />
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          <div className="space-y-1.5 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <h4 className="font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Settlement Summary</span>
            </h4>
            <div className="flex justify-between">
              <span className="text-stone-600">Payment Channel:</span>
              <span className="font-bold text-stone-800">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Payment Status:</span>
              <span className="font-bold text-emerald-700 uppercase">Paid & Verified</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#0B192C] pt-2 border-t border-stone-200">
              <span>Total Amount:</span>
              <span className="font-mono text-base">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Return to browsing CTA */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/books')}
            className="px-6 py-3 rounded-xl bg-[#0B192C] text-[#FAF7F2] font-bold text-xs sm:text-sm hover:bg-[#152A4A] transition-colors"
          >
            Continue Exploring Sahayak Publications
          </button>
        </div>
      </div>
    </div>
  );
};
