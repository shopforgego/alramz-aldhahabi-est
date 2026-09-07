import React from 'react';
import { X, RotateCcw, Truck, FileCheck, ShieldCheck } from 'lucide-react';
import { storeConfig } from '../config/store';

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'returns' | 'shipping' | 'terms' | 'privacy';
  setActiveTab: (tab: 'returns' | 'shipping' | 'terms' | 'privacy') => void;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="font-extrabold text-base text-white">السياسات والضمان - {storeConfig.companyNameAr}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('returns')}
            className={`flex items-center gap-1.5 px-4 py-3 font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'returns' ? 'border-amber-500 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            الاستبدال والاسترجاع
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex items-center gap-1.5 px-4 py-3 font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'shipping' ? 'border-amber-500 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            الشحن والتوصيل
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 px-4 py-3 font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'terms' ? 'border-amber-500 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            الشروط والأحكام
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 px-4 py-3 font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'privacy' ? 'border-amber-500 text-amber-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            سياسة الخصوصية
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto space-y-3">
          {activeTab === 'returns' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">سياسة استبدال واسترجاع قطع غيار السيارات:</h4>
              <p>حرصاً من <strong>{storeConfig.companyNameAr}</strong> على تقديم أعلى درجات الثقة لعملائنا، تخضع كافة قطع الغيار والإكسسوارات لسياسة استبدال واسترجاع مرنة وفق لوائح وزارة التجارة السعودية:</p>
              <ul className="list-disc pr-5 space-y-1.5 text-slate-400">
                <li>يحق للعميل استرجاع أو استبدال القطعة خلال <strong>14 يوماً</strong> من تاريخ الاستلام.</li>
                <li>يشترط أن تكون القطعة في حالتها الأصلية غير مركبة ولم تتعرض للتجريح أو التعديل، مع وجود الكرتون والتغليف الأصلي.</li>
                <li>في حال وجود عيب مصنعي أو عدم تطابق مع موديل السيارة المطلوب، يتم الاستبدال أو استرداد كامل المبلغ شامل تكلفة الشحن فوراً.</li>
                <li>تتم معالجة المبالغ المستردة بنفس وسيلة الدفع الأصلية خلال 3 إلى 7 أيام عمل.</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">سياسة الشحن والتوصيل لجميع مناطق المملكة:</h4>
              <p>نعمل مع كبرى شركات الشحن اللوجستية المعتمدة (أرامكس، سمسا، سبل) لتوصيل طلباتكم بأمان:</p>
              <ul className="list-disc pr-5 space-y-1.5 text-slate-400">
                <li>مدة التوصيل لمدينة جازان والمناطق الرئيسية: من <strong>24 إلى 48 ساعة</strong>.</li>
                <li>مدة التوصيل لباقي مدن ومحافظات المملكة: من <strong>2 إلى 4 أيام عمل</strong>.</li>
                <li>الشحن مجاني للطلبات التي تتجاوز قيمتها <strong>{storeConfig.freeShippingThreshold} {storeConfig.currencySymbol}</strong>.</li>
                <li>يتم تزويد العميل برابط تتبع الشحنة فور تسليمها لمندوب الشحن عبر رسالة نصية وواتساب.</li>
              </ul>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">الشروط والأحكام العامة:</h4>
              <p>باستخدامك لموقع <strong>{storeConfig.storeNameAr}</strong> التابع لـ <strong>{storeConfig.companyNameAr}</strong> (سجل تجاري: {storeConfig.cr}):</p>
              <ul className="list-disc pr-5 space-y-1.5 text-slate-400">
                <li>كافة الأسعار المعروضة شاملة لضريبة القيمة المضافة (VAT) المقررة نظاماً بنسبة 15%.</li>
                <li>يرجى التأكد من مطابقة رقم هيكل السيارة (VIN) أو رقم القطعة (OEM Part Number) قبل التثبيت.</li>
                <li>يحتفظ المتجر بحق تعديل الأسعار والعروض الترويجية وفق حركة السوق والتحديثات الرسمية.</li>
              </ul>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">سياسة الخصوصية وحماية بيانات العملاء:</h4>
              <p>نلتزم في <strong>{storeConfig.companyNameAr}</strong> بحماية سرية وأمان بياناتك الشخصية ومعاملاتك المالية وفق نظام حماية البيانات الشخصية السعودي، ولا نشارك بياناتك مع أي طرف ثالث باستثناء شركات الشحن وبوابات الدفع لإتمام عملية الشراء فقط.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
