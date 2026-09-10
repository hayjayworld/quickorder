import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Users, KeyRound, Shield, UserCheck } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { Modal } from '../../components/design-system/Modal';
import { EmptyState } from '../../components/design-system/EmptyState';
import { Skeleton } from '../../components/design-system/Skeleton';
import { Table, THead, TBody, TH, TD } from '../../components/design-system/Table';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const roleLabels: Record<string, string> = {
  RESTAURANT_ADMIN: 'Admin',
  RESTAURANT_MANAGER: 'Manager',
  FRONT_DESK: 'Front Desk',
};

const roleBadgeVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  RESTAURANT_ADMIN: 'danger',
  RESTAURANT_MANAGER: 'warning',
  FRONT_DESK: 'info',
};

export const StaffPage: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    role: 'FRONT_DESK',
    outletId: '',
  });
  const [resetForm, setResetForm] = useState({ newPassword: '' });
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => apiRequest('GET', '/staff'),
  });

  const { data: outlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => apiRequest('GET', '/outlets'),
  });

  const inviteMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/staff/invite', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff invited successfully');
      setShowInviteModal(false);
      setInviteForm({ email: '', fullName: '', role: 'FRONT_DESK', outletId: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to invite staff');
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest('PATCH', `/staff/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff updated');
    },
  });

  const removeStaffMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff removed');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      apiRequest('POST', `/staff/${id}/reset-password`, { newPassword }),
    onSuccess: () => {
      toast.success('Password reset successfully');
      setShowResetModal(false);
      setResetForm({ newPassword: '' });
      setEditingStaff(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });

  const handleInvite = () => {
    if (!inviteForm.email || !inviteForm.fullName) {
      toast.error('Email and name are required');
      return;
    }
    inviteMutation.mutate(inviteForm);
  };

  const canManageStaff = currentUser?.role === 'RESTAURANT_ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your team members and their roles</p>
        </div>
        {canManageStaff && (
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus className="w-4 h-4" /> Invite Staff
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : staff?.data?.length === 0 ? (
          <EmptyState
            title="No staff members yet"
            description="Invite your team members to help manage orders and operations."
            actionLabel={canManageStaff ? "Invite Staff" : undefined}
            onAction={canManageStaff ? () => setShowInviteModal(true) : undefined}
            icon={<Users className="w-8 h-8 text-slate-400" />}
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Staff Member</TH>
                <TH>Role</TH>
                <TH>Outlet</TH>
                <TH>Status</TH>
                <TH>Last Active</TH>
                <TH className="text-right">Actions</TH>
              </tr>
            </THead>
            <TBody>
              {staff?.data?.map((member: any) => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                        {member.user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.user?.fullName}</p>
                        <p className="text-xs text-slate-400">{member.user?.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant={roleBadgeVariants[member.user?.role] || 'default'}>
                      {roleLabels[member.user?.role] || member.user?.role}
                    </Badge>
                  </TD>
                  <TD>{member.outlet?.name || 'All Outlets'}</TD>
                  <TD>
                    <Badge variant={member.user?.isActive ? 'success' : 'default'}>
                      {member.user?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TD>
                  <TD className="text-sm text-slate-500">
                    {member.user?.lastLoginAt
                      ? new Date(member.user.lastLoginAt).toLocaleDateString()
                      : 'Never'}
                  </TD>
                  <TD className="text-right">
                    {canManageStaff && (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingStaff(member);
                            setShowResetModal(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={() => {
                            const newRole = member.user?.role === 'FRONT_DESK'
                              ? 'RESTAURANT_MANAGER'
                              : 'FRONT_DESK';
                            updateStaffMutation.mutate({ id: member.id, data: { role: newRole } });
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg"
                          title="Change Role"
                        >
                          <Shield className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Remove this staff member?')) {
                              removeStaffMutation.mutate(member.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Staff">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              className="input-field"
              value={inviteForm.fullName}
              onChange={e => setInviteForm({ ...inviteForm, fullName: e.target.value })}
              placeholder="Staff member name"
            />
          </div>
          <div>
            <label className="label">Email Address *</label>
            <input
              type="email"
              className="input-field"
              value={inviteForm.email}
              onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
              placeholder="staff@restaurant.com"
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select
              className="select-field"
              value={inviteForm.role}
              onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
            >
              <option value="FRONT_DESK">Front Desk</option>
              <option value="RESTAURANT_MANAGER">Manager</option>
              <option value="RESTAURANT_ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="label">Assign Outlet</label>
            <select
              className="select-field"
              value={inviteForm.outletId}
              onChange={e => setInviteForm({ ...inviteForm, outletId: e.target.value })}
            >
              <option value="">All Outlets</option>
              {outlets?.data?.map((outlet: any) => (
                <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button onClick={handleInvite} loading={inviteMutation.isPending}>
              <UserCheck className="w-4 h-4" /> Invite
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={showResetModal} onClose={() => { setShowResetModal(false); setEditingStaff(null); }} title="Reset Password">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Reset password for {editingStaff?.user?.fullName}
          </p>
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              className="input-field"
              value={resetForm.newPassword}
              onChange={e => setResetForm({ newPassword: e.target.value })}
              placeholder="Enter new password"
              minLength={8}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button
              onClick={() => resetPasswordMutation.mutate({ id: editingStaff.id, newPassword: resetForm.newPassword })}
              loading={resetPasswordMutation.isPending}
              disabled={!resetForm.newPassword || resetForm.newPassword.length < 8}
            >
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};