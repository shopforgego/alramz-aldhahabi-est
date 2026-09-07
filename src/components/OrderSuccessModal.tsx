import React from 'react';
import { CheckCircle2, MessageCircle, ArrowRight, Printer } from 'lucide-react';
import { storeConfig } from '../config/store';

interface OrderSuccessModalProps {
  orderData: any;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderData,
  onClose,
}) => {
  if (!orderData) return null;

  const whatsappMsg = encodeURIComponent(
    `مرحباً ${storeConfig.companyNameAr}، أود تأكيد طلبي رقم: ${orderData.orderNumber}\nالاسم: ${orderData.customer.fullName}\nالإجمالي: ${orderData.total} ${storeConfig.currencySymbol}`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white mb-1">تم تأكيد طلبك بنجاح!</h3>
        <p className="text-xs text-slate-400 mb-4">شكراً لتسوقك من {storeConfig.storeNameAr}</p>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-right mb-5 space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">رقم الفاتورة والطلب:</span>
            <span className="font-mono font-black text-amber-400">{orderData.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">المستلم:</span>
            <span className="text-white font-bold">{orderData.customer.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">مدينة التوصيل:</span>
            <span className="text-white font-bold">{orderData.customer.city} - {orderData.customer.district}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-2 font-black text-sm">
            <span className="text-white">الإجمالي المدفوع:</span>
            <span className="text-amber-400">{orderData.total.toFixed(2)} {storeConfig.currencySymbol}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <a
            href={`https://wa.me/${storeConfig.whatsapp}?text=${whatsappMsg}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>متابعة حالة الشحن عبر واتساب</span>
          </a>

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition"
          >
            <span>العودة للرئيسية ومواصلة التسوق</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
