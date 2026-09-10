import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, ShoppingCart, ArrowLeft, MapPin } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { cn } from '../../lib/utils';
import { Badge } from '../../components/design-system/Badge';
import { Button } from '../../components/design-system/Button';
import { ProductModal } from '../../components/customer/ProductModal';
import { CartDrawer } from '../../components/customer/CartDrawer';
import { MenuSkeleton } from '../../components/skeletons/MenuSkeleton';

interface RestaurantMenu {
  restaurant: {
    id: string;
    name: string;
    logoUrl?: string;
    coverUrl?: string;
    accentColor?: string;
    themePreset: 'MINIMAL' | 'BISTRO' | 'BOLD';
  };
  outlet: { id: string; name: string };
  table: { id: string; label: string } | null;
  categories: Array<{
    id: string;
    name: string;
    products: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      imageUrl?: string;
      options?: Array<{
        id: string;
        name: string;
        isRequired: boolean;
        values: Array<{ id: string; label: string; priceDelta: number }>;
      }>;
    }>;
  }>;
}

interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  options: Array<{ optionName: string; valueLabel: string; priceDelta: number }>;
}

export const PublicMenu: React.FC = () => {
  const { qrToken } = useParams<{ qrToken: string }>();
  const [menu, setMenu] = useState<RestaurantMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', `/public/menu/${qrToken}`);
        setMenu(response.data);
        setActiveCategory(response.data.categories[0]?.id || null);
        setSelectedCategory(response.data.categories[0]?.id || null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [qrToken]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.findIndex(
        i => i.productId === item.productId && JSON.stringify(i.options) === JSON.stringify(item.options)
      );
      if (existing >= 0) {
        const newCart = [...prev];
        newCart[existing].quantity += item.quantity;
        return newCart;
      }
      return [...prev, item];
    });
    setSelectedProduct(null);
    setShowCart(true);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart[index].quantity += delta;
      if (newCart[index].quantity <= 0) {
        newCart.splice(index, 1);
      }
      return newCart;
    });
  };

  if (loading) return <MenuSkeleton />;
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }
  if (!menu) return null;

  const isBold = menu.restaurant.themePreset === 'BOLD';
  const isMinimal = menu.restaurant.themePreset === 'MINIMAL';
  const accentColor = menu.restaurant.accentColor || '#E85D3D';

  const filteredCategories = search
    ? menu.categories.map(cat => ({
        ...cat,
        products: cat.products.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.products.length > 0)
    : menu.categories;

  const cartTotal = cart.reduce((sum, item) => {
    const optionsTotal = item.options.reduce((s, o) => s + o.priceDelta, 0);
    return sum + (item.unitPrice + optionsTotal) * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={cn(
      'min-h-screen',
      isBold ? 'bg-slate-950 text-white' : 'bg-white text-slate-800'
    )}>
      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-40 backdrop-blur-lg',
          isBold ? 'bg-slate-900/80 border-b border-slate-800' : 'bg-white/90 border-b border-slate-100'
        )}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {menu.restaurant.logoUrl && (
              <img src={menu.restaurant.logoUrl} alt={menu.restaurant.name} className="w-10 h-10 rounded-full object-cover" />
            )}
            <div className="flex-1">
              <h1 className={cn('text-lg font-bold', isBold ? 'text-white' : 'text-slate-900')}>
                {menu.restaurant.name}
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>{menu.outlet.name}</span>
                {menu.table && <span>· Table {menu.table.label}</span>}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all',
                isBold
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-white/20'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-slate-200'
              )}
            />
          </div>
        </div>
      </header>

      {/* Category scroll */}
      <div className={cn(
        'sticky top-[130px] z-30 backdrop-blur-lg',
        isBold ? 'bg-slate-900/80 border-b border-slate-800' : 'bg-white/90 border-b border-slate-100'
      )}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {filteredCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0',
                  selectedCategory === cat.id
                    ? 'text-white shadow-sm'
                    : isBold
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
                style={selectedCategory === cat.id ? { backgroundColor: accentColor } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-28">
        {filteredCategories.map(cat => (
          <section key={cat.id} id={`category-${cat.id}`} className="mb-8">
            <h2 className={cn('text-xl font-bold mb-4', isBold ? 'text-white' : 'text-slate-900')}>
              {cat.name}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              {cat.products.map(product => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={cn(
                    'text-left rounded-2xl overflow-hidden border transition-all group hover:shadow-lg active:scale-[0.98]',
                    isBold
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  )}
                >
                  {product.imageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className={cn('font-semibold text-sm', isBold ? 'text-white' : 'text-slate-800')}>
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className={cn('text-xs mt-1 line-clamp-2', isBold ? 'text-slate-400' : 'text-slate-500')}>
                        {product.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className={cn('font-bold', isBold ? 'text-white' : 'text-slate-900')}>
                        ₦{product.price.toLocaleString()}
                      </span>
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No products found matching "{search}"</p>
          </div>
        )}
      </main>

      {/* Cart bar */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 rounded-full px-6 py-4 text-white font-semibold shadow-2xl hover:shadow-3xl transition-all active:scale-[0.97] flex items-center gap-3"
          style={{ backgroundColor: accentColor }}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
          <span className="opacity-80">·</span>
          <span>₦{cartTotal.toLocaleString()}</span>
        </button>
      )}

      {/* Product modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          accentColor={accentColor}
          isBold={isBold}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
        />
      )}

      {/* Cart drawer */}
      {showCart && (
        <CartDrawer
          cart={cart}
          accentColor={accentColor}
          isBold={isBold}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onPlaceOrder={() => {}}
          qrToken={qrToken!}
          tableLabel={menu.table?.label}
        />
      )}
    </div>
  );
};