import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Clock, ChefHat, Package, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { trackOrderSocket } from '../../lib/websocket';
import { cn } from '../../lib/utils';

const statusSteps = [
  { key: 'PENDING', label: 'Order Received', icon: Clock, description: 'Your order has been received' },
  { key: 'ACCEPTED', label: 'Accepted', icon: Check, description: 'Restaurant has accepted your order' },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat, description: 'Your food is being prepared' },
  { key: 'READY', label: 'Ready', icon: Package, description: 'Your order is ready for pickup/serving' },
  { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2, description: 'Order completed. Enjoy your meal!' },
];

export const OrderTrackingPage: React.FC = () => {
  const { publicToken, qrToken } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiRequest('GET', `/public/orders/${publicToken}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    // Subscribe to real-time updates
    const unsubscribe = trackOrderSocket(publicToken!, (data) => {
      setOrder((prev: any) => ({ ...prev, ...data }));
    });

    return () => unsubscribe();
  }, [publicToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E85D3D]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">Order not found</p>
          <Link to={`/order/${qrToken}`} className="text-[#E85D3D] hover:underline">
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500 mt-1">Track your order status</p>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="space-y-6">
            {statusSteps.map((step, idx) => {
              const isActive = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    isActive ? 'bg-[#E85D3D] text-white' : 'bg-slate-100 text-slate-400'
                  )}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={cn('font-medium', isCurrent ? 'text-slate-900' : 'text-slate-500')}>
                      {step.label}
                    </p>
                    <p className="text-sm text-slate-400">{step.description}</p>
                  </div>
                  {isActive && idx < currentStatusIndex && (
                    <div className="w-px h-8 bg-[#E85D3D] self-start mt-10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>
          <div className="space-y-2">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-slate-600">{item.quantity} × {item.productName}</span>
                <span className="text-slate-900 font-medium">₦{Number(item.total).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>₦{Number(order.total).toLocaleString()}</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to={`/order/${qrToken}`} className="text-sm text-[#E85D3D] hover:underline">
            ← Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
};