import React from 'react';
import { useStore } from '../context/StoreContext';
import { Award, BookOpen, ShieldCheck, Users, Target, Compass, ArrowRight } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { settings, navigate } = useStore();

  return (
    <div id="about-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Editorial Hero */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#0E2238] to-[#0B192C] text-[#FAF7F2] rounded-3xl p-8 sm:p-14 border border-[#C5A059]/40 shadow-2xl text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A059]">
          <Award className="w-4 h-4" />
          <span>The Sahayak Legacy</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
          Books That Inspire, Educate & Transform
        </h1>
        <p className="text-stone-300 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
          Founded under the vision of <strong className="text-white">Sahayak Associates</strong> and author <strong className="text-white">Sandeep Sahni</strong>, Sahayak Books exists to empower readers of all ages with practical wisdom, financial clarity, life lessons, and personal growth.
        </p>
      </div>

      {/* Mission & Vision Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0B192C] text-[#C5A059] flex items-center justify-center shadow-sm">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0B192C]">Our Mission</h2>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-serif">
            To provide young adults, parents, professionals, and lifelong learners with insightful, engaging, and practical books that simplify complex ideas and inspire purposeful living.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C5A059] text-[#0B192C] flex items-center justify-center shadow-sm">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0B192C]">Our Vision</h2>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-serif">
            To be a beloved publishing and author platform where readers find timeless wisdom, actionable life principles, and inspiring literature that stays with them for a lifetime.
          </p>
        </div>
      </div>

      {/* The 4 Pillars of Publishing Craftsmanship */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">
            Publishing Excellence
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#0B192C] mt-1">
            Our Publishing Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Thoughtful Curation',
              desc: 'Every chapter and concept is carefully crafted to ensure maximum clarity, relevance, and real-world usefulness.',
            },
            {
              title: 'Premium Print Quality',
              desc: 'Our books are printed on high-grade paper with durable bindings designed to withstand years of reading.',
            },
            {
              title: 'Actionable Takeaways',
              desc: 'We focus on clear, practical takeaways that readers can immediately apply in their daily lives and careers.',
            },
            {
              title: 'Accessible Formats',
              desc: 'Available in Paperback, Hardcover, and eBook editions to give every reader their preferred reading experience.',
            },
          ].map((pillar, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
              <span className="font-mono font-bold text-[#C5A059] text-xs">0{idx + 1}.</span>
              <h3 className="font-serif text-base font-bold text-[#0B192C]">{pillar.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory Council & Parent Company */}
      <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-stone-300 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <div className="text-xs font-bold uppercase text-[#C5A059]">Connect With Us</div>
          <h3 className="font-serif text-2xl font-bold text-[#0B192C]">
            Sahayak Associates
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Have questions about our books, bulk orders, speaking engagements, or author sessions? Reach out to our team directly.
          </p>
        </div>
        <button
          onClick={() => navigate('/contact')}
          className="px-6 py-3 rounded-xl bg-[#0B192C] text-[#C5A059] text-xs font-bold hover:bg-[#152A4A] transition-colors shrink-0 shadow-md"
        >
          Contact Our Team →
        </button>
      </div>
    </div>
  );
};
