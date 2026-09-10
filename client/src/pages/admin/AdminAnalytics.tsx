import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, DollarSign, Users,
  ShoppingCart, Activity, Building2, ArrowUp, ArrowDown,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { apiRequest } from '../../lib/api';
import { Skeleton } from '../../components/design-system/Skeleton';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#E85D3D', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const mockRevenueData = [
  { month: 'Jan', revenue: 1200000, subscriptions: 250 },
  { month: 'Feb', revenue: 1350000, subscriptions: 280 },
  { month: 'Mar', revenue: 1500000, subscriptions: 310 },
  { month: 'Apr', revenue: 1450000, subscriptions: 340 },
  { month: 'May', revenue: 1650000, subscriptions: 375 },
  { month: 'Jun', revenue: 1800000, subscriptions: 400 },
  { month: 'Jul', revenue: 1950000, subscriptions: 435 },
  { month: 'Aug', revenue: 2100000, subscriptions: 470 },
  { month: 'Sep', revenue: 2300000, subscriptions: 510 },
];

const mockOrderData = [
  { day: 'Mon', orders: 1250 },
  { day: 'Tue', orders: 1380 },
  { day: 'Wed', orders: 1420 },
  { day: 'Thu', orders: 1390 },
  { day: 'Fri', orders: 1560 },
  { day: 'Sat', orders: 1680 },
  { day: 'Sun', orders: 1450 },
];

const mockPlanDistribution = [
  { name: 'Starter', value: 45 },
  { name: 'Business', value: 35 },
  { name: 'Enterprise', value: 20 },
];

export const AdminAnalytics: React.FC = () => {
  const [period, setPeriod] = useState('30');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiRequest('GET', '/admin/analytics'),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor platform performance and growth</p>
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Revenue',
            value: formatCurrency(analytics?.data?.totalRevenue || 0),
            icon: <DollarSign className="w-5 h-5" />,
            color: 'text-emerald-600 bg-emerald-100',
            trend: '+18.2%',
            trendUp: true,
          },
          {
            label: 'Total Restaurants',
            value: String(analytics?.data?.totalRestaurants || 0),
            icon: <Building2 className="w-5 h-5" />,
            color: 'text-blue-600 bg-blue-100',
            trend: '+12.5%',
            trendUp: true,
          },
          {
            label: 'Total Orders',
            value: String(analytics?.data?.totalOrders || 0),
            icon: <ShoppingCart className="w-5 h-5" />,
            color: 'text-purple-600 bg-purple-100',
            trend: '+22.1%',
            trendUp: true,
          },
          {
            label: 'Avg Order Value',
            value: formatCurrency(analytics?.data?.totalOrders > 0 ? (analytics.data.totalRevenue / analytics.data.totalOrders) : 0),
            icon: <Activity className="w-5 h-5" />,
            color: 'text-amber-600 bg-amber-100',
            trend: '-2.3%',
            trendUp: false,
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Revenue & Subscriptions Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E85D3D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E85D3D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (₦)"
                  stroke="#E85D3D"
                  fill="url(#revenueGradient)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="subscriptions"
                  name="Subscriptions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Plan Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPlanDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockPlanDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {mockPlanDistribution.map((plan, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-sm text-slate-600">{plan.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{plan.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Daily Orders</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockOrderData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Key Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Monthly Recurring Revenue', value: '₦2,300,000', change: '+15.3%', up: true },
              { label: 'Churn Rate', value: '2.8%', change: '-0.5%', up: true },
              { label: 'Customer Lifetime Value', value: '₦180,000', change: '+8.7%', up: true },
              { label: 'Customer Acquisition Cost', value: '₦25,000', change: '-3.2%', up: true },
              { label: 'Avg. Restaurant Revenue', value: '₦45,000', change: '+6.1%', up: true },
              { label: 'Active QR Codes', value: '2,450', change: '+12.8%', up: true },
            ].map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">{metric.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">{metric.value}</span>
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${metric.up ? 'text-emerald-600' : 'text-red-600'}`}>
                    {metric.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};