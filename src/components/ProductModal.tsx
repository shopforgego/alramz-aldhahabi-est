import React, { useState } from 'react';
import { X, Star, ShoppingBag, Truck, ShieldCheck, RefreshCw, Check, ArrowRight } from 'lucide-react';
import { Product } from '../types/store';
import { storeConfig } from '../config/store-config';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart, onBuyNow }) => {
  if (!product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.main_image || product.image || '/logo.png'];

  const discountPercent = product.regular_price && product.regular_price > product.price
    ? Math.round(((product.regular_price - product.price) / product.regular_price) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8">
          
          {/* Gallery Column */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name || product.title}
                className="w-full h-full object-cover object-center"
              />
              {discountPercent && (
                <span className="absolute top-3 right-3 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full">
                  خصم {discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                      selectedImageIndex === idx ? 'border-amber-500 scale-95' : 'border-stone-200 opacity-70 hover:opacity-100'
                    } transition-all`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="bg-stone-100 text-stone-700 font-semibold px-2.5 py-1 rounded-md">
                  {product.category || 'عام'}
                </span>
                {product.sku && (
                  <span className="font-mono text-stone-400">
                    كود: {product.sku}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
                {product.name || product.title}
              </h2>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex text-amber-400 fill-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-stone-700">4.9 / 5</span>
                <span className="text-stone-400">(48 تقييماً موثقاً)</span>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-stone-950">
                      {product.price}
                    </span>
                    <span className="text-sm font-bold text-stone-600">
                      {storeConfig.currencySymbol}
                    </span>
                  </div>
                  {product.regular_price && product.regular_price > product.price && (
                    <div className="text-xs text-stone-400 line-through mt-0.5">
                      السعر الأصلي: {product.regular_price} {storeConfig.currencySymbol}
                    </div>
                  )}
                </div>
                <div className="text-left text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                  شامل ضريبة القيمة المضافة 15%
                </div>
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                <Check className="w-4 h-4" />
                <span>متوفر في المخزون وجاهز للشحن الفوري</span>
              </div>

            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-stone-700">الكمية:</span>
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-bold text-sm text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => { onAddToCart(product, quantity); onClose(); }}
                  className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>أضف للسلة</span>
                </button>
                <button
                  onClick={() => { onBuyNow(product, quantity); onClose(); }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>شراء الآن</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 border-t border-stone-200 grid grid-cols-3 gap-2 text-center text-[11px] text-stone-500">
              <div className="flex flex-col items-center gap-1 p-2 bg-stone-50 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>ضمان رسمي سنتين</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-stone-50 rounded-lg">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>توصيل 24-48 ساعة</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-stone-50 rounded-lg">
                <RefreshCw className="w-4 h-4 text-sky-600" />
                <span>استرجاع خلال 14 يوم</span>
              </div>
            </div>

          </div>

        </div>

        {/* Tabs for Description & Specs */}
        <div className="border-t border-stone-200 p-6 sm:p-8 bg-stone-50/60 rounded-b-3xl">
          <div className="flex gap-4 border-b border-stone-200 pb-3 mb-4">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2 text-sm font-bold ${
                activeTab === 'desc' ? 'text-stone-950 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              الوصف والمواصفات
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2 text-sm font-bold ${
                activeTab === 'specs' ? 'text-stone-950 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              الشحن والضمان
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 text-sm font-bold ${
                activeTab === 'reviews' ? 'text-stone-950 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              آراء العملاء (48)
            </button>
          </div>

          {activeTab === 'desc' && (
            <div className="text-sm text-stone-600 leading-relaxed space-y-3">
              <p>{product.description || 'منتج أصلي عالي الجودة متوافق مع أعلى المواصفات القياسية المعتمدة في المملكة العربية السعودية.'}</p>
              {product.brand && (
                <div className="text-xs text-stone-500">
                  <strong>العلامة التجارية:</strong> {product.brand}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="text-xs text-stone-600 space-y-2">
              <p>• الشحن متاح لجميع مدن ومحافظات المملكة عبر شركات الشحن المعتمدة (أرامكس، سمسا، ريد بوكس).</p>
              <p>• مدة التوصيل داخل المدن الرئيسية (الرياض، جدة، مكة، الدمام): من 24 إلى 48 ساعة عمل.</p>
              <p>• الضمان: ضمان سنتين يشمل العيوب المصنعية مع استبدال مباشر.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3 text-xs text-stone-600">
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-stone-900">سعد القحطاني - الرياض</span>
                  <div className="flex text-amber-400">★★★★★</div>
                </div>
                <p>منتج ممتاز جداً وجودته تفوق التوقعات، والتوصيل وصلني في أقل من يومين مع التغليف الفاخر.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-stone-900">نوف العتيبي - جدة</span>
                  <div className="flex text-amber-400">★★★★★</div>
                </div>
                <p>التجربة كانت رائعة والتعامل راقي جداً، شكراً لكم على المصداقية والخدمة المميزة.</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
