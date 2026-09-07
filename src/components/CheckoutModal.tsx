import React, { useState } from 'react';
import { X, ShieldCheck, Lock } from 'lucide-react';
import { CartItem } from '../types/store';
import { storeConfig } from '../config/store-config';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (orderData: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('الرياض');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'payzaty' | 'mada' | 'apple_pay' | 'tamara'>('payzaty');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= storeConfig.freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : storeConfig.shippingCost;
  const grandTotal = subtotal + shippingCost;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const orderRef = 'SA-' + Math.floor(100000 + Math.random() * 900000);
      const orderData = {
        orderRef,
        customerName: fullName || 'عميل المتجر',
        phone,
        email: email || storeConfig.email,
        city,
        address,
        paymentMethod,
        items: cartItems,
        total: grandTotal,
        date: new Date().toLocaleDateString('ar-SA')
      };
      setIsSubmitting(false);
      onOrderSuccess(orderData);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-base sm:text-lg text-stone-900">
              إتمام الطلب والدفع الآمن
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
          
          {/* Customer & Address Information */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center">1</span>
              بيانات العميل وعنوان الشحن
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فهد بن عبدالعزيز"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">رقم الجوال *</label>
                <input
                  type="tel"
                  required
                  placeholder="05XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 text-xs focus:bg-white focus:outline-hidden text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 text-xs focus:bg-white focus:outline-hidden text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">المدينة *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 text-xs focus:bg-white focus:outline-hidden"
                >
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="مكة المكرمة">مكة المكرمة</option>
                  <option value="المدينة المنورة">المدينة المنورة</option>
                  <option value="الدمام">الدمام</option>
                  <option value="الخبر">الخبر</option>
                  <option value="بريدة">بريدة / القصيم</option>
                  <option value="تبوك">تبوك</option>
                  <option value="أبها">أبها / عسير</option>
                  <option value="حائل">حائل</option>
                  <option value="جازان">جازان</option>
                  <option value="الطائف">الطائف</option>
                  <option value="الهفوف">الهفوف / الأحساء</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">الحي واسم الشارع *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حي الياسمين، شارع أنس بن مالك"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center">2</span>
              طريقة الدفع المعتمدة
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Payzaty */}
              <label className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                paymentMethod === 'payzaty' ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    value="payzaty"
                    checked={paymentMethod === 'payzaty'}
                    onChange={() => setPaymentMethod('payzaty')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <span>بوابة بيزاتي (Payzaty)</span>
                      <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">معتمد</span>
                    </div>
                    <div className="text-[11px] text-stone-500">مدى، فيزا، ماستركارد، آبل باي</div>
                  </div>
                </div>
              </label>

              {/* Mada */}
              <label className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                paymentMethod === 'mada' ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    value="mada"
                    checked={paymentMethod === 'mada'}
                    onChange={() => setPaymentMethod('mada')}
                    className="text-amber-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-stone-900">بطاقة مدى (Mada)</div>
                    <div className="text-[11px] text-stone-500">دفع محلي مباشر وفوري</div>
                  </div>
                </div>
              </label>

              {/* Apple Pay */}
              <label className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                paymentMethod === 'apple_pay' ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    value="apple_pay"
                    checked={paymentMethod === 'apple_pay'}
                    onChange={() => setPaymentMethod('apple_pay')}
                    className="text-amber-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-stone-900">Apple Pay</div>
                    <div className="text-[11px] text-stone-500">دفع سريع بلمسة واحدة</div>
                  </div>
                </div>
              </label>

              {/* Tamara */}
              <label className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                paymentMethod === 'tamara' ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    value="tamara"
                    checked={paymentMethod === 'tamara'}
                    onChange={() => setPaymentMethod('tamara')}
                    className="text-amber-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-stone-900">تمارا (Tamara)</div>
                    <div className="text-[11px] text-stone-500">قسمها على 4 دفعات بدون فوائد</div>
                  </div>
                </div>
              </label>

            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>المجموع الفرعي ({cartItems.length} منتجات):</span>
              <span className="font-bold text-stone-900">{subtotal.toFixed(2)} {storeConfig.currencySymbol}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>الشحن والتوصيل لـ {city}:</span>
              <span className="font-bold text-stone-900">{isFreeShipping ? 'مجاني' : `${shippingCost} ${storeConfig.currencySymbol}`}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-stone-950 pt-2 border-t border-stone-200">
              <span>المبلغ الإجمالي المستحق:</span>
              <span className="text-amber-700 font-black text-base">{grandTotal.toFixed(2)} {storeConfig.currencySymbol}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-black rounded-2xl text-sm shadow-lg flex items-center justify-center gap-2 hover:scale-101 active:scale-99 transition-all"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري تأكيد الطلب ومعالجة الدفع...
              </span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>تأكيد الطلب والدفع النهائي ({grandTotal.toFixed(2)} {storeConfig.currencySymbol})</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
