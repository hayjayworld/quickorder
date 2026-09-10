import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Building2, Phone, Mail, MapPin, Globe, Shield, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Skeleton } from '../../components/design-system/Skeleton';
import { Modal } from '../../components/design-system/Modal';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currency: 'NGN',
  });
  const [showDangerZone, setShowDangerZone] = useState(false);
  const queryClient = useQueryClient();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant'],
    queryFn: () => apiRequest('GET', '/restaurant'),
  });

  useEffect(() => {
    if (restaurant?.data) {
      setRestaurantForm({
        name: restaurant.data.name || '',
        email: restaurant.data.email || '',
        phone: restaurant.data.phone || '',
        address: restaurant.data.address || '',
        currency: restaurant.data.currency || 'NGN',
      });
    }
  }, [restaurant]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', '/restaurant', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
  });

  const handleSave = () => {
    if (!restaurantForm.name) {
      toast.error('Restaurant name is required');
      return;
    }
    updateMutation.mutate(restaurantForm);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your restaurant information</p>
        </div>
        <Button onClick={handleSave} loading={updateMutation.isPending}>
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      {/* Restaurant Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#E85D3D]" />
          Restaurant Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Restaurant Name *</label>
            <input
              className="input-field"
              value={restaurantForm.name}
              onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                className="input-field pl-10"
                value={restaurantForm.email}
                onChange={e => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input-field pl-10"
                value={restaurantForm.phone}
                onChange={e => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                className="input-field pl-10"
                rows={2}
                value={restaurantForm.address}
                onChange={e => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Currency</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                className="select-field pl-10"
                value={restaurantForm.currency}
                onChange={e => setRestaurantForm({ ...restaurantForm, currency: e.target.value })}
              >
                <option value="NGN">NGN - Nigerian Naira</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="GHS">GHS - Ghanaian Cedi</option>
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="ZAR">ZAR - South African Rand</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#E85D3D]" />
          Account Information
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700">Account Owner</p>
              <p className="text-sm text-slate-500">{user?.fullName}</p>
            </div>
            <Badge>Owner</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700">Email Address</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
            <Badge variant="info">Verified</Badge>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <h2 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-red-600 mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <div className="space-y-3">
          <Button variant="outline" onClick={() => setShowDangerZone(true)}>
            Delete Restaurant Account
          </Button>
          <Button variant="ghost" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDangerZone} onClose={() => setShowDangerZone(false)} title="Delete Restaurant">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">
              This will permanently delete your restaurant, all products, orders, QR codes, and staff.
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowDangerZone(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => toast.error('Contact support to delete your account')}>
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}