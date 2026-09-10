import React from 'react';
import { Clock, Check, ChefHat, Package, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimelineEvent {
  id: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface OrderTimelineProps {
  timeline: TimelineEvent[];
  currentStatus: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  ACCEPTED: <Check className="w-4 h-4" />,
  PREPARING: <ChefHat className="w-4 h-4" />,
  READY: <Package className="w-4 h-4" />,
  COMPLETED: <CheckCircle2 className="w-4 h-4" />,
  CANCELLED: <XCircle className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500',
  ACCEPTED: 'bg-blue-500',
  PREPARING: 'bg-purple-500',
  READY: 'bg-emerald-500',
  COMPLETED: 'bg-green-600',
  CANCELLED: 'bg-red-500',
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ timeline, currentStatus }) => {
  return (
    <div className="space-y-0">
      {timeline.map((event, idx) => {
        const isLast = idx === timeline.length - 1;
        const isCancelled = event.status === 'CANCELLED';
        
        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0',
                statusColors[event.status] || 'bg-slate-400'
              )}>
                {statusIcons[event.status] || <Clock className="w-4 h-4" />}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-slate-200 my-1" />
              )}
            </div>
            <div className="pb-4">
              <p className={cn(
                'text-sm font-medium',
                isCancelled ? 'text-red-600' : 'text-slate-900'
              )}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1).toLowerCase()}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              {event.notes && (
                <p className="text-xs text-slate-400 mt-1">{event.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};