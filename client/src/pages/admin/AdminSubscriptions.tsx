import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CreditCard, CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { Table, THead, TBody, TH, TD } from '../../components/design-system/Table';
import { Skeleton } from '../../components/design-system/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate, formatCurrency, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export const AdminSubscriptions: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['admin-subscriptions', debouncedSearch, statusFilter],
    queryFn: () => apiRequest('GET', `/admin/subscriptions`),
  });

  const filteredSubscriptions = subscriptions?.data?.filter((sub: any) => {
    if (statusFilter && sub.status !== statusFilter) return false;
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      return (
        sub.restaurant?.name?.toLowerCase().includes(searchLower) ||
        sub.plan?.name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'TRIAL': return 'warning';
      case 'PAST_DUE': return 'danger';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all restaurant subscriptions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by restaurant or plan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIAL">Trial</option>
          <option value="PAST_DUE">Past Due</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active', value: subscriptions?.data?.filter((s: any) => s.status === 'ACTIVE').length || 0, color: 'text-emerald-600' },
          { label: 'Trial', value: subscriptions?.data?.filter((s: any) => s.status === 'TRIAL').length || 0, color: 'text-amber-600' },
          { label: 'Past Due', value: subscriptions?.data?.filter((s: any) => s.status === 'PAST_DUE').length || 0, color: 'text-red-600' },
          { label: 'Total', value: subscriptions?.data?.length || 0, color: 'text-slate-900' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : filteredSubscriptions?.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No subscriptions found
          </div>
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Restaurant</TH>
                <TH>Plan</TH>
                <TH>Status</TH>
                <TH>Price</TH>
                <TH>Period Start</TH>
                <TH>Period End</TH>
                <TH>Created</TH>
                <TH className="text-right">Actions</TH>
              </tr>
            </THead>
            <TBody>
              {filteredSubscriptions?.map((subscription: any) => (
                <tr key={subscription.id} className="hover:bg-slate-50">
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{subscription.restaurant?.name}</p>
                        <p className="text-xs text-slate-400">{subscription.restaurant?.slug}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant="info">{subscription.plan?.name}</Badge>
                  </TD>
                  <TD>
                    <Badge variant={statusBadgeVariant(subscription.status) as any}>
                      {subscription.status}
                    </Badge>
                  </TD>
                  <TD className="font-semibold text-sm">
                    {formatCurrency(Number(subscription.plan?.priceMonthly || 0))}
                  </TD>
                  <TD className="text-sm text-slate-500">
                    {subscription.currentPeriodStart ? formatDate(subscription.currentPeriodStart) : 'N/A'}
                  </TD>
                  <TD className="text-sm text-slate-500">
                    {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : 'N/A'}
                  </TD>
                  <TD className="text-sm text-slate-500">{formatDate(subscription.createdAt)}</TD>
                  <TD className="text-right">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="Download Invoice">
                      <Download className="w-4 h-4 text-slate-400" />
                    </button>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
};