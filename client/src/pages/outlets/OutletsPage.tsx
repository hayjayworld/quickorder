import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Store, MapPin, Phone, Clock, Table } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { Modal } from '../../components/design-system/Modal';
import { EmptyState } from '../../components/design-system/EmptyState';
import { Skeleton } from '../../components/design-system/Skeleton';
import toast from 'react-hot-toast';

export const OutletsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<any>(null);
  const [outletForm, setOutletForm] = useState({
    name: '',
    address: '',
    phone: '',
    openingHours: '',
  });
  const queryClient = useQueryClient();

  const { data: outlets, isLoading } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => apiRequest('GET', '/outlets'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/outlets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast.success('Outlet created');
      setShowModal(false);
      setOutletForm({ name: '', address: '', phone: '', openingHours: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create outlet');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest('PATCH', `/outlets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast.success('Outlet updated');
      setShowModal(false);
      setEditingOutlet(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/outlets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast.success('Outlet deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete outlet');
    },
  });

  const handleSubmit = () => {
    if (!outletForm.name) {
      toast.error('Outlet name is required');
      return;
    }
    if (editingOutlet) {
      updateMutation.mutate({ id: editingOutlet.id, data: outletForm });
    } else {
      createMutation.mutate(outletForm);
    }
  };

  const openEdit = (outlet: any) => {
    setEditingOutlet(outlet);
    setOutletForm({
      name: outlet.name,
      address: outlet.address || '',
      phone: outlet.phone || '',
      openingHours: outlet.openingHours || '',
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Outlets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your restaurant locations</p>
        </div>
        <Button onClick={() => { setEditingOutlet(null); setOutletForm({ name: '', address: '', phone: '', openingHours: '' }); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Add Outlet
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : outlets?.data?.length === 0 ? (
        <EmptyState
          title="No outlets yet"
          description="Create your first outlet to start managing tables and QR codes."
          actionLabel="Add Outlet"
          onAction={() => setShowModal(true)}
          icon={<Store className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets?.data?.map((outlet: any) => (
            <div key={outlet.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{outlet.name}</h3>
                  <Badge variant={outlet.status === 'ACTIVE' ? 'success' : 'default'}>
                    {outlet.status}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(outlet)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <Pencil className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(outlet.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-500">
                {outlet.address && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> {outlet.address}
                  </p>
                )}
                {outlet.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> {outlet.phone}
                  </p>
                )}
                {outlet.openingHours && (
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> {outlet.openingHours}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Table className="w-3.5 h-3.5" /> {outlet._count?.tables || 0} tables
                </span>
                <span className="text-xs text-slate-400">{outlet._count?.qrCodes || 0} QR codes</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingOutlet(null); }}
        title={editingOutlet ? 'Edit Outlet' : 'Add Outlet'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Outlet Name *</label>
            <input
              className="input-field"
              value={outletForm.name}
              onChange={e => setOutletForm({ ...outletForm, name: e.target.value })}
              placeholder="e.g., Ikeja Branch"
            />
          </div>
          <div>
            <label className="label">Address</label>
            <input
              className="input-field"
              value={outletForm.address}
              onChange={e => setOutletForm({ ...outletForm, address: e.target.value })}
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input
                className="input-field"
                value={outletForm.phone}
                onChange={e => setOutletForm({ ...outletForm, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="label">Opening Hours</label>
              <input
                className="input-field"
                value={outletForm.openingHours}
                onChange={e => setOutletForm({ ...outletForm, openingHours: e.target.value })}
                placeholder="e.g., 9AM - 10PM"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
              {editingOutlet ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};