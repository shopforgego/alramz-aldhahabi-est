import React from 'react';
import { ShieldCheck, Truck, Sparkles, ArrowLeft } from 'lucide-react';
import { storeConfig } from '../config/store';

interface HeroProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  productsCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  productsCount,
}) => {
  return (
    <div className="bg-gradient-to-b from-[#064e3b] via-[#033629] to-[#022018] text-white border-b border-current/10 pt-8 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/20 border border-current/10 text-xs font-bold mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>👑 تشكيلة الملوك والأمراء 2026</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 tracking-tight">
              فخامة استثنائية من الساعات والمجوهرات المرصعة
            </h1>

            <p className="text-sm sm:text-base opacity-90 mb-6 leading-relaxed max-w-2xl font-normal">
              تشكيلة حصرية من أرقى الساعات السويسرية واليابانية والمجوهرات الفاخرة بضمان رسمي معتمد - مرحباً بكم في <strong className="underline decoration-current/30">{storeConfig.companyNameAr}</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#products-grid"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition transform active:scale-95"
              >
                <span>تسوق التشكيلة الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </a>
              <span className="text-xs opacity-75">متوفر أكثر من <strong>{productsCount} منتجاً</strong> معتمد</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-500/40 group">
              <img
                src="/images/hero-banner.jpg"
                alt={storeConfig.storeNameAr}
                className="w-full h-72 sm:h-80 object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-bold opacity-80 mb-1">{storeConfig.companyNameAr}</span>
                <h3 className="text-base font-extrabold">{storeConfig.taglineAr}</h3>
                <p className="text-[11px] opacity-75 mt-1">السجل التجاري: {storeConfig.cr} • المقر: {storeConfig.city}</p>
              </div>
            </div>
          </div>
        </div>

        <div id="products-grid" className="mt-8 pt-6 border-t border-current/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? ' bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/20 '
                  : 'bg-black/10 hover:bg-black/20 border border-current/10 opacity-80'
              }`}
            >
              جميع المنتجات ({productsCount})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? ' bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/20 '
                    : 'bg-black/10 hover:bg-black/20 border border-current/10 opacity-80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
