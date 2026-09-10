import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, QrCode, Grid3x3, Users } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { Modal } from '../../components/design-system/Modal';
import { EmptyState } from '../../components/design-system/EmptyState';
import { Skeleton } from '../../components/design-system/Skeleton';
import toast from 'react-hot-toast';

export const TablesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [outletFilter, setOutletFilter] = useState('');
  const [tableForm, setTableForm] = useState({
    outletId: '',
    label: '',
    capacity: 4,
    location: '',
  });
  const queryClient = useQueryClient();

  const { data: outlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => apiRequest('GET', '/outlets'),
  });

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables', outletFilter],
    queryFn: () => apiRequest('GET', `/tables?outletId=${outletFilter}`),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/tables', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table created');
      setShowModal(false);
      setTableForm({ outletId: '', label: '', capacity: 4, location: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest('PATCH', `/tables/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table updated');
      setShowModal(false);
      setEditingTable(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/tables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete table');
    },
  });

  const handleSubmit = () => {
    if (!tableForm.outletId || !tableForm.label) {
      toast.error('Outlet and label are required');
      return;
    }
    if (editingTable) {
      updateMutation.mutate({ id: editingTable.id, data: tableForm });
    } else {
      createMutation.mutate(tableForm);
    }
  };

  const generateQrForTable = async (tableId: string, outletId: string) => {
    try {
      await apiRequest('POST', '/qr', { outletId, tableId });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      toast.success('QR code generated');
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tables</h1>
          <p className="text-sm text-slate-500 mt-1">Manage tables for your outlets</p>
        </div>
        <Button onClick={() => { setEditingTable(null); setTableForm({ outletId: outletFilter, label: '', capacity: 4, location: '' }); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Add Table
        </Button>
      </div>

      <div className="mb-6">
        <select
          value={outletFilter}
          onChange={e => setOutletFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
        >
          <option value="">All Outlets</option>
          {outlets?.data?.map((outlet: any) => (
            <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : tables?.data?.length === 0 ? (
        <EmptyState
          title="No tables yet"
          description="Add tables to your outlet and generate QR codes for them."
          actionLabel="Add Table"
          onAction={() => setShowModal(true)}
          icon={<Grid3x3 className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables?.data?.map((table: any) => (
            <div key={table.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{table.label}</p>
                  <p className="text-xs text-slate-400">{table.outlet?.name}</p>
                </div>
                <Badge
                  variant={table.status === 'AVAILABLE' ? 'success' : table.status === 'OCCUPIED' ? 'warning' : 'default'}
                >
                  {table.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Users className="w-3.5 h-3.5" />
                {table.capacity} seats
                {table.location && <span>· {table.location}</span>}
              </div>
              <div className="flex items-center justify-between">
                {table.qrCodes?.length > 0 ? (
                  <Badge variant="info">QR Active</Badge>
                ) : (
                  <button
                    onClick={() => generateQrForTable(table.id, table.outletId)}
                    className="text-xs text-[#E85D3D] hover:underline flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Generate QR
                  </button>
                )}
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingTable(table);
                      setTableForm({
                        outletId: table.outletId,
                        label: table.label,
                        capacity: table.capacity,
                        location: table.location || '',
                      });
                      setShowModal(true);
                    }}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(table.id)}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTable(null); }}
        title={editingTable ? 'Edit Table' : 'Add Table'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Outlet *</label>
            <select
              className="select-field"
              value={tableForm.outletId}
              onChange={e => setTableForm({ ...tableForm, outletId: e.target.value })}
              disabled={!!editingTable}
            >
              <option value="">Select outlet</option>
              {outlets?.data?.map((outlet: any) => (
                <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Table Label *</label>
            <input
              className="input-field"
              value={tableForm.label}
              onChange={e => setTableForm({ ...tableForm, label: e.target.value })}
              placeholder="e.g., Table 01"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Capacity</label>
              <input
                type="number"
                min="1"
                max="50"
                className="input-field"
                value={tableForm.capacity}
                onChange={e => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                className="input-field"
                value={tableForm.location}
                onChange={e => setTableForm({ ...tableForm, location: e.target.value })}
                placeholder="e.g., Window"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
              {editingTable ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};