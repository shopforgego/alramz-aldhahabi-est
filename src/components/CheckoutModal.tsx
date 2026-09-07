import React, { useState } from 'react';
import { X, ShieldCheck, Lock, CreditCard, Banknote, CheckCircle, Truck } from 'lucide-react';
import { CartItem } from '../types/store';
import { storeConfig } from '../config/store';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (orderData: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'apple_pay' | 'payzaty' | 'cod'>('mada');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'جازان',
    district: '',
    street: '',
    notes: '',
  });

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= storeConfig.freeShippingThreshold;
  const shipping = isFreeShipping ? 0 : storeConfig.shippingCost;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.district) {
      alert('يرجى ملء جميع الحقول الإلزامية (الاسم، الجوال، الحي)');
      return;
    }
    const orderNumber = `WRD-${Math.floor(100000 + Math.random() * 900000)}`;
    onOrderSuccess({
      orderNumber,
      customer: formData,
      items,
      total,
      paymentMethod,
      date: new Date().toLocaleDateString('ar-SA'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">إتمام الطلب والدفع الآمن</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Customer Info */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">1. بيانات التوصيل والاستلام</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="مثال: عبدالله محمد"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">رقم الجوال *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">المدينة *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">الحي والشارع *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="اسم الحي ورقم الشارع"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">2. طريقة الدفع المفضلة</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition ${
                paymentMethod === 'mada' ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}>
                <input type="radio" name="payment" checked={paymentMethod === 'mada'} onChange={() => setPaymentMethod('mada')} className="hidden" />
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">بطاقة مدى / فيزا</span>
              </label>

              <label className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition ${
                paymentMethod === 'apple_pay' ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}>
                <input type="radio" name="payment" checked={paymentMethod === 'apple_pay'} onChange={() => setPaymentMethod('apple_pay')} className="hidden" />
                <span className="text-base font-black mb-0.5"> Pay</span>
                <span className="text-xs font-bold">Apple Pay</span>
              </label>


              <label className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition ${
                paymentMethod === 'cod' ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                <Banknote className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">عند الاستلام</span>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>قيمة المنتجات ({items.length} قطع):</span>
              <span className="font-bold text-slate-200">{subtotal.toFixed(2)} {storeConfig.currencySymbol}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>الشحن:</span>
              <span className={shipping === 0 ? "text-emerald-400 font-bold" : "text-slate-200 font-bold"}>
                {shipping === 0 ? "مجاني" : `${shipping.toFixed(2)} ${storeConfig.currencySymbol}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
              <span>المبلغ المستحق للدفع:</span>
              <span className="text-amber-400">{total.toFixed(2)} {storeConfig.currencySymbol}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 text-sm"
          >
            تأكيد الطلب والدفع الفوري ({total.toFixed(2)} {storeConfig.currencySymbol})
          </button>
        </form>
      </div>
    </div>
  );
};
