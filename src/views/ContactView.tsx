import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  ChevronDown,
  Building,
} from 'lucide-react';

export const ContactView: React.FC = () => {
  const { settings, books, submitEnquiry } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Book Inquiry & General Questions',
    bookId: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    submitEnquiry({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '+91 9876543210',
      subject: formData.subject,
      bookId: formData.bookId || undefined,
      message: formData.message,
    });

    setIsSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'Book Inquiry & General Questions',
      bookId: '',
      message: '',
    });
  };

  const faqs = [
    {
      q: 'How can I order books in bulk for schools, colleges, or organizations?',
      a: 'We offer special discounts on bulk orders for educational institutions, reading clubs, and corporate gifting. Please reach out via this form with your estimated quantity.',
    },
    {
      q: 'What is the estimated delivery timeframe for orders across India?',
      a: 'Metro cities receive deliveries within 2 to 3 business days via Express courier. Other locations are delivered within 4 to 5 business days with live tracking updates.',
    },
    {
      q: 'Are the books available on Amazon or external stores?',
      a: 'Yes, our books are available directly on our website, on Amazon India, and through leading bookstores.',
    },
    {
      q: 'What is your return policy for damaged books?',
      a: 'We offer an immediate replacement for any book damaged during transit or with printing defects. Contact us with your order number and photos.',
    },
  ];

  return (
    <div id="contact-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A059]">
          <Building className="w-4 h-4" />
          <span>Sahayak Associates Support Desk</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B192C]">
          Get in Touch With Us
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          For book inquiries, bulk orders, author sessions, reader support, or order tracking, we are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#0B192C]">
              Contact Details
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-stone-900">Office Address</h3>
                  <p className="text-stone-600 mt-0.5 leading-relaxed">{settings.officeAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <Phone className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-stone-900">Phone Support</h3>
                  <p className="font-mono text-stone-700 mt-0.5">+91 (11) 4892-0199 / +91 98765 43210</p>
                  <p className="text-[10px] text-stone-400">Monday - Saturday, 9:00 AM - 6:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <Mail className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-stone-900">Email Address</h3>
                  <p className="font-mono text-stone-700 mt-0.5">{settings.contactEmail}</p>
                  <p className="text-[10px] text-stone-400">Average response time: &lt; 4 hours</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Direct Action Button */}
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Sahayak%20Books,%20I%20have%20an%20enquiry%20regarding%20books.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat With Us on WhatsApp</span>
            </a>
          </div>

          {/* Interactive Map Visual */}
          <div className="bg-[#0B192C] text-white rounded-3xl p-6 border border-[#C5A059]/40 shadow-sm space-y-2">
            <h3 className="font-serif text-sm font-bold text-[#C5A059] flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Author Sessions & Book Signings</span>
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Interested in inviting author Sandeep Sahni for a session, workshop, or book signing? Send us a message through the form.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0B192C]">
              Send Us a Message
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Fill in the form below and we will get back to you promptly.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-emerald-950">
                Message Sent Successfully!
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Thank you for reaching out to Sahayak Books. Our team will review your message and get back to you soon.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  >
                    <option>Book Inquiry & General Questions</option>
                    <option>Bulk / Institutional Order Request</option>
                    <option>Order Tracking & Delivery Help</option>
                    <option>Author Session / Event Invitation</option>
                    <option>Feedback & Reviews</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-bold mb-1">
                    Related Publication (Optional)
                  </label>
                  <select
                    value={formData.bookId}
                    onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="">-- Select Book If Applicable --</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.isbn})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-bold mb-1">Your Detailed Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details regarding your requirement or manuscript synopsis..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#0B192C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0B192C] text-[#C5A059] font-bold text-xs sm:text-sm rounded-xl hover:bg-[#152A4A] transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Official Communication</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C5A059]">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Addressed Matters</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B192C] mt-1">
            Common Patron & Scholar Inquiries
          </h2>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-stone-200">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
              >
                <span className="font-serif text-sm sm:text-base font-bold text-[#0B192C]">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-500 shrink-0 transition-transform ${
                    openFaq === i ? 'rotate-180 text-[#C5A059]' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed animate-in fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
