import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreVertical, Check, X, RefreshCw, LayoutGrid, List, Search } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Badge } from '../../components/design-system/Badge';
import { Button } from '../../components/design-system/Button';
import { Drawer } from '../../components/design-system/Drawer';
import { OrderCard } from './OrderCard';
import { subscribeToOrderEvents } from '../../lib/websocket';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

export const OrdersPage: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', statusFilter, search],
    queryFn: () => apiRequest('GET', `/orders?status=${statusFilter}&search=${search}`),
  });

  // Realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToOrderEvents('', (event, data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (event === 'order.created') {
        toast.success(`New order ${data.orderNumber}`, { icon: '🔔' });
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      apiRequest('PATCH', `/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update order');
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) =>
      apiRequest('POST', `/orders/${orderId}/cancel`, { reason: 'Cancelled by staff' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled');
      setSelectedOrder(null);
    },
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track all incoming orders in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm w-64 focus:outline-none focus:border-[#E85D3D]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={cn('p-2.5', view === 'kanban' ? 'bg-[#E85D3D] text-white' : 'bg-white text-slate-500')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('p-2.5', view === 'list' ? 'bg-[#E85D3D] text-white' : 'bg-white text-slate-500')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {['PENDING', 'ACCEPTED', 'PREPARING'].map(status => (
            <div key={status} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-slate-700">{status}</h3>
                <Badge variant="default">{orders?.data?.filter((o: any) => o.status === status).length || 0}</Badge>
              </div>
              <div className="space-y-3">
                {orders?.data
                  ?.filter((o: any) => o.status === status)
                  .map((order: any) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() => setSelectedOrder(order)}
                    />
                  ))}
                {!orders?.data?.some((o: any) => o.status === status) && (
                  <p className="text-xs text-slate-400 text-center py-4">No orders</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {orders?.data?.map((order: any) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm text-slate-900">{order.orderNumber}</span>
                  <span className="text-xs text-slate-500">
                    {order.table?.label ? `Table ${order.table.label}` : 'No table'}
                  </span>
                  <Badge variant={order.status === 'PENDING' ? 'warning' : order.status === 'COMPLETED' ? 'success' : 'info'}>
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-900">₦{Number(order.total).toLocaleString()}</span>
                  <span className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Order Detail Drawer */}
      <Drawer isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
        {selectedOrder && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedOrder.orderNumber}</h3>
                <p className="text-sm text-slate-500">
                  {selectedOrder.outlet?.name || 'Outlet'} · {selectedOrder.table?.label ? `Table ${selectedOrder.table.label}` : 'No table'}
                </p>
              </div>
              <Badge variant={selectedOrder.status === 'PENDING' ? 'warning' : selectedOrder.status === 'COMPLETED' ? 'success' : 'info'}>
                {selectedOrder.status}
              </Badge>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h4 className="font-medium text-sm text-slate-700 mb-3">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.quantity} × {item.productName}</p>
                      {item.options?.length > 0 && (
                        <p className="text-xs text-slate-500">{item.options.map((o: any) => o.valueLabel).join(', ')}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">₦{Number(item.total).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            {(selectedOrder.customerName || selectedOrder.customerPhone || selectedOrder.customerNotes) && (
              <div className="mb-6">
                <h4 className="font-medium text-sm text-slate-700 mb-2">Customer</h4>
                {selectedOrder.customerName && <p className="text-sm text-slate-600">{selectedOrder.customerName}</p>}
                {selectedOrder.customerPhone && <p className="text-sm text-slate-600">{selectedOrder.customerPhone}</p>}
                {selectedOrder.customerNotes && <p className="text-sm text-slate-500 italic">{selectedOrder.customerNotes}</p>}
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-700">₦{Number(selectedOrder.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Service Fee</span>
                <span className="text-slate-700">₦{Number(selectedOrder.serviceFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>₦{Number(selectedOrder.total).toLocaleString()}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h4 className="font-medium text-sm text-slate-700 mb-3">Timeline</h4>
              <div className="space-y-3">
                {selectedOrder.timeline?.map((event: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#E85D3D] mt-1.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{event.status}</p>
                      <p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</p>
                      {event.notes && <p className="text-xs text-slate-500">{event.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {selectedOrder.status === 'PENDING' && (
                <Button
                  onClick={() => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: 'ACCEPTED' })}
                  loading={updateStatusMutation.isPending}
                >
                  <Check className="w-4 h-4" /> Accept
                </Button>
              )}
              {selectedOrder.status === 'ACCEPTED' && (
                <Button
                  onClick={() => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: 'PREPARING' })}
                >
                  Start Preparing
                </Button>
              )}
              {selectedOrder.status === 'PREPARING' && (
                <Button
                  onClick={() => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: 'READY' })}
                >
                  Mark Ready
                </Button>
              )}
              {selectedOrder.status === 'READY' && (
                <Button
                  onClick={() => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: 'COMPLETED' })}
                >
                  Complete Order
                </Button>
              )}
              {['PENDING', 'ACCEPTED', 'PREPARING'].includes(selectedOrder.status) && (
                <Button
                  variant="destructive"
                  onClick={() => cancelOrderMutation.mutate(selectedOrder.id)}
                  loading={cancelOrderMutation.isPending}
                >
                  <X className="w-4 h-4" /> Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};