import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderStatus } from '../types';
import {
  Search,
  Truck,
  CheckCircle2,
  Package,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { orders, navigate } = useStore();

  const [searchQuery, setSearchQuery] = useState('SHK-TRK-98214');
  const [selectedOrder, setSelectedOrder] = useState(orders[0] || null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(searchQuery || '').trim()) return;

    const clean = (searchQuery || '').trim().toUpperCase();
    const found = (orders || []).find(
      (o) =>
        (o.id && o.id.toUpperCase().includes(clean)) ||
        (o.orderNumber && o.orderNumber.toUpperCase().includes(clean)) ||
        (o.trackingNumber && o.trackingNumber.toUpperCase().includes(clean)) ||
        (o.customer?.phone && o.customer.phone.includes(clean)) ||
        ((o as any).shippingAddress?.phone && (o as any).shippingAddress.phone.includes(clean))
    );

    if (found) {
      setSelectedOrder(found);
    }
  };

  const trackingSteps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'Order Confirmed', label: 'Order Confirmed', desc: 'Payment verified & order registered' },
    { status: 'Processing', label: 'Editorial Processing', desc: 'Quality audit & invoice generation' },
    { status: 'Packed', label: 'Pristine Packaging', desc: 'Sealed in moisture-proof deluxe carton' },
    { status: 'Shipped', label: 'Handed to Courier', desc: 'Dispatched via Air Express Logistics' },
    { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'With local delivery associate' },
    { status: 'Delivered', label: 'Delivered to Patron', desc: 'Handed over at doorstep' },
  ];

  const getStepIndex = (currentStatus: OrderStatus) => {
    const idx = trackingSteps.findIndex((s) => s.status === currentStatus);
    return idx >= 0 ? idx : 3; // default shipped
  };

  const currentStepIdx = selectedOrder
    ? getStepIndex(selectedOrder.orderStatus || (selectedOrder as any).status)
    : 3;

  return (
    <div id="order-tracking-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search Bar */}
      <div className="bg-gradient-to-r from-[#0B192C] to-[#0E2238] text-[#FAF7F2] rounded-3xl p-8 sm:p-10 border border-[#C5A059]/30 shadow-xl">
        <div className="max-w-xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A059]">
            <Truck className="w-4 h-4" />
            <span>National Express Logistics Dispatch</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">
            Track Your Consignment
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm">
            Enter your Sahayak Order Reference ID (e.g. ORD-94812) or Air Waybill Tracking Number.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 pt-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Order ID or Tracking Number..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#C5A059] uppercase font-mono"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#C5A059] to-[#D8B76E] text-[#0B192C] font-bold text-xs sm:text-sm rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Track</span>
            </button>
          </form>
        </div>
      </div>

      {/* Tracking Result View */}
      {selectedOrder ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-8">
          {/* Order Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <div className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">
                Consignment Details
              </div>
              <h2 className="font-serif text-xl font-bold text-[#0B192C]">
                Tracking Ref: <span className="font-mono">{selectedOrder.trackingNumber}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Courier Partner:{' '}
                <strong className="text-stone-800 font-semibold">{selectedOrder.courierPartner}</strong> • Order ID: {selectedOrder.id}
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-right self-start sm:self-auto">
              <span className="text-[11px] uppercase font-bold text-emerald-800 block">
                Estimated Delivery
              </span>
              <span className="font-serif font-bold text-emerald-950 text-base sm:text-lg">
                {selectedOrder.estimatedDelivery}
              </span>
            </div>
          </div>

          {/* 6-Stage Timeline */}
          <div className="py-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-6">
              Milestone Progress:
            </h3>

            <div className="relative">
              {/* Connecting progress line */}
              <div className="absolute left-4 sm:left-6 top-3 bottom-3 w-0.5 bg-stone-200 pointer-events-none" />
              <div
                className="absolute left-4 sm:left-6 top-3 w-0.5 bg-gradient-to-b from-[#C5A059] to-emerald-600 transition-all duration-700 pointer-events-none"
                style={{
                  height: `${(currentStepIdx / (trackingSteps.length - 1)) * 100}%`,
                }}
              />

              <div className="space-y-6 sm:space-y-8 relative z-10">
                {trackingSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.status} className="flex items-start gap-4 sm:gap-6">
                      <div
                        className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shrink-0 border-2 transition-all ${
                          isCompleted
                            ? 'bg-[#0B192C] text-[#C5A059] border-[#C5A059]'
                            : 'bg-white text-stone-400 border-stone-300'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
                      </div>

                      <div className="flex-1 pt-1 sm:pt-2">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-serif text-sm sm:text-base font-bold ${
                              isCompleted ? 'text-[#0B192C]' : 'text-stone-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#0B192C] font-mono text-[10px] font-bold animate-pulse">
                              Current Status
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Package Contents & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-100 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#C5A059]" />
                <span>Package Manifest ({selectedOrder.items.length} Items)</span>
              </h4>
              <div className="space-y-1.5">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-stone-700">
                    <span className="truncate max-w-[220px]">
                      {item.title} ({item.format})
                    </span>
                    <span className="font-mono font-semibold">Qty {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C5A059]" />
                <span>Delivery Address</span>
              </h4>
              <p className="font-semibold text-stone-900">
                {selectedOrder.customer?.fullName || (selectedOrder as any).shippingAddress?.fullName || 'Valued Patron'}
              </p>
              <p className="text-stone-600 leading-relaxed">
                {selectedOrder.customer?.address || (selectedOrder as any).shippingAddress?.addressLine1 || ''},{' '}
                {selectedOrder.customer?.city || (selectedOrder as any).shippingAddress?.city || ''},{' '}
                {selectedOrder.customer?.state || (selectedOrder as any).shippingAddress?.state || ''} -{' '}
                {selectedOrder.customer?.pinCode || (selectedOrder as any).shippingAddress?.postalCode || ''}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center space-y-4 shadow-sm">
          <Truck className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-stone-800">
            Consignment Not Found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Please check your tracking number or contact Sahayak Support if you require assistance locating your order.
          </p>
        </div>
      )}
    </div>
  );
};
