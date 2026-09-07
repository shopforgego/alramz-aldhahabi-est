import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, MessageCircle, ArrowUp } from 'lucide-react';
import { storeConfig } from '../config/store-config';

interface FooterProps {
  onOpenPolicies: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicies }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-14 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-850">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt={storeConfig.storeNameAr} 
                className="h-12 w-12 object-contain rounded-xl bg-white p-1 border border-stone-700" 
              />
              <div>
                <h3 className="text-lg font-black text-white">{storeConfig.storeNameAr}</h3>
                <p className="text-xs text-amber-400 font-medium">{storeConfig.companyNameAr}</p>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              {storeConfig.taglineAr}
            </p>

            <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>سجل تجاري معتمد: <strong className="text-white font-mono">{storeConfig.cr}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-center font-bold text-amber-400">#</span>
                <span>الرقم الضريبي: <strong className="text-white font-mono">{storeConfig.taxNumber}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>العنوان المختصر: <strong className="text-white font-mono">{storeConfig.shortAddress}</strong> ({storeConfig.city})</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-sm">روابط سريعة</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onOpenPolicies('about')} className="hover:text-white transition-colors">
                  من نحن والاعتماد
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicies('return')} className="hover:text-white transition-colors">
                  الاستبدال والاسترجاع
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicies('shipping')} className="hover:text-white transition-colors">
                  الشحن والتوصيل
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicies('terms')} className="hover:text-white transition-colors">
                  الشروط والأحكام
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicies('contact')} className="hover:text-white transition-colors">
                  تواصل معنا
                </button>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white text-sm">خدمة العملاء</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <a href={`tel:${storeConfig.phone}`} className="hover:text-white flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  {storeConfig.phone}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${storeConfig.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  محادثة واتساب مباشرة
                </a>
              </li>
              <li>
                <a href={`mailto:${storeConfig.email}`} className="hover:text-white flex items-center gap-1.5 font-mono text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  {storeConfig.email}
                </a>
              </li>
              <li className="text-[11px] text-stone-500 pt-1">
                {storeConfig.supportHours}
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-sm">وسائل الدفع المعتمدة</h4>
            <p className="text-xs text-stone-400">
              دفع آمن 100% متوافق مع معايير البنك المركزي السعودي ومزودي خدمات الدفع المرخصين.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-md text-xs font-bold text-stone-200">
                Payzaty
              </span>
              <span className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-md text-xs font-bold text-emerald-400">
                مدى Mada
              </span>
              <span className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-md text-xs font-bold text-stone-200">
                Apple Pay
              </span>
              <span className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-md text-xs font-bold text-amber-400">
                Visa / MC
              </span>
              <span className="px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-md text-xs font-bold text-rose-400">
                تمارا Tamara
              </span>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} <strong>{storeConfig.companyNameAr}</strong>. جميع الحقوق محفوظة.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800"
          >
            <span>العودة للأعلى</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
