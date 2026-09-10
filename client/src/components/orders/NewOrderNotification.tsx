import React, { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { getSocket } from '../../lib/websocket';
import { Badge } from '../design-system/Badge';
import { Button } from '../design-system/Button';

interface OrderNotification {
  orderNumber: string;
  tableLabel?: string;
  items: { productName: string; quantity: number }[];
  total: number;
}

export const NewOrderNotification: React.FC = () => {
  const [notification, setNotification] = useState<OrderNotification | null>(null);
  const [visible, setVisible] = useState(false);
  const [audio] = useState(() => {
    const a = new Audio('/sounds/notification.mp3');
    a.volume = 0.5;
    return a;
  });

  useEffect(() => {
    const socket = getSocket();
    
    const handleNewOrder = (data: any) => {
      setNotification({
        orderNumber: data.orderNumber,
        tableLabel: data.table?.label || 'Unknown table',
        items: data.items?.slice(0, 3).map((i: any) => ({
          productName: i.productName,
          quantity: i.quantity,
        })) || [],
        total: Number(data.total),
      });
      setVisible(true);
      audio.play().catch(() => {});

      // Auto dismiss after 8 seconds
      setTimeout(() => setVisible(false), 8000);
    };

    socket.on('order.created', handleNewOrder);
    return () => {
      socket.off('order.created', handleNewOrder);
    };
  }, [audio]);

  if (!visible || !notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#E85D3D] text-white px-4 py-3 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <span className="font-semibold">New Order Received</span>
          <button
            onClick={() => setVisible(false)}
            className="ml-auto hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-lg font-bold text-slate-800">{notification.orderNumber}</p>
              <p className="text-sm text-slate-500">Table {notification.tableLabel}</p>
            </div>
            <Badge variant="warning">Pending</Badge>
          </div>
          <div className="space-y-2 mb-4">
            {notification.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.quantity} × {item.productName}</span>
              </div>
            ))}
            {notification.items.length === 3 && (
              <p className="text-xs text-slate-400">+ more items...</p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm font-medium text-slate-500">Total</span>
            <span className="text-lg font-bold text-slate-800">
              ₦{notification.total.toLocaleString()}
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" className="flex-1" onClick={() => setVisible(false)}>
              <Check className="w-4 h-4" /> Accept Order
            </Button>
            <Button variant="outline" onClick={() => setVisible(false)}>
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};