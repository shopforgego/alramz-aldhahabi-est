import React, { useState } from 'react';
import { X, ShoppingCart, ShieldCheck, Truck, RotateCcw, Check, Star } from 'lucide-react';
import { Product } from '../types/store';
import { storeConfig } from '../config/store';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(product.main_image || product.image);

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.main_image || product.image];

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
              <img
                src={selectedImg}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 ${
                      selectedImg === img ? 'border-amber-500' : 'border-slate-800'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-2">
                <span>{product.category}</span>
                {product.brand && <span>• {product.brand}</span>}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white mb-3 leading-snug">
                {product.title}
              </h2>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  {product.price.toFixed(2)} {storeConfig.currencySymbol}
                </span>
                {product.regular_price && product.regular_price > product.price && (
                  <span className="text-sm text-slate-500 line-through">
                    {product.regular_price.toFixed(2)} {storeConfig.currencySymbol}
                  </span>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 mb-4">
                <h4 className="text-xs font-bold text-slate-300 mb-1.5">وصف القطعة والمواصفات:</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-h-36 overflow-y-auto">
                  {product.description}
                </p>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mb-6">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>متوفر في المستودع جاهز للشحن</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>ضمان رسمي معتمد</span>
                </div>
              </div>
            </div>

            {/* Quantity & Add */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-slate-300 hover:text-white font-bold"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-bold text-amber-400">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-slate-300 hover:text-white font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 px-6 rounded-xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 text-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>إضافة إلى السلة ({ (product.price * quantity).toFixed(2) } {storeConfig.currencySymbol})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
