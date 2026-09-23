import React from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const { settings, trackEvent } = useStore();

  const handleWhatsAppClick = () => {
    const cleanNumber = settings.whatsappNumber.replace(/\D/g, '');
    const message = encodeURIComponent('Hello Sahayak Books, I would like to know more about your books.');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    trackEvent('click', 'Floating WhatsApp Help Trigger');
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside
      id="floating-whatsapp-widget"
      aria-label="Contact via WhatsApp"
      className="fixed bottom-6 right-6 z-40 group select-none"
    >
      {/* Tooltip on hover */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#0B192C] text-[#FAF7F2] text-xs font-semibold py-1.5 px-3 rounded-lg shadow-xl border border-[#C5A059]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with Sahayak Advisors
        <div className="text-[10px] font-normal text-[#C5A059]">Instant WhatsApp Response</div>
      </div>

      <button
        onClick={handleWhatsAppClick}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_10px_25px_rgba(37,211,102,0.4)] flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 border-2 border-white"
        title="Contact Sahayak Books on WhatsApp"
        aria-label="Contact Sahayak Books on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0B192C] rounded-full animate-ping" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0B192C] rounded-full" />
      </button>
    </aside>
  );
};
