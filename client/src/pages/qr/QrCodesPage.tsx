import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, QrCode, Download, Printer, Trash2, Eye } from 'lucide-react';
import QRCode from 'qrcode.react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { Modal } from '../../components/design-system/Modal';
import { EmptyState } from '../../components/design-system/EmptyState';
import { Table, THead, TBody, TH, TD } from '../../components/design-system/Table';
import { Skeleton } from '../../components/design-system/Skeleton';
import toast from 'react-hot-toast';

export const QrCodesPage: React.FC = () => {
  const [showGenerate, setShowGenerate] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    outletId: '',
    tableId: '',
    label: '',
    customLabel: '',
  });
  const queryClient = useQueryClient();

  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ['qr-codes'],
    queryFn: () => apiRequest('GET', '/qr'),
  });

  const { data: outlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => apiRequest('GET', '/outlets'),
  });

  const { data: tables } = useQuery({
    queryKey: ['tables', generateForm.outletId],
    queryFn: () => apiRequest('GET', `/outlets/${generateForm.outletId}/tables`),
    enabled: !!generateForm.outletId,
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/qr', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      toast.success('QR code generated');
      setShowGenerate(false);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/qr/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      toast.success('QR code revoked');
    },
  });

  const handleGenerate = () => {
    if (!generateForm.outletId) {
      toast.error('Please select an outlet');
      return;
    }
    generateMutation.mutate({
      outletId: generateForm.outletId,
      tableId: generateForm.tableId || undefined,
      customLabel: generateForm.customLabel || generateForm.label,
    });
  };

  const downloadQR = (qrCode: any) => {
    const canvas = document.getElementById(`qr-${qrCode.id}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${qrCode.label || qrCode.token}.png`;
      a.click();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">QR Codes</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage QR codes for your tables</p>
        </div>
        <Button onClick={() => setShowGenerate(true)}>
          <Plus className="w-4 h-4" /> Generate QR
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : qrCodes?.data?.length === 0 ? (
          <EmptyState
            title="No QR codes yet"
            description="Generate a QR code for your first table to start receiving orders."
            actionLabel="Generate QR"
            onAction={() => setShowGenerate(true)}
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>QR Preview</TH>
                <TH>Label</TH>
                <TH>Outlet</TH>
                <TH>Status</TH>
                <TH>Scans</TH>
                <TH>Created</TH>
                <TH className="text-right">Actions</TH>
              </tr>
            </THead>
            <TBody>
              {qrCodes?.data?.map((qr: any) => (
                <tr key={qr.id} className="hover:bg-slate-50">
                  <TD>
                    <div className="w-12 h-12">
                      <QRCode id={`qr-${qr.id}`} value={`${import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'}/order/${qr.token}`} size={48} />
                    </div>
                  </TD>
                  <TD className="font-medium">{qr.label || 'No label'}</TD>
                  <TD>{qr.outlet?.name}</TD>
                  <TD>
                    <Badge variant={qr.status === 'ACTIVE' ? 'success' : qr.status === 'INACTIVE' ? 'warning' : 'danger'}>
                      {qr.status}
                    </Badge>
                  </TD>
                  <TD>{qr.totalScans}</TD>
                  <TD>{new Date(qr.createdAt).toLocaleDateString()}</TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => downloadQR(qr)} className="p-1.5 hover:bg-slate-100 rounded-lg" title="Download">
                        <Download className="w-4 h-4 text-slate-500" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="Print">
                        <Printer className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => revokeMutation.mutate(qr.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                        title="Revoke"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      {/* Generate Modal */}
      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate QR Code">
        <div className="space-y-4">
          <div>
            <label className="label">Outlet *</label>
            <select
              className="select-field"
              value={generateForm.outletId}
              onChange={e => setGenerateForm({...generateForm, outletId: e.target.value})}
            >
              <option value="">Select outlet</option>
              {outlets?.data?.map((outlet: any) => (
                <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Table</label>
            <select
              className="select-field"
              value={generateForm.tableId}
              onChange={e => setGenerateForm({...generateForm, tableId: e.target.value})}
              disabled={!generateForm.outletId}
            >
              <option value="">Select table (optional)</option>
              {tables?.data?.map((table: any) => (
                <option key={table.id} value={table.id}>{table.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Custom Label</label>
            <input
              className="input-field"
              value={generateForm.customLabel}
              onChange={e => setGenerateForm({...generateForm, customLabel: e.target.value})}
              placeholder="e.g., VIP Table"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowGenerate(false)}>Cancel</Button>
            <Button onClick={handleGenerate} loading={generateMutation.isPending}>Generate QR</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};