import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types/store';
import { storeConfig } from '../config/store-config';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = promoApplied ? subtotal * 0.1 : 0;
  const isFreeShipping = subtotal >= storeConfig.freeShippingThreshold;
  const shippingCost = isFreeShipping || subtotal === 0 ? 0 : storeConfig.shippingCost;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const remainingForFreeShipping = Math.max(0, storeConfig.freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / storeConfig.freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        
        {/* Cart Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-base text-stone-900">
              سلة المشتريات ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-amber-50/80 p-3 px-5 border-b border-amber-200/60 text-xs">
          {isFreeShipping ? (
            <div className="text-emerald-700 font-bold text-center">
              🎉 مبروك! لقد حصلت على شحن مجاني لكافة مدن المملكة!
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-stone-700">
                <span>أضف بقيمة <strong>{remainingForFreeShipping.toFixed(2)} {storeConfig.currencySymbol}</strong> للشحن المجاني</span>
                <span className="font-bold text-amber-700">{progressPercent}%</span>
              </div>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-stone-800 text-base">سلة التسوق فارغة</h4>
              <p className="text-xs text-stone-500 max-w-xs">
                تصفح تشكيلاتنا الفاخرة واختر المنتجات التي ترغب في شرائها بكل سهولة.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800"
              >
                تصفح المنتجات الآن
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3.5 p-3 rounded-2xl border border-stone-200 bg-stone-50/40 hover:bg-white transition-colors"
              >
                <img
                  src={item.product.main_image || item.product.image || '/logo.png'}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-2 leading-snug">
                      {item.product.name || item.product.title}
                    </h4>
                    <div className="text-xs font-black text-amber-700 mt-1">
                      {item.product.price} {storeConfig.currencySymbol}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-bold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-100 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/90 space-y-3">
            
            {/* Promo Code Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="كود الخصم (جرب: SAUDI10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white uppercase font-bold"
              />
              <button
                onClick={() => {
                  if (promoCode.trim()) {
                    setPromoApplied(true);
                  }
                }}
                className="px-4 py-2 bg-stone-800 text-white rounded-xl text-xs font-bold hover:bg-stone-900"
              >
                تطبيق
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-1">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-stone-900">{subtotal.toFixed(2)} {storeConfig.currencySymbol}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>خصم كود الترويج (10%):</span>
                  <span>-{discountAmount.toFixed(2)} {storeConfig.currencySymbol}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>رسوم الشحن:</span>
                <span>{isFreeShipping ? 'مجاني' : `${shippingCost} ${storeConfig.currencySymbol}`}</span>
              </div>
              <div className="flex justify-between text-stone-400 text-[11px]">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span>مشمولة في الأسعار</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-stone-950 pt-2 border-t border-stone-200">
                <span>الإجمالي النهائي:</span>
                <span className="text-amber-700 font-black">{grandTotal.toFixed(2)} {storeConfig.currencySymbol}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => { onClose(); onCheckout(); }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:scale-101 active:scale-99 transition-all"
            >
              <span>متابعة إتمام الطلب</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>دفع إلكتروني آمن ومشفر 100%</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
