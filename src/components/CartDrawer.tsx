import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, Tag, Truck } from 'lucide-react';
import { CartItem } from '../types/store';
import { storeConfig } from '../config/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= storeConfig.freeShippingThreshold;
  const shipping = items.length === 0 ? 0 : (isFreeShipping ? 0 : storeConfig.shippingCost);
  const total = Math.max(0, subtotal - discount + shipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'WAROOD10' || coupon.trim().toUpperCase() === 'CARS10') {
      const disc = subtotal * 0.1;
      setDiscount(disc);
      setCouponApplied(true);
    } else {
      alert('كوبون الخصم غير صالح. جرب استخدام: WAROOD10');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-start">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">سلة المشتريات ({items.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-slate-950 p-3 border-b border-slate-800 text-xs">
          {isFreeShipping ? (
            <div className="text-emerald-400 font-bold flex items-center gap-1.5 justify-center">
              <Truck className="w-4 h-4" />
              <span>مبروك! لقد حصلت على شحن مجاني لكافة مدن المملكة 🎉</span>
            </div>
          ) : (
            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-medium">
                <span>أضف بـ <strong className="text-amber-400">{(storeConfig.freeShippingThreshold - subtotal).toFixed(2)} {storeConfig.currencySymbol}</strong> للشحن المجاني</span>
                <span>{Math.round((subtotal / storeConfig.freeShippingThreshold) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / storeConfig.freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-16 h-16 text-slate-700 mb-3" />
              <p className="font-bold text-slate-300 mb-1">سلة المشتريات فارغة</p>
              <p className="text-xs text-slate-500 mb-4">تصفح الكتالوج وأضف قطع الغيار التي تحتاجها لسيارتك</p>
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-950 border border-slate-800/80 p-3 rounded-2xl flex gap-3 items-center"
              >
                <img
                  src={item.product.main_image || item.product.image}
                  alt={item.product.title}
                  className="w-16 h-16 object-cover rounded-xl border border-slate-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-white truncate mb-1">{item.product.title}</h4>
                  <div className="text-xs font-black text-amber-400">
                    {item.product.price.toFixed(2)} {storeConfig.currencySymbol}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg text-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-slate-300 hover:text-white"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-bold text-amber-400">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-slate-300 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition"
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
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
            {/* Coupon */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="كود الخصم (WAROOD10)"
                disabled={couponApplied}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={couponApplied}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition"
              >
                {couponApplied ? 'مطبق ✓' : 'تطبيق'}
              </button>
            </form>

            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="text-slate-200 font-bold">{subtotal.toFixed(2)} {storeConfig.currencySymbol}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>خصم الكوبون (10%):</span>
                  <span>-{discount.toFixed(2)} {storeConfig.currencySymbol}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>الشحن والتوصيل:</span>
                <span className={shipping === 0 ? "text-emerald-400 font-bold" : "text-slate-200"}>
                  {shipping === 0 ? "مجاني" : `${shipping.toFixed(2)} ${storeConfig.currencySymbol}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>الإجمالي النهائي:</span>
                <span className="text-amber-400 text-base">{total.toFixed(2)} {storeConfig.currencySymbol}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 text-sm"
            >
              <span>متابعة إتمام الطلب والدفع</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
