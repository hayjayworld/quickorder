import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard, Check, X, AlertTriangle, Download,
  Calendar, ArrowRight, Sparkles,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { Modal } from '../../components/design-system/Modal';
import { Skeleton } from '../../components/design-system/Skeleton';
import { formatDate, formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export const SubscriptionPage: React.FC = () => {
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiRequest('GET', '/subscription'),
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiRequest('GET', '/subscription/plans'),
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => apiRequest('GET', '/subscription/invoices'),
  });

  const changePlanMutation = useMutation({
    mutationFn: (planId: string) => apiRequest('POST', '/subscription/change', { planId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan updated successfully');
      setShowChangePlan(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change plan');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/subscription/cancel'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription cancelled');
      setShowCancelConfirm(false);
    },
  });

  const currentPlan = subscription?.data?.plan;
  const subscriptionStatus = subscription?.data?.status;

  if (subLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your plan and billing</p>
        </div>
        {subscriptionStatus === 'ACTIVE' && (
          <Button variant="outline" onClick={() => setShowChangePlan(true)}>
            <Sparkles className="w-4 h-4" /> Change Plan
          </Button>
        )}
      </div>

      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">Current Plan</p>
            <h2 className="text-3xl font-bold">{currentPlan?.name || 'No Active Plan'}</h2>
          </div>
          <Badge variant={subscriptionStatus === 'ACTIVE' ? 'success' : subscriptionStatus === 'TRIAL' ? 'warning' : 'danger'}>
            {subscriptionStatus || 'INACTIVE'}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">Price</p>
            <p className="text-2xl font-bold">
              {currentPlan ? formatCurrency(Number(currentPlan.priceMonthly)) : 'N/A'}
              <span className="text-sm font-normal text-slate-400">/month</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">
              {subscriptionStatus === 'TRIAL' ? 'Trial Ends' : 'Renewal Date'}
            </p>
            <p className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              {subscription?.data?.currentPeriodEnd
                ? formatDate(subscription.data.currentPeriodEnd)
                : subscription?.data?.trialEndsAt
                  ? formatDate(subscription.data.trialEndsAt)
                  : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Outlets Used</p>
            <p className="text-2xl font-bold">
              {subscription?.data?.restaurant?.outlets?.length || 0} / {currentPlan?.maxOutlets || 1}
            </p>
          </div>
        </div>
        {subscriptionStatus === 'ACTIVE' && (
          <Button variant="destructive" onClick={() => setShowCancelConfirm(true)}>
            Cancel Subscription
          </Button>
        )}
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">Available Plans</h2>
        {plansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.data?.map((plan: any) => {
              const isCurrent = plan.id === currentPlan?.id;
              const features = plan.features as Record<string, boolean>;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'rounded-xl border-2 p-6',
                    isCurrent ? 'border-[#E85D3D] bg-[#E85D3D]/5' : 'border-slate-200 bg-white'
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-slate-900">{plan.name}</h3>
                    {isCurrent && <Badge variant="info">Current</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
                  <p className="text-3xl font-bold text-slate-900 mb-6">
                    {formatCurrency(Number(plan.priceMonthly))}
                    <span className="text-sm font-normal text-slate-500">/month</span>
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Up to {plan.maxOutlets} outlet{plan.maxOutlets > 1 ? 's' : ''}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Up to {plan.maxStaff} staff members
                    </li>
                    {features && Object.entries(features)
                      .filter(([_, value]) => value)
                      .map(([feature]) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                          <Check className="w-4 h-4 text-emerald-500" />
                          {feature.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                        </li>
                      ))}
                  </ul>
                  {!isCurrent && (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        setShowChangePlan(true);
                      }}
                    >
                      Switch to {plan.name}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-4">Invoices</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {invoicesLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : invoices?.data?.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No invoices yet
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {invoices?.data?.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-sm">{invoice.reference}</p>
                      <p className="text-xs text-slate-500">{formatDate(invoice.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={invoice.status === 'PAID' ? 'success' : invoice.status === 'PENDING' ? 'warning' : 'danger'}>
                      {invoice.status}
                    </Badge>
                    <span className="font-semibold text-sm">{formatCurrency(Number(invoice.amount))}</span>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                      <Download className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Change Plan Modal */}
      <Modal isOpen={showChangePlan} onClose={() => setShowChangePlan(false)} title="Change Plan">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Are you sure you want to change your subscription plan?
          </p>
          {selectedPlan && (
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">
                New plan: <strong>{plans?.data?.find((p: any) => p.id === selectedPlan)?.name}</strong>
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowChangePlan(false)}>Cancel</Button>
            <Button
              onClick={() => changePlanMutation.mutate(selectedPlan)}
              loading={changePlanMutation.isPending}
            >
              Confirm Change
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} title="Cancel Subscription">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Cancelling your subscription will deactivate your QR codes and prevent customers from placing orders.
              Your data will be preserved but you will lose access to all features.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>Keep Subscription</Button>
            <Button variant="destructive" onClick={() => cancelMutation.mutate()} loading={cancelMutation.isPending}>
              <X className="w-4 h-4" /> Cancel Subscription
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};