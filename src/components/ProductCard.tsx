import React from 'react';
import { ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../types/store';
import { storeConfig } from '../config/store-config';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, onAddToCart }) => {
  const discountPercent = product.regular_price && product.regular_price > product.price
    ? Math.round(((product.regular_price - product.price) / product.regular_price) * 100)
    : null;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden hover:shadow-xl hover:border-stone-300 transition-all duration-300 flex flex-col justify-between">
      
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={product.main_image || product.image || (product.images && product.images[0]) || '/logo.png'}
          alt={product.name || product.title}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
          {discountPercent ? (
            <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-sm">
              خصم {discountPercent}%
            </span>
          ) : (
            <span className="bg-stone-900/80 backdrop-blur-xs text-white font-bold text-[11px] px-2.5 py-1 rounded-full shadow-sm">
              جديد
            </span>
          )}
          {product.brand && (
            <span className="bg-white/90 backdrop-blur-xs text-stone-800 font-semibold text-[10px] px-2 py-0.5 rounded-md border border-stone-200">
              {product.brand}
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="p-3 bg-white text-stone-900 rounded-full shadow-lg hover:bg-stone-100 hover:scale-110 transition-all"
            title="نظرة سريعة"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="truncate max-w-[150px] font-medium text-stone-400">
              {product.category || 'عام'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.9</span>
            </div>
          </div>

          <h3 
            onClick={() => onQuickView(product)}
            className="font-bold text-stone-900 text-sm line-clamp-2 hover:text-amber-600 cursor-pointer transition-colors leading-snug"
            title={product.name || product.title}
          >
            {product.name || product.title}
          </h3>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-base sm:text-lg text-stone-900">
                {product.price}
              </span>
              <span className="text-xs font-bold text-stone-500">
                {storeConfig.currencySymbol}
              </span>
            </div>
            {product.regular_price && product.regular_price > product.price && (
              <span className="text-xs text-stone-400 line-through">
                {product.regular_price} {storeConfig.currencySymbol}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            title="إضافة إلى السلة"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </button>
        </div>

      </div>

    </div>
  );
};
