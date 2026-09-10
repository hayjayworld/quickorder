import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, DollarSign, ShoppingCart, Clock,
  ArrowUp, ArrowDown, ArrowRight, Bell,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar,
} from 'recharts';
import { apiRequest } from '../../lib/api';
import { Skeleton, StatCardSkeleton } from '../../components/design-system/Skeleton';
import { Badge } from '../../components/design-system/Badge';
import { Button } from '../../components/design-system/Button';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { NewOrderNotification } from '../../components/orders/NewOrderNotification';

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiRequest('GET', '/analytics/overview?period=today'),
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: () => apiRequest('GET', '/analytics/revenue?days=30'),
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: () => apiRequest('GET', '/orders?limit=5'),
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['dashboard-top-products'],
    queryFn: () => apiRequest('GET', '/analytics/products'),
  });

  return (
    <div className="p-6">
      <NewOrderNotification />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good afternoon 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening in your restaurant today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/app/orders">
            <Button variant="outline">
              <ShoppingCart className="w-4 h-4" /> View Orders
            </Button>
          </Link>
          <Link to="/app/qr-codes">
            <Button>
              <Bell className="w-4 h-4" /> Generate QR
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Orders Today"
              value={String(stats?.data?.totalOrders || 0)}
              icon={<ShoppingCart className="w-5 h-5" />}
              trend="+12%"
              trendUp
            />
            <StatCard
              label="Revenue Today"
              value={formatCurrency(stats?.data?.totalRevenue || 0)}
              icon={<DollarSign className="w-5 h-5" />}
              trend="+8%"
              trendUp
            />
            <StatCard
              label="Pending Orders"
              value={String(stats?.data?.pendingOrders || 0)}
              icon={<Clock className="w-5 h-5" />}
              trend="-3%"
              trendUp={false}
            />
            <StatCard
              label="Avg Order Value"
              value={formatCurrency(stats?.data?.avgOrder || 0)}
              icon={<TrendingUp className="w-5 h-5" />}
              trend="+5%"
              trendUp
            />
          </>
        )}
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Revenue Overview</h3>
            <select className="text-sm border rounded-lg px-3 py-1.5">
              <option>7 days</option>
              <option>30 days</option>
              <option>90 days</option>
            </select>
          </div>
          <div className="h-64">
            {revenueLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData?.data}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E85D3D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E85D3D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#E85D3D"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Popular Products</h3>
          <div className="space-y-4">
            {productsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2 mt-1" />
                  </div>
                </div>
              ))
            ) : (
              topProducts?.data?.map((product: any, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-300 w-6">{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-700">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.quantity} orders</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Live Orders</h3>
          <Link to="/app/orders" className="text-sm text-[#E85D3D] hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {ordersLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))
          ) : (
            recentOrders?.data?.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-sm text-slate-900">{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">
                    {order.table?.label ? `Table ${order.table.label}` : 'No table'} · {order.items.length} items
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-sm text-slate-900">
                    {formatCurrency(Number(order.total))}
                  </span>
                  <Badge variant={order.status === 'PENDING' ? 'warning' : order.status === 'COMPLETED' ? 'success' : 'info'}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

function StatCard({ label, value, icon, trend, trendUp }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#E85D3D]/10 flex items-center justify-center text-[#E85D3D]">
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
            {trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}