import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../design-system/Button';
import { apiRequest } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CartDrawerProps {
  cart: CartItem[];
  accentColor: string;
  isBold: boolean;
  onClose: () => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onPlaceOrder: (orderData: any) => void;
  qrToken: string;
  tableLabel?: string;
}

interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  options: Array<{ optionName: string; valueLabel: string; priceDelta: number }>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  accentColor,
  isBold,
  onClose,
  onUpdateQuantity,
  qrToken,
  tableLabel,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const navigate = useNavigate();

  const cartTotal = cart.reduce((sum, item) => {
    const optionsTotal = item.options.reduce((s, o) => s + o.priceDelta, 0);
    return sum + (item.unitPrice + optionsTotal) * item.quantity;
  }, 0);

  const handlePlaceOrder = async () => {
    try {
      setIsPlacing(true);
      const response = await apiRequest('POST', '/public/orders', {
        qrToken,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          options: item.options.map(opt => ({
            optionId: opt.optionName, // This should be optionId; we need to store it properly
            valueId: opt.valueLabel, // same here
          })),
        })),
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerNotes: customerNotes || undefined,
        orderType: 'DINE_IN',
      });
      
      toast.success('Order placed successfully!');
      navigate(`/order/${qrToken}/status/${response.data.publicToken}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in',
        isBold ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold">Your Order</h2>
          </div>
          {tableLabel && (
            <span className="text-sm text-slate-500">Table {tableLabel}</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => {
                const itemTotal = (item.unitPrice + item.options.reduce((s, o) => s + o.priceDelta, 0)) * item.quantity;
                return (
                  <div key={index} className="flex gap-4 p-3 rounded-lg bg-slate-50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      {item.options.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          {item.options.map(o => o.valueLabel).join(', ')}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(index, -1)}
                          className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(index, 1)}
                          className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-slate-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">₦{itemTotal.toLocaleString()}</p>
                      <button
                        onClick={() => onUpdateQuantity(index, -item.quantity)}
                        className="text-xs text-red-500 hover:text-red-700 mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Customer info */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name (Optional)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone (Optional)</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
                placeholder="Your phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Notes (Optional)</label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
                rows={2}
                placeholder="Any special requests?"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Total</span>
            <span className="text-2xl font-bold">₦{cartTotal.toLocaleString()}</span>
          </div>
          <Button
            className="w-full"
            onClick={handlePlaceOrder}
            loading={isPlacing}
            disabled={cart.length === 0}
            style={{ backgroundColor: accentColor }}
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
};