import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2, Users, CreditCard, DollarSign,
  TrendingUp, ShoppingCart, ArrowUp, ArrowDown, Activity,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line,
} from 'recharts';
import { apiRequest } from '../../lib/api';
import { Skeleton } from '../../components/design-system/Skeleton';
import { formatCurrency } from '../../lib/utils';

export const AdminDashboard: React.FC = () => {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => apiRequest('GET', '/admin/overview'),
  });

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiRequest('GET', '/admin/analytics'),
  });

  const { data: restaurants } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: () => apiRequest('GET', '/admin/restaurants?limit=5'),
  });

  const stats = [
    {
      label: 'Total Restaurants',
      value: overview?.data?.totalRestaurants || 0,
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-100',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Active Restaurants',
      value: overview?.data?.activeRestaurants || 0,
      icon: <Users className="w-5 h-5" />,
      color: 'text-emerald-600 bg-emerald-100',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Active Subscriptions',
      value: overview?.data?.activeSubscriptions || 0,
      icon: <CreditCard className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-100',
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(overview?.data?.monthlyRevenue || 0),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-amber-600 bg-amber-100',
      trend: '+15%',
      trendUp: true,
    },
    {
      label: 'Orders Today',
      value: overview?.data?.ordersToday || 0,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'text-red-600 bg-red-100',
      trend: '+10%',
      trendUp: true,
    },
    {
      label: 'Trial Restaurants',
      value: overview?.data?.trialRestaurants || 0,
      icon: <Activity className="w-5 h-5" />,
      color: 'text-slate-600 bg-slate-100',
      trend: '-2%',
      trendUp: false,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor your entire QuickOrder platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.trend}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Revenue Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Jan', revenue: 150000 },
                { month: 'Feb', revenue: 180000 },
                { month: 'Mar', revenue: 220000 },
                { month: 'Apr', revenue: 210000 },
                { month: 'May', revenue: 260000 },
                { month: 'Jun', revenue: 300000 },
                { month: 'Jul', revenue: 340000 },
                { month: 'Aug', revenue: 380000 },
                { month: 'Sep', revenue: 420000 },
              ]}>
                <defs>
                  <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E85D3D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E85D3D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#E85D3D" fill="url(#adminRevenueGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Restaurant Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { month: 'Jan', restaurants: 120 },
                { month: 'Feb', restaurants: 145 },
                { month: 'Mar', restaurants: 170 },
                { month: 'Apr', restaurants: 200 },
                { month: 'May', restaurants: 235 },
                { month: 'Jun', restaurants: 280 },
                { month: 'Jul', restaurants: 320 },
                { month: 'Aug', restaurants: 380 },
                { month: 'Sep', restaurants: 420 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="restaurants" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Restaurants */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Restaurants</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {restaurants?.data?.map((restaurant: any) => (
            <div key={restaurant.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">{restaurant.name}</p>
                  <p className="text-xs text-slate-500">
                    {restaurant._count?.outlets || 0} outlets · {restaurant._count?.orders || 0} orders
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium ${
                  restaurant.status === 'ACTIVE' ? 'text-emerald-600' :
                  restaurant.status === 'TRIAL' ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {restaurant.status}
                </span>
                <span className="text-sm text-slate-500">
                  {new Date(restaurant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};