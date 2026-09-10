import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { StatCardSkeleton, Skeleton } from '../../components/design-system/Skeleton';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#E85D3D', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState('30');

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics-revenue', period],
    queryFn: () => apiRequest('GET', `/analytics/revenue?days=${period}`),
  });

  const { data: orderData, isLoading: ordersLoading } = useQuery({
    queryKey: ['analytics-orders', period],
    queryFn: () => apiRequest('GET', `/analytics/orders?days=${period}`),
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['analytics-products'],
    queryFn: () => apiRequest('GET', '/analytics/products'),
  });

  const { data: outletData, isLoading: outletLoading } = useQuery({
    queryKey: ['analytics-outlets', period],
    queryFn: () => apiRequest('GET', `/analytics/outlets?days=${period}`),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Track performance and customer behavior</p>
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Revenue Over Time</h3>
          <div className="h-64">
            {revenueLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData?.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#E85D3D" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Order Status Distribution</h3>
          <div className="h-64">
            {ordersLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderData?.data?.map((d: any) => ({ name: d.status, value: d._count }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderData?.data?.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Products and Outlets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {productsLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : (
              topProducts?.data?.map((product: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-300 w-6">{idx + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.quantity} orders</p>
                  </div>
                  <span className="font-semibold text-sm">{formatCurrency(product.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Outlet Performance</h3>
          <div className="space-y-4">
            {outletLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : (
              outletData?.data?.map((outlet: any) => (
                <div key={outlet.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{outlet.name}</p>
                    <p className="text-xs text-slate-400">{outlet.orderCount} orders</p>
                  </div>
                  <span className="font-semibold text-sm">{formatCurrency(outlet.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};