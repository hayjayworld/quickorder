import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Badge } from '../../components/design-system/Badge';

interface OrderCardProps {
  order: any;
  onClick: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg border border-slate-200 p-4 text-left hover:shadow-md transition-shadow active:scale-[0.98]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-slate-900">{order.orderNumber}</span>
        <Badge
          variant={
            order.status === 'PENDING' ? 'warning' :
            order.status === 'COMPLETED' ? 'success' :
            order.status === 'CANCELLED' ? 'danger' : 'info'
          }
        >
          {order.status}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {order.table?.label ? `Table ${order.table.label}` : 'No table'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(order.createdAt)}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">{order.items.length} items</span>
        <span className="font-bold text-sm text-slate-900">₦{Number(order.total).toLocaleString()}</span>
      </div>
    </button>
  );
};