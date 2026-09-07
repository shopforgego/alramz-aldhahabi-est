import React from 'react';
import { CheckCircle, Printer, ShoppingBag } from 'lucide-react';
import { storeConfig } from '../config/store-config';

interface OrderSuccessModalProps {
  orderData: any;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ orderData, onClose }) => {
  if (!orderData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 text-center space-y-5">
        
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-stone-900">
            تم استلام وتأكيد طلبك بنجاح!
          </h3>
          <p className="text-xs text-stone-500">
            شكراً لثقتكم بـ {storeConfig.storeNameAr} - {storeConfig.companyNameAr}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-right text-xs space-y-2">
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500">رقم الطلب والفاتورة:</span>
            <span className="font-mono font-bold text-stone-900">{orderData.orderRef}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">الاسم:</span>
            <span className="font-semibold text-stone-900">{orderData.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">مدينة التوصيل:</span>
            <span className="font-semibold text-stone-900">{orderData.city} - {orderData.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">طريقة الدفع:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">معتمد ومؤكد</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-stone-200 font-bold text-stone-950">
            <span>المبلغ الإجمالي:</span>
            <span className="text-amber-700 font-black text-sm">{orderData.total.toFixed(2)} {storeConfig.currencySymbol}</span>
          </div>
        </div>

        <p className="text-[11px] text-stone-400">
          تم إرسال تفاصيل الفاتورة ورابط تتبع الشحنة إلى جوالك عبر الرسائل النصية.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الفاتورة</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>متابعة التسوق</span>
          </button>
        </div>

      </div>
    </div>
  );
};
