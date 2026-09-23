import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, FileText, Truck, RotateCcw } from 'lucide-react';

export const PrivacyPolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-[#C5A059] uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4" />
        <span>Legal & Data Protection Compliance</span>
      </div>
      <h1 className="font-serif text-3xl font-bold text-[#0B192C]">
        Sahayak Books Privacy Policy
      </h1>
      <p className="text-xs text-stone-500 font-mono">Last Updated: March 2026</p>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4">
        <p>
          At <strong>Sahayak Books</strong>, powered by <strong>Sahayak Associates</strong>, we hold the privacy and intellectual autonomy of our readers, scholars, and institutional partners in the highest regard. This Privacy Policy sets forth our commitments regarding the collection, transmission, and safeguards applied to personal data.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#0B192C]">1. Data Collection & Use</h3>
        <p>
          We collect personal identifying information exclusively for transactional fulfillment, invoice generation, dispatch tracking, and scholarly communications. This includes your name, institutional affiliation, shipping destination, phone number, and email.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#0B192C]">2. Payment & Cryptographic Security</h3>
        <p>
          We do not store complete payment card credentials on our servers. All monetary settlements via UPI, NetBanking, and credit/debit cards are processed through PCI-DSS Level 1 compliant gateway intermediaries utilizing 256-bit SSL encryption.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#0B192C]">3. Non-Disclosure & Third Parties</h3>
        <p>
          Under no circumstances do we monetize, rent, or lease reader information to commercial ad networks. Data is shared strictly with verified courier carriers (e.g. BlueDart, Speed Post) solely for package delivery.
        </p>
      </div>
    </div>
  );
};

export const TermsConditionsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-[#C5A059] uppercase tracking-wider">
        <FileText className="w-4 h-4" />
        <span>Statutory Terms of Service</span>
      </div>
      <h1 className="font-serif text-3xl font-bold text-[#0B192C]">
        Terms & Conditions of Publication
      </h1>
      <p className="text-xs text-stone-500 font-mono">Effective: March 2026</p>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4">
        <p>
          These Terms govern the purchase of print editions, electronic eBooks, and institutional licenses published by Sahayak Books under the imprint of Sahayak Associates.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#0B192C]">1. Intellectual Property & Copyright</h3>
        <p>
          All books, editorial commentaries, written works, and cover illustrations published herein are protected under the Indian Copyright Act, 1957. Unauthorized reproduction or digital redistribution is strictly prohibited.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#0B192C]">2. eBook Licensing & Personal Use</h3>
        <p>
          Purchase of an eBook format grants a perpetual, non-transferable single-user reading license. Institutional multi-user distribution requires a designated corporate or university licensing agreement.
        </p>
      </div>
    </div>
  );
};

export const ShippingPolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-[#C5A059] uppercase tracking-wider">
        <Truck className="w-4 h-4" />
        <span>Nationwide Logistics Protocol</span>
      </div>
      <h1 className="font-serif text-3xl font-bold text-[#0B192C]">
        Shipping & Dispatch Policy
      </h1>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4">
        <p>
          We partner with India's premier air courier networks to guarantee that legal and academic volumes arrive in pristine condition.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#0B192C]">1. Delivery Timelines</h3>
        <p>
          • Metro Cities (Delhi NCR, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad): 2 - 3 business days.
          <br />
          • Tier 2 & Tier 3 Regional Centers: 3 - 5 business days.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#0B192C]">2. Free Shipping Threshold</h3>
        <p>
          All retail orders with a cart value of ₹499 or above qualify for complimentary standard shipping across all Indian postal codes.
        </p>
      </div>
    </div>
  );
};

export const ReturnRefundPolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-[#C5A059] uppercase tracking-wider">
        <RotateCcw className="w-4 h-4" />
        <span>Quality Assurance Guarantee</span>
      </div>
      <h1 className="font-serif text-3xl font-bold text-[#0B192C]">
        Returns & Replacement Policy
      </h1>

      <div className="prose prose-stone text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4">
        <p>
          Every book dispatched by Sahayak Books undergoes a multi-point quality check. In the rare event of damage in transit or misprinted leaves, we provide immediate resolution.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#0B192C]">1. 7-Day Replacement Guarantee</h3>
        <p>
          You may request an unconditional replacement within 7 calendar days of receipt if the book exhibits missing pages, binding flaws, or postal transit damage.
        </p>

        <h3 className="font-serif text-lg font-bold text-[#0B192C]">2. Refund Processing</h3>
        <p>
          Approved refunds are processed back to the original payment source within 3-5 banking days.
        </p>
      </div>
    </div>
  );
};
