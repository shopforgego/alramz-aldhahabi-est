import React from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { storeConfig } from '../config/store';
import { Logo } from './Logo';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#064e3b] text-white border-b border-[#047857]/50 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <a href="#" className="flex-shrink-0">
            <Logo />
          </a>

          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الكتالوج، الماركة، أو اسم المنتج..."
                className="w-full bg-black/10 border border-current/20 rounded-xl py-2.5 pr-10 pl-4 text-xs placeholder-current/50 focus:outline-none focus:ring-2 focus:ring-current/30 transition"
              />
              <Search className="absolute right-3.5 top-3 w-4 h-4 opacity-60" />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/20 px-4 py-2.5 rounded-xl transition transform active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold">السلة</span>
              {cartCount > 0 && (
                <span className="bg-black text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتجاتك المفضلة..."
              className="w-full bg-black/10 border border-current/20 rounded-xl py-2 pr-9 pl-3 text-xs placeholder-current/50 focus:outline-none"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 opacity-60" />
          </div>
        </div>
      </div>
    </header>
  );
};
