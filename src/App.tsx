import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { PoliciesModal } from './components/PoliciesModal';
import { Footer } from './components/Footer';
import rawProducts from './data/products.json';
import { Product, CartItem } from './types/store';
import { Sparkles, ArrowUpDown } from 'lucide-react';

export function App() {
  const products = rawProducts as Product[];

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);
  const [policiesModalTab, setPoliciesModalTab] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high'>('featured');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
      if (p.categories) p.categories.forEach((c) => set.add(c));
    });
    return Array.from(set).slice(0, 8);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCat =
          selectedCategory === 'all' ||
          p.category === selectedCategory ||
          (p.categories && p.categories.includes(selectedCategory));

        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.brand && p.brand.toLowerCase().includes(query));

        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = (product: Product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product, qty = 1) => {
    handleAddToCart(product, qty);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-stone-100/60 selection:bg-amber-500 selection:text-white">
      
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onOpenPolicies={(tab) => setPoliciesModalTab(tab)}
      />

      <Hero
        onShopClick={() => {
          const el = document.getElementById('products-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        productsCount={products.length}
      />

      <Features />

      <main id="products-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>كتالوج التميز والجودة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              {selectedCategory === 'all' ? 'جميع المنتجات المتوفرة' : selectedCategory}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              عرض {filteredProducts.length} من أصل {products.length} منتج متاح
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              ترتيب:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 shadow-xs"
            >
              <option value="featured">المميزة والأكثر طلباً</option>
              <option value="price_low">السعر: من الأقل للأعلى</option>
              <option value="price_high">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="text-4xl">🔍</div>
            <h3 className="font-bold text-stone-800 text-lg">لم نتمكن من العثور على أي منتج</h3>
            <p className="text-xs text-stone-500">
              جرّب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-2 px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 pt-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
                onAddToCart={(p) => handleAddToCart(p, 1)}
              />
            ))}
          </div>
        )}

      </main>

      <Footer onOpenPolicies={(tab) => setPoliciesModalTab(tab)} />

      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onBuyNow={(p, qty) => handleBuyNow(p, qty)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={(data) => {
          setIsCheckoutOpen(false);
          setCartItems([]);
          setOrderSuccessData(data);
        }}
      />

      <OrderSuccessModal
        orderData={orderSuccessData}
        onClose={() => setOrderSuccessData(null)}
      />

      <PoliciesModal
        isOpen={policiesModalTab !== null}
        initialTab={policiesModalTab || 'about'}
        onClose={() => setPoliciesModalTab(null)}
      />

    </div>
  );
}

export default App;
