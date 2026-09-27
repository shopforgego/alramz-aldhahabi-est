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
        <div className="p-6 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === 'returns' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">سياسة الاسترجاع والاستبدال واسترداد الأموال:</h4>
              <p>
                تخضع جميع عمليات الاسترجاع والاستبدال واسترداد الأموال في <strong>{storeConfig.storeNameAr}</strong> التابع لـ <strong>{storeConfig.companyNameAr}</strong> (سجل تجاري: {storeConfig.cr}) للضوابط المنصوص عليها في اللائحة التنفيذية لنظام التجارة الإلكترونية الصادر عن وزارة التجارة بالمملكة العربية السعودية واشتراطات بوابات الدفع الإلكتروني المعتمدة:
              </p>
              <ul className="list-disc pr-5 space-y-2 text-slate-400">
                <li>
                  <strong className="text-white">مهلة الاسترجاع:</strong> يحق للعميل طلب استرجاع المنتجات خلال <strong>7 أيام</strong> من تاريخ استلام الشحنة.
                </li>
                <li>
                  <strong className="text-white">مهلة الاستبدال:</strong> يحق للعميل طلب استبدال المنتج خلال <strong>14 يوماً</strong> من تاريخ الاستلام في حال وجود عيب مصنعي أو عدم مطابقة للمواصفات المطلوبة.
                </li>
                <li>
                  <strong className="text-white">حالة المنتج:</strong> يشترط أن تكون الساعات أو المجوهرات أو الإكسسوارات في حالتها الأصلية الجديدة وغير مستخدمة إطلاقاً، ومرفقة بكامل ملحقاتها، الصندوق الفاخر الأصلي، بطاقات الضمان، والشهادات الرسمية.
                </li>
                <li>
                  <strong className="text-white">استرداد مباشر للمبالغ:</strong> تتم معالجة وإيداع المبالغ المستردة تلقائياً بنفس وسيلة الدفع الأصلية (مدى، فيزا، ماستركارد، أبل باي، بيزاتي) خلال مدة تتراوح بين <strong>3 إلى 7 أيام عمل</strong> بعد فحص المنتج والتأكد من سلامته.
                </li>
                <li>
                  <strong className="text-white">تكاليف الشحن:</strong> في حال وجود عيب مصنعي أو خطأ في الطلب، تتحمل المؤسسة تكاليف شحن الإرجاع والتوصيل البديل بالكامل دون أي رسوم إضافية على العميل.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">سياسة الشحن والتوصيل لجميع مناطق المملكة:</h4>
              <p>
                نحرص في <strong>{storeConfig.companyNameAr}</strong> على توفير شحن وتوصيل فائق السرعة والأمان لكافة طلبات الساعات والمجوهرات الثمينة بالتعاون مع كبرى شركات الشحن والخدمات اللوجستية المعتمدة رسمياً في المملكة العربية السعودية:
              </p>
              <ul className="list-disc pr-5 space-y-2 text-slate-400">
                <li>
                  <strong className="text-white">شركاء الشحن المعتمدون:</strong> سمسا إكسبريس (SMSA Express)، أرامكس (Aramex)، والبريد السعودي (سبل SPL).
                </li>
                <li>
                  <strong className="text-white">مدة التوصيل:</strong> التوصيل داخل مدينة <strong>جدة</strong> والمدن الرئيسية يتم خلال <strong>24 إلى 48 ساعة عمل</strong>، ولباقي مدن ومحافظات المملكة خلال <strong>2 إلى 4 أيام عمل</strong> كحد أقصى.
                </li>
                <li>
                  <strong className="text-white">الشحن المجاني:</strong> شحن مجاني وتلقائي لكافة مناطق المملكة لجميع الطلبات التي تتجاوز قيمتها <strong>{storeConfig.freeShippingThreshold} {storeConfig.currencySymbol}</strong>.
                </li>
                <li>
                  <strong className="text-white">رسوم الشحن للطلبات الأقل:</strong> يتم تطبيق رسوم توصيل رمزية ثابتة قدرها <strong>{storeConfig.shippingCost} {storeConfig.currencySymbol}</strong> فقط.
                </li>
                <li>
                  <strong className="text-white">تغليف آمن وتتبع لحظي:</strong> يتم تغليف كل قطعة ثمينة داخل عبوة مبطنة ومحكمة الإغلاق ومؤمنة بالكامل، مع إرسال رابط التتبع المباشر إلى رقم جوال العميل عبر الرسائل النصية وواتساب فور تسليم الشحنة للناقل.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">الشروط والأحكام العامة:</h4>
              <p>
                باستخدامك لموقع <strong>{storeConfig.storeNameAr}</strong> التابع لـ <strong>{storeConfig.companyNameAr}</strong> (سجل تجاري رقم: {storeConfig.cr}) ومقرها الرئيسي: {storeConfig.city}، فإنك توافق على الالتزام بالشروط والأحكام التالية:
              </p>
              <ul className="list-disc pr-5 space-y-2 text-slate-400">
                <li>
                  <strong className="text-white">الأسعار والعملة:</strong> جميع الأسعار المعروضة في المتجر بالريال السعودي ({storeConfig.currencySymbol})، وتشمل كافة الضرائب أو الرسوم المقررة نظاماً.
                </li>
                <li>
                  <strong className="text-white">أصالة المنتجات والضمان:</strong> كافة الساعات والمجوهرات المعروضة أصلية 100% وتخضع لضمان الجودة الرسمي المعتمد ضد أي عيوب مصنعية.
                </li>
                <li>
                  <strong className="text-white">تأكيد الطلبات:</strong> يعتبر الطلب مؤكداً بعد إتمام عملية الدفع بنجاح عبر إحدى بوابات الدفع الإلكتروني المعتمدة وتلقي رسالة التأكيد برقم الطلب.
                </li>
                <li>
                  <strong className="text-white">حقوق الملكية الفكرية:</strong> جميع العلامات التجارية والشعارات والتصاميم والصور المعروضة في الموقع مملوكة رسمياً للمؤسسة ولا يجوز استنساخها أو استخدامها لأغراض تجارية دون إذن كتابي مسبق.
                </li>
                <li>
                  <strong className="text-white">القانون الواجب التطبيق:</strong> تخضع هذه الاتفاقية وكافة المعاملات المنفذة عبر المتجر لأنظمة وقوانين المملكة العربية السعودية، وتختص الجهات القضائية السعودية بالفصل في أي نزاع.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">سياسة الخصوصية وحماية بيانات العملاء:</h4>
              <p>
                تولي <strong>{storeConfig.companyNameAr}</strong> أقصى درجات الاهتمام لسرية وأمان بيانات عملائها، وتلتزم بأحكام <strong>نظام حماية البيانات الشخصية (PDPL)</strong> الصادر في المملكة العربية السعودية:
              </p>
              <ul className="list-disc pr-5 space-y-2 text-slate-400">
                <li>
                  <strong className="text-white">البيانات التي نجمعها:</strong> نجمع فقط البيانات الضرورية لإتمام عمليات الشراء والشحن والتواصل (الاسم، رقم الجوال، عنوان التوصيل، والبريد الإلكتروني).
                </li>
                <li>
                  <strong className="text-white">حماية المدفوعات والبطاقات:</strong> لا يتم تخزين أو حفظ أي أرقام لبطاقات مدى أو البطاقات الائتمانية على خوادمنا نهائياً. تتم معالجة المدفوعات عبر بوابات دفع بنكية مشفرة ومعتمدة وفق أعلى معايير الأمان العالمية (PCI-DSS) وبروتوكول التشفير الآمن SSL/TLS 256-bit.
                </li>
                <li>
                  <strong className="text-white">عدم مشاركة البيانات:</strong> نلتزم التزاماً تاماً بعدم بيع أو تأجير أو مشاركة بيانات عملائنا مع أي جهات تسويقية خارجية، ويقتصر استخدامها حصراً على تنفيذ طلبك عبر شركات الشحن المرخصة.
                </li>
                <li>
                  <strong className="text-white">حقوق العميل:</strong> يحق للعميل طلب الاطلاع على بياناته أو تعديلها أو حذفها في أي وقت عبر التواصل مع فريق خدمة العملاء على البريد: <span className="text-amber-400">{storeConfig.email}</span> أو عبر الواتساب: <span className="text-amber-400" dir="ltr">+{storeConfig.whatsapp}</span>.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
