import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Building2, Eye, Ban, CheckCircle2,
  ChevronDown, MapPin, Users, ShoppingCart, DollarSign,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { Modal } from '../../components/design-system/Modal';
import { Table, THead, TBody, TH, TD } from '../../components/design-system/Table';
import { Skeleton } from '../../components/design-system/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate, formatCurrency, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export const AdminRestaurants: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['admin-restaurants', debouncedSearch, statusFilter, page],
    queryFn: () => apiRequest('GET', `/admin/restaurants?search=${debouncedSearch}&status=${statusFilter}&page=${page}&limit=20`),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => apiRequest('PATCH', `/admin/restaurants/${id}/suspend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      toast.success('Restaurant suspended');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => apiRequest('PATCH', `/admin/restaurants/${id}/reactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      toast.success('Restaurant reactivated');
    },
  });

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'TRIAL': return 'warning';
      case 'SUSPENDED': return 'danger';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Restaurants</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all restaurants on the platform</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search restaurants..."
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
          <option value="SUSPENDED">Suspended</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Restaurant</TH>
                <TH>Owner</TH>
                <TH>Plan</TH>
                <TH>Outlets</TH>
                <TH>Orders</TH>
                <TH>Status</TH>
                <TH>Created</TH>
                <TH className="text-right">Actions</TH>
              </tr>
            </THead>
            <TBody>
              {restaurants?.data?.map((restaurant: any) => {
                const owner = restaurant.restaurantUsers?.[0]?.user;
                const currentPlan = restaurant.subscriptions?.[0]?.plan;
                return (
                  <tr key={restaurant.id} className="hover:bg-slate-50">
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{restaurant.name}</p>
                          <p className="text-xs text-slate-400">{restaurant.slug}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <div>
                        <p className="text-sm">{owner?.fullName || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{owner?.email}</p>
                      </div>
                    </TD>
                    <TD>
                      <Badge variant="info">{currentPlan?.name || 'No Plan'}</Badge>
                    </TD>
                    <TD className="text-sm">{restaurant._count?.outlets || 0}</TD>
                    <TD className="text-sm">{restaurant._count?.orders || 0}</TD>
                    <TD>
                      <Badge variant={statusBadgeVariant(restaurant.status) as any}>
                        {restaurant.status}
                      </Badge>
                    </TD>
                    <TD className="text-sm text-slate-500">{formatDate(restaurant.createdAt)}</TD>
                    <TD className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setShowDetail(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        {restaurant.status === 'SUSPENDED' ? (
                          <button
                            onClick={() => reactivateMutation.mutate(restaurant.id)}
                            className="p-1.5 hover:bg-emerald-50 rounded-lg"
                            title="Reactivate"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => suspendMutation.mutate(restaurant.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg"
                            title="Suspend"
                          >
                            <Ban className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </TD>
                  </tr>
                );
              })}
            </TBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {restaurants?.pagination && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">
            Showing {((restaurants.pagination.page - 1) * restaurants.pagination.limit) + 1}-
            {Math.min(restaurants.pagination.page * restaurants.pagination.limit, restaurants.pagination.total)} of {restaurants.pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!restaurants.pagination.hasPrevPage}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!restaurants.pagination.hasNextPage}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Restaurant Details" size="lg">
        {selectedRestaurant && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedRestaurant.name}</h3>
                <p className="text-sm text-slate-500">Slug: {selectedRestaurant.slug}</p>
                <Badge variant={statusBadgeVariant(selectedRestaurant.status) as any}>
                  {selectedRestaurant.status}
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <Users className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-slate-900">{selectedRestaurant.outlets?.length || 0}</p>
                <p className="text-xs text-slate-500">Outlets</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <ShoppingCart className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-slate-900">{selectedRestaurant._count?.orders || 0}</p>
                <p className="text-xs text-slate-500">Orders</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <DollarSign className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(selectedRestaurant.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0)}
                </p>
                <p className="text-xs text-slate-500">Revenue</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <MapPin className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-slate-900">
                  {selectedRestaurant.restaurantUsers?.length || 0}
                </p>
                <p className="text-xs text-slate-500">Staff</p>
              </div>
            </div>

            {/* Owner */}
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Owner</h4>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium">{selectedRestaurant.restaurantUsers?.[0]?.user?.fullName}</p>
                <p className="text-sm text-slate-500">{selectedRestaurant.restaurantUsers?.[0]?.user?.email}</p>
                <p className="text-sm text-slate-500">{selectedRestaurant.restaurantUsers?.[0]?.user?.phone || 'No phone'}</p>
              </div>
            </div>

            {/* Outlets */}
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Outlets</h4>
              <div className="space-y-2">
                {selectedRestaurant.outlets?.map((outlet: any) => (
                  <div key={outlet.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{outlet.name}</p>
                      <p className="text-xs text-slate-500">{outlet.address || 'No address'}</p>
                    </div>
                    <Badge variant={outlet.status === 'ACTIVE' ? 'success' : 'default'}>
                      {outlet.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription */}
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Subscription</h4>
              {selectedRestaurant.subscriptions?.[0] && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{selectedRestaurant.subscriptions[0].plan.name}</p>
                    <p className="text-xs text-slate-500">
                      Status: {selectedRestaurant.subscriptions[0].status}
                    </p>
                  </div>
                  <Badge variant={selectedRestaurant.subscriptions[0].status === 'ACTIVE' ? 'success' : 'warning'}>
                    {selectedRestaurant.subscriptions[0].status}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};