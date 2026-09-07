import React, { useState } from 'react';
import { X, RefreshCw, Truck, FileText, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { storeConfig } from '../config/store-config';

interface PoliciesModalProps {
  isOpen: boolean;
  initialTab?: string;
  onClose: () => void;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  isOpen,
  initialTab = 'about',
  onClose
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-base sm:text-lg text-stone-900">
              الاعتماد والسياسات الرسمية | {storeConfig.companyNameAr}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 overflow-x-auto bg-stone-100/60 p-2 gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'about' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            من نحن والاعتماد التجاري
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'return' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            سياسة الاستبدال والاسترجاع
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'shipping' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            سياسة الشحن والتوصيل
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'terms' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            الشروط والخصوصية
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'contact' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            تواصل معنا
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 text-stone-700 text-sm leading-relaxed">
          
          {/* 1. About */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <h4 className="font-bold text-base text-stone-900 mb-2">بيانات التوثيق والاعتماد التجاري</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div><strong>اسم المنشأة:</strong> {storeConfig.companyNameAr}</div>
                  <div><strong>الاسم بالإنجليزية:</strong> {storeConfig.companyNameEn}</div>
                  <div><strong>السجل التجاري (CR):</strong> <span className="font-mono font-bold">{storeConfig.cr}</span></div>
                  <div><strong>الرقم الضريبي (VAT):</strong> <span className="font-mono font-bold">{storeConfig.taxNumber}</span></div>
                  <div><strong>العنوان الوطني المختصر:</strong> {storeConfig.shortAddress}</div>
                  <div><strong>المدينة والمقر:</strong> {storeConfig.fullAddress}</div>
                </div>
              </div>

              <p>
                نحن في <strong>{storeConfig.storeNameAr}</strong> نفخر بتقديم أجود المنتجات الأصلية والمميزة وفق أعلى معايير الجودة والخدمة لعملائنا في كافة مناطق المملكة العربية السعودية. جميع منتجاتنا معتمدة ومطابقة للاشتراطات والمواصفات القياسية.
              </p>
            </div>
          )}

          {/* 2. Return & Exchange Policy */}
          {activeTab === 'return' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-stone-900">
                <RefreshCw className="w-5 h-5 text-amber-600" />
                <span>سياسة الاستبدال والاسترجاع المعتمدة</span>
              </div>
              <p>حرصاً منا على تقديم أفضل تجربة تسوق ورضا تام لعملائنا، تخضع عمليات الاسترجاع والاستبدال للشروط التالية وفق نظام التجارة الإلكترونية السعودي:</p>
              <ul className="list-disc pr-5 space-y-2 text-xs">
                <li>يحق للعميل استرجاع أو استبدال المنتجات خلال <strong>14 يوماً</strong> من تاريخ استلام الطلب.</li>
                <li>يشترط أن يكون المنتج بحالته الأصلية، غير مستخدم، وبكامل ملحقاته وتغليفه الأصلي.</li>
                <li>في حال وجود عيب مصنعي أو خطأ في الطلب، يتحمل المتجر كافة تكاليف الشحن والاسترجاع دون أي رسوم على العميل.</li>
                <li>يتم استرجاع المبلغ إلى نفس وسيلة الدفع المستخدمة خلال 3 إلى 7 أيام عمل من وصول المنتج والتأكد من سلامته.</li>
              </ul>
            </div>
          )}

          {/* 3. Shipping Policy */}
          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-stone-900">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>سياسة الشحن والتوصيل لكافة مدن المملكة</span>
              </div>
              <ul className="list-disc pr-5 space-y-2 text-xs">
                <li>يتم شحن وتوصيل الطلبات عبر شركات الشحن المعتمدة (أرامكس، سمسا، ريد بوكس).</li>
                <li>الشحن <strong>مجاني بالكامل</strong> لجميع الطلبات التي تتجاوز قيمتها <strong>{storeConfig.freeShippingThreshold} {storeConfig.currencySymbol}</strong>.</li>
                <li>رسوم الشحن للطلبات الأقل هي {storeConfig.shippingCost} {storeConfig.currencySymbol} فقط.</li>
                <li>مدة التوصيل: من 24 إلى 48 ساعة داخل المدن الرئيسية (الرياض، جدة، مكة، الدمام)، ومن 2 إلى 4 أيام لبقية مدن ومحافظات المملكة.</li>
              </ul>
            </div>
          )}

          {/* 4. Terms & Privacy */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-stone-900">
                <FileText className="w-5 h-5 text-sky-600" />
                <span>الشروط والأحكام وسياسة الخصوصية</span>
              </div>
              <p className="text-xs">
                نلتزم في {storeConfig.companyNameAr} بحماية بيانات وخصوصية عملائنا. جميع المعاملات المالية ومعلومات البطاقات البنكية مشفرة بأحدث بروتوكولات الأمان SSL ولا يتم تخزين أي أرقام بطاقات سرية لدينا.
              </p>
            </div>
          )}

          {/* 5. Contact Us */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h4 className="font-bold text-base text-stone-900">قنوات التواصل وخدمة العملاء</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold text-stone-900">الهاتف والواتساب</div>
                    <div className="text-stone-600 mt-1 font-mono text-sm">{storeConfig.phone}</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-stone-900">البريد الإلكتروني</div>
                    <div className="text-stone-600 mt-1 font-mono">{storeConfig.email}</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3 sm:col-span-2">
                  <MapPin className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-bold text-stone-900">المقر الرئيسي</div>
                    <div className="text-stone-600 mt-1">{storeConfig.fullAddress}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
