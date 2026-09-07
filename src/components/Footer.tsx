import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { storeConfig } from '../config/store';
import { Logo } from './Logo';

interface FooterProps {
  onOpenPolicies: (tab: 'returns' | 'shipping' | 'terms' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicies }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & CR */}
          <div className="space-y-3">
            <Logo />
            <p className="text-slate-400 text-xs leading-relaxed">
              {storeConfig.taglineAr}
            </p>
            <div className="pt-2 border-t border-slate-900 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>السجل التجاري الموحد: {storeConfig.cr}</span>
              </div>
              <div>الرقم الضريبي: {storeConfig.taxNumber}</div>
              <div>الكيان: مؤسسة تجارية سعودية نشطة معتمدة</div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-extrabold text-sm mb-3">روابط هامة وسياسات</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onOpenPolicies('returns')} className="hover:text-amber-400 transition">
                  سياسة الاستبدال والاسترجاع
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicies('shipping')} className="hover:text-amber-400 transition">
                  الشحن والضمان والتوصيل
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicies('terms')} className="hover:text-amber-400 transition">
                  الشروط والأحكام
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicies('privacy')} className="hover:text-amber-400 transition">
                  سياسة الخصوصية والأمان
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Address */}
          <div>
            <h4 className="text-white font-extrabold text-sm mb-3">بيانات التواصل والمقر</h4>
            <ul className="space-y-2.5 text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{storeConfig.fullAddress} (رمز: {storeConfig.shortAddress})</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href={`mailto:${storeConfig.email}`} className="hover:text-amber-400 transition">{storeConfig.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href={`https://wa.me/${storeConfig.whatsapp}`} className="hover:text-amber-400 transition" dir="ltr">
                  +{storeConfig.whatsapp}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Badges */}
          <div>
            <h4 className="text-white font-extrabold text-sm mb-3">وسائل الدفع المعتمدة</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200">مدى (mada)</div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200">Apple Pay</div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200">Visa / MC</div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200">تمارا (تقسيط)</div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200">Payzaty</div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-200">الدفع بالاستلام</div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-[11px]">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} {storeConfig.companyNameAr}
          </div>
          <div>
            المتجر الرسمي لقطع غيار وإكسسوارات السيارات المعتمد في المملكة العربية السعودية
          </div>
        </div>
      </div>
    </footer>
  );
};
