import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Menu, X, MessageCircle } from 'lucide-react';
import { storeConfig } from '../config/store-config';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
  onOpenPolicies: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  onOpenPolicies
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Banner */}
      <div className="bg-stone-900 text-stone-100 text-xs py-2 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-600 text-white">
              عرض خاص
            </span>
            <span className="font-medium">
              شحن مجاني لكافة مدن المملكة للطلبات فوق {storeConfig.freeShippingThreshold} {storeConfig.currencySymbol}!
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-stone-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              سجل تجاري معتمد: <span className="font-mono text-white font-bold">{storeConfig.cr}</span>
            </span>
            <a 
              href={`https://wa.me/${storeConfig.whatsapp}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              خدمة العملاء واتساب
            </a>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Store Title */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group">
              <img 
                src="/logo.png" 
                alt={storeConfig.storeNameAr} 
                className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-xl border border-stone-200 shadow-xs p-1 bg-white group-hover:scale-105 transition-transform" 
              />
              <div className="flex flex-col">
                <span className="font-black text-lg sm:text-xl tracking-tight text-stone-900 group-hover:text-amber-600 transition-colors">
                  {storeConfig.storeNameAr}
                </span>
                <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                  {storeConfig.companyNameAr}
                </span>
              </div>
            </a>
          </div>

          {/* Search Bar Desktop */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث في المنتجات، الماركات، التصنيفات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-stone-900 placeholder-stone-400 text-sm rounded-full border border-stone-200 focus:border-stone-400 focus:outline-hidden transition-all"
              />
              <Search className="absolute right-3.5 top-3 w-4 h-4 text-stone-400 pointer-events-none" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-2.5 text-xs text-stone-400 hover:text-stone-700 bg-stone-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => onOpenPolicies('about')}
              className="hidden md:inline-flex items-center px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              عن المنشأة
            </button>
            <button
              onClick={() => onOpenPolicies('return')}
              className="hidden md:inline-flex items-center px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              الاستبدال والاسترجاع
            </button>

            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-full font-bold text-sm shadow-xs transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>السلة</span>
              {cartCount > 0 && (
                <span className="bg-amber-600 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-stone-200">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث في المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 bg-stone-100 text-sm rounded-xl border border-stone-300 focus:outline-hidden"
              />
              <Search className="absolute right-3.5 top-3 w-4 h-4 text-stone-400" />
            </div>
          </div>
        )}

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-stone-200 space-y-2 pb-2">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider px-2">الصفحات والسياسات</div>
            <button
              onClick={() => { onOpenPolicies('about'); setMobileMenuOpen(false); }}
              className="block w-full text-right px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
            >
              من نحن والاعتماد التجاري
            </button>
            <button
              onClick={() => { onOpenPolicies('return'); setMobileMenuOpen(false); }}
              className="block w-full text-right px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
            >
              سياسة الاستبدال والاسترجاع
            </button>
            <button
              onClick={() => { onOpenPolicies('shipping'); setMobileMenuOpen(false); }}
              className="block w-full text-right px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
            >
              سياسة الشحن والتوصيل
            </button>
            <button
              onClick={() => { onOpenPolicies('contact'); setMobileMenuOpen(false); }}
              className="block w-full text-right px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
            >
              تواصل معنا
            </button>
          </div>
        )}
      </div>

      {/* Categories Bar */}
      <div className="bg-stone-50 border-t border-stone-200/80 overflow-x-auto py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
            }`}
          >
            جميع المنتجات
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
