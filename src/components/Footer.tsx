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
          {/* Col 4: Payment Badges */}
          <div>
            <h4 className="font-extrabold text-sm mb-3">وسائل الدفع المعتمدة</h4>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1f2a44] shadow-sm border border-slate-200/80">
                <svg className="w-10 h-4 shrink-0" viewBox="0 0 796.2 265.5" fill="none" aria-hidden="true">
                  <rect width="336.8" height="112.3" fill="#259BD6" />
                  <rect y="153.1" width="336.8" height="112.2" fill="#84B740" />
                  <path fill="#27292D" d="M673.6,242.5l-1.5,0.3c-5.2,1-7.1,1.4-10.9,1.4c-8.8,0-19.2-4.5-19.2-25.7c0-10.9,1.8-25.4,18.2-25.4h0.1 c2.8,0.2,6,0.5,12,2.3l1.3,0.4L673.6,242.5L673.6,242.5z M676.3,136.8l-2.7,0.5v39.2l-2.4-0.7l-0.7-0.2c-2.7-0.8-8.9-2.6-14.9-2.6 c-32.8,0-39.7,24.8-39.7,45.6c0,28.5,16,44.9,43.9,44.9c11.8,0,20.5-1.2,29.3-4.1c8.1-2.6,11-6.3,11-14.2V132.7 C692.3,134.1,684.2,135.5,676.3,136.8" />
                  <path fill="#27292D" d="M771.1,243.2l-1.4,0.4l-5,1.3c-4.7,1.2-8.9,1.9-12.1,1.9c-7.7,0-12.3-3.8-12.3-10.3c0-4.2,1.9-11.3,14.5-11.3 h16.3V243.2z M759.6,172.5c-10.1,0-20.5,1.8-33.4,5.8l-8.4,2.5l2.8,19l8.2-2.7c8.6-2.8,19.3-4.6,27.3-4.6c3.6,0,14.6,0,14.6,11.9 v5.2h-15.3c-27.9,0-40.8,8.9-40.8,28c0,16.3,11.9,26.1,31.9,26.1c6.2,0,14.8-1.2,22.2-3l0.4-0.1l0.4,0.1l2.5,0.4 c7.8,1.4,15.9,2.8,23.8,4.3V203C795.8,182.8,783.6,172.5,759.6,172.5" />
                  <path fill="#27292D" d="M576.8,243.2l-1.4,0.4l-5,1.3c-4.7,1.2-8.8,1.9-12.1,1.9c-7.7,0-12.3-3.8-12.3-10.3c0-4.2,1.9-11.3,14.4-11.3 h16.3L576.8,243.2L576.8,243.2z M565.4,172.5c-10.2,0-20.5,1.8-33.4,5.8l-8.4,2.5l2.8,19l8.2-2.7c8.6-2.8,19.3-4.6,27.3-4.6 c3.6,0,14.6,0,14.6,11.9v5.2h-15.3c-27.9,0-40.9,8.9-40.9,28c0,16.3,11.9,26.1,32,26.1c6.2,0,14.8-1.2,22.2-3l0.4-0.1l0.4,0.1 l2.4,0.4c7.9,1.4,15.9,2.8,23.8,4.4v-62.4C601.6,182.7,589.4,172.5,565.4,172.5" />
                  <path fill="#27292D" d="M471.5,172.7c-12.7,0-23.2,4.2-27.1,6l-1,0.5l-0.9-0.7c-5.4-3.9-13.3-5.9-24.3-5.9c-9.7,0-18.8,1.4-28.7,4.3 c-8.5,2.6-11.8,6.7-11.8,14.4v71.3h26.6v-65.9l1.3-0.4c5.4-1.8,8.6-2.1,11.7-2.1c7.7,0,11.6,4.1,11.6,12.1v56.4h26.2v-57.5 c0-3.4-0.7-5.4-0.8-5.8l-0.9-1.7l1.8-0.8c4-1.8,8.4-2.7,13-2.7c5.3,0,11.6,2.1,11.6,12.1v56.4h26.1v-59 C505.9,182.8,494.7,172.7,471.5,172.7" />
                  <path fill="#27292D" d="M751.5,73.2c-3.9,0-10.4-0.4-15.5-1.4l-1.5-0.3V33c0-3.2-0.6-5.2-0.7-5.5l-0.8-1.6l1.7-0.7 c0.4-0.2,0.8-0.3,1.3-0.5l0.3-0.2c0.6-0.2,1.2-0.4,1.8-0.6c0.3-0.1,0.5-0.2,0.7-0.2c5.9-1.6,11.3-1.4,13.7-1.6h0.1 c16.3,0,18.2,14.5,18.2,25.4C770.7,68.7,760.2,73.2,751.5,73.2 M751.4,0c-0.2,0-0.5,0-0.7,0c-15.3,0-31,4.2-36.6,12.4 c-3,4-4.7,9-4.8,14.9l0,0V67c0,3.4-0.7,4.7-0.8,5l-0.9,1.7h-48.3V46.1h-0.1C658.6,17,641.4,1,616.5,1h-2.9h-21.4 c-1,7.1-1.8,12.1-2.8,19.2h24.2c12.7,0,19.4,10.8,19.4,27.4v27.8l-1.7-0.9c-0.3-0.1-2.4-0.8-5.7-0.8h-41.8 c-0.8,5.3-1.8,12.2-2.9,19.1h128.5c4.4-0.9,9.5-1.7,13.9-2.4c6.5,3.2,18.6,4.9,26.9,4.9c27.9,0,46-18.7,46-47.5 C796.1,19.3,778.6,0.6,751.4,0" />
                  <path fill="#27292D" d="M526.1,104.5h1.2c27.9,0,40.9-9.2,40.9-31.9c0-16.3-11.9-29.3-31.9-29.3h-25.7c-7.7,0-12.3-4.4-12.3-11.8 c0-5,1.9-11.2,14.5-11.2H569c1.2-7.3,1.8-11.9,2.9-19.2h-58.4c-27.2,0-40.9,11.4-40.9,30.4c0,18.8,11.9,28.6,31.9,28.6h25.7 c7.7,0,12.3,6.1,12.3,12.5c0,4.2-1.9,12.9-14.4,12.9h-4.3l-82.3-0.2l0,0h-15c-12.7,0-21.6-7.2-21.6-23.9V49.9 c0-17.4,6.9-28.2,21.6-28.2h24.4c1.1-7.4,1.8-12.1,2.8-19.1h-30.4h-2.9c-24.9,0-42.1,16.7-42.7,45.8l0,0v1.1v11.9 c0.6,29.1,17.8,43,42.7,43h2.9h21.4l44.6,0.1l0,0h26.6L526.1,104.5L526.1,104.5z" />
                </svg>
                مدى Mada
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1f2a44] shadow-sm border border-slate-200/80">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#1a1f71" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path d="M3 10h18" />
                </svg>
                Visa
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1f2a44] shadow-sm border border-slate-200/80">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="9" cy="12" r="6" fill="#eb001b" />
                  <circle cx="15" cy="12" r="6" fill="#f79e1b" />
                </svg>
                Mastercard
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1f2a44] shadow-sm border border-slate-200/80">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M7 12h10" />
                </svg>
                التحويل البنكي
              </span>
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
