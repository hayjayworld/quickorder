import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package, Check, X, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { Modal } from '../../components/design-system/Modal';
import { Skeleton } from '../../components/design-system/Skeleton';
import { formatCurrency, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface PlanFormData {
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  maxOutlets: number;
  maxStaff: number;
  features: Record<string, boolean>;
}

const defaultFeatures: Record<string, boolean> = {
  QR_ORDERING: true,
  MENU_MANAGEMENT: true,
  ORDER_MANAGEMENT: true,
  BASIC_ANALYTICS: true,
  ADVANCED_ANALYTICS: false,
  MULTIPLE_STAFF: false,
  QR_ANALYTICS: false,
  CUSTOM_THEMES: false,
  PRIORITY_SUPPORT: false,
};

export const AdminPlans: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm, setPlanForm] = useState<PlanFormData>({
    name: '',
    slug: '',
    description: '',
    priceMonthly: 0,
    maxOutlets: 1,
    maxStaff: 2,
    features: { ...defaultFeatures },
  });
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => apiRequest('GET', '/admin/plans'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/admin/plans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success('Plan created successfully');
      setShowModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest('PATCH', `/admin/plans/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success('Plan updated');
      setShowModal(false);
      setEditingPlan(null);
    },
  });

  const resetForm = () => {
    setPlanForm({
      name: '',
      slug: '',
      description: '',
      priceMonthly: 0,
      maxOutlets: 1,
      maxStaff: 2,
      features: { ...defaultFeatures },
    });
  };

  const handleSubmit = () => {
    if (!planForm.name || !planForm.slug) {
      toast.error('Name and slug are required');
      return;
    }
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: planForm });
    } else {
      createMutation.mutate(planForm);
    }
  };

  const toggleFeature = (feature: string) => {
    setPlanForm({
      ...planForm,
      features: {
        ...planForm.features,
        [feature]: !planForm.features[feature],
      },
    });
  };

  const featureLabels: Record<string, string> = {
    QR_ORDERING: 'QR Ordering',
    MENU_MANAGEMENT: 'Menu Management',
    ORDER_MANAGEMENT: 'Order Management',
    BASIC_ANALYTICS: 'Basic Analytics',
    ADVANCED_ANALYTICS: 'Advanced Analytics',
    MULTIPLE_STAFF: 'Multiple Staff',
    QR_ANALYTICS: 'QR Analytics',
    CUSTOM_THEMES: 'Custom Themes',
    PRIORITY_SUPPORT: 'Priority Support',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage pricing plans</p>
        </div>
        <Button onClick={() => { setEditingPlan(null); resetForm(); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Create Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.data?.map((plan: any) => (
            <div key={plan.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-400">{plan.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingPlan(plan);
                      setPlanForm({
                        name: plan.name,
                        slug: plan.slug,
                        description: plan.description || '',
                        priceMonthly: Number(plan.priceMonthly),
                        maxOutlets: plan.maxOutlets,
                        maxStaff: plan.maxStaff,
                        features: plan.features as Record<string, boolean>,
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg"
                  >
                    <Pencil className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                    {plan.isActive ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4">{plan.description || 'No description'}</p>
              <p className="text-3xl font-bold text-slate-900 mb-4">
                {formatCurrency(Number(plan.priceMonthly))}
                <span className="text-sm font-normal text-slate-500">/month</span>
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Package className="w-4 h-4 text-slate-400" />
                  {plan.maxOutlets} outlet{plan.maxOutlets > 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Package className="w-4 h-4 text-slate-400" />
                  {plan.maxStaff} staff members
                </div>
              </div>
              <div className="space-y-1.5 mb-6">
                {plan.features && Object.entries(plan.features as Record<string, boolean>)
                  .filter(([_, enabled]) => enabled)
                  .slice(0, 5)
                  .map(([feature]) => (
                    <div key={feature} className="flex items-center gap-2 text-xs text-slate-500">
                      <Check className="w-3 h-3 text-emerald-500" />
                      {featureLabels[feature] || feature}
                    </div>
                  ))}
                {plan.features && Object.keys(plan.features).filter(f => plan.features[f]).length > 5 && (
                  <p className="text-xs text-slate-400">
                    +{Object.keys(plan.features).filter(f => plan.features[f]).length - 5} more features
                  </p>
                )}
              </div>
              <Badge variant={plan.isActive ? 'success' : 'default'}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Plan Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingPlan(null); }}
        title={editingPlan ? 'Edit Plan' : 'Create Plan'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Plan Name *</label>
              <input
                className="input-field"
                value={planForm.name}
                onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                placeholder="e.g., Business"
              />
            </div>
            <div>
              <label className="label">Slug *</label>
              <input
                className="input-field"
                value={planForm.slug}
                onChange={e => setPlanForm({ ...planForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g., business"
              />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={2}
              value={planForm.description}
              onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
              placeholder="Plan description"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Price (Monthly)</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={planForm.priceMonthly}
                onChange={e => setPlanForm({ ...planForm, priceMonthly: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Max Outlets</label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={planForm.maxOutlets}
                onChange={e => setPlanForm({ ...planForm, maxOutlets: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Max Staff</label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={planForm.maxStaff}
                onChange={e => setPlanForm({ ...planForm, maxStaff: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="label mb-3">Features</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(defaultFeatures).map(feature => (
                <button
                  key={feature}
                  onClick={() => toggleFeature(feature)}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-all',
                    planForm.features[feature]
                      ? 'border-[#E85D3D] bg-[#E85D3D]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <span className="text-sm text-slate-700">{featureLabels[feature] || feature}</span>
                  {planForm.features[feature] ? (
                    <Check className="w-4 h-4 text-[#E85D3D]" />
                  ) : (
                    <X className="w-4 h-4 text-slate-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setShowModal(false); setEditingPlan(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};