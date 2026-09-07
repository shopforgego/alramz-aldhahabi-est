import React from 'react';
import { Sparkles, ArrowLeft, Truck, RefreshCw, Award } from 'lucide-react';
import { storeConfig } from '../config/store-config';

interface HeroProps {
  onShopClick: () => void;
  productsCount: number;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, productsCount }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-white pt-10 pb-16 lg:py-20 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>تشكيلة الساعات والمجوهرات الفاخرة لعام 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              فخامة استثنائية تليق بذوقك الرفيع
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
              اكتشف أحدث الساعات الكلاسيكية والذكية والمجوهرات المرصعة بتصاميم استثنائية وضمان رسمي معتمد.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-stone-300">
              <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
                <Award className="w-4 h-4 text-amber-400" />
                منتجات أصلية 100%
              </span>
              <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
                <Truck className="w-4 h-4 text-emerald-400" />
                توصيل سريع لكافة المناطق
              </span>
              <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
                <RefreshCw className="w-4 h-4 text-sky-400" />
                استبدال واسترجاع ميسر
              </span>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onShopClick}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:scale-102 active:scale-98 transition-all"
              >
                <span>استكشف الكتالوج الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="text-xs text-stone-400 font-medium">
                متوفر أكثر من <strong className="text-white">{productsCount} منتجاً</strong> جاهز للشحن الفوري
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-black/50 bg-stone-800 aspect-4/3 group">
                <img 
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop" 
                  alt={storeConfig.storeNameAr} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                <div className="absolute bottom-4 right-4 left-4 p-4 rounded-xl bg-stone-900/90 backdrop-blur-md border border-white/10 text-right">
                  <div className="text-xs font-semibold text-amber-400">{storeConfig.companyNameAr}</div>
                  <div className="text-sm font-bold text-white mt-0.5">{storeConfig.taglineAr}</div>
                  <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-2">
                    <span>السجل التجاري: {storeConfig.cr}</span>
                    <span>•</span>
                    <span>المقر: {storeConfig.city}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
