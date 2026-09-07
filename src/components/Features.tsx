import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';
import { storeConfig } from '../config/store-config';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Truck,
      title: 'شحن سريع ومجاني',
      desc: `مجاني للطلبات فوق ${storeConfig.freeShippingThreshold} ${storeConfig.currencySymbol} لكافة مناطق المملكة`,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      icon: ShieldCheck,
      title: 'دفع إلكتروني آمن 100%',
      desc: 'دعم كامل لبوابات بيزاتي، مدى، فيزا، آبل باي، تابي، وتمارا',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      icon: RefreshCw,
      title: 'استبدال واسترجاع ميسر',
      desc: 'إمكانية إرجاع المنتجات خلال 14 يوماً وفق اشتراطات وزارة التجارة',
      color: 'text-sky-600 bg-sky-50 border-sky-200'
    },
    {
      icon: Headphones,
      title: 'خدمة عملاء ودعم مستمر',
      desc: `متواجدون لخدمتكم عبر الواتساب والهاتف: ${storeConfig.phone}`,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  ];

  return (
    <div className="py-10 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                className="flex items-start gap-4 p-4 rounded-xl border border-stone-100 bg-stone-50/60 hover:bg-white hover:shadow-md transition-all"
              >
                <div className={`p-3 rounded-xl border ${f.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{f.title}</h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
