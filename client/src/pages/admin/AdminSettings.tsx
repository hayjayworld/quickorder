import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save, Settings, Globe, Mail, Shield, Bell,
  Database, Server, Activity, AlertTriangle,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { Modal } from '../../components/design-system/Modal';
import { Skeleton } from '../../components/design-system/Skeleton';
import toast from 'react-hot-toast';

export const AdminSettings: React.FC = () => {
  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'QuickOrder',
    supportEmail: 'support@quickorder.io',
    defaultCurrency: 'NGN',
    maxUploadSize: 5,
    allowSelfRegistration: true,
    autoApproveRestaurants: true,
    maintenanceMode: false,
  });
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@quickorder.io',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    newOrderNotifications: true,
    subscriptionNotifications: true,
    staffNotifications: true,
    platformAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const saveSettings = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure global platform settings</p>
        </div>
        <Button onClick={saveSettings}>
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#E85D3D]" />
          General Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Platform Name</label>
            <input
              className="input-field"
              value={platformSettings.platformName}
              onChange={e => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Support Email</label>
            <input
              type="email"
              className="input-field"
              value={platformSettings.supportEmail}
              onChange={e => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Default Currency</label>
            <select
              className="select-field"
              value={platformSettings.defaultCurrency}
              onChange={e => setPlatformSettings({ ...platformSettings, defaultCurrency: e.target.value })}
            >
              <option value="NGN">NGN - Nigerian Naira</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="GHS">GHS - Ghanaian Cedi</option>
              <option value="KES">KES - Kenyan Shilling</option>
            </select>
          </div>
          <div>
            <label className="label">Max Upload Size (MB)</label>
            <input
              type="number"
              min="1"
              max="20"
              className="input-field"
              value={platformSettings.maxUploadSize}
              onChange={e => setPlatformSettings({ ...platformSettings, maxUploadSize: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={platformSettings.allowSelfRegistration}
              onChange={e => setPlatformSettings({ ...platformSettings, allowSelfRegistration: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Allow self-registration</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={platformSettings.autoApproveRestaurants}
              onChange={e => setPlatformSettings({ ...platformSettings, autoApproveRestaurants: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Auto-approve new restaurants</span>
          </label>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#E85D3D]" />
          Email Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">SMTP Host</label>
            <input
              className="input-field"
              value={emailSettings.smtpHost}
              onChange={e => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
              placeholder="smtp.example.com"
            />
          </div>
          <div>
            <label className="label">SMTP Port</label>
            <input
              type="number"
              className="input-field"
              value={emailSettings.smtpPort}
              onChange={e => setEmailSettings({ ...emailSettings, smtpPort: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">SMTP Username</label>
            <input
              className="input-field"
              value={emailSettings.smtpUser}
              onChange={e => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
            />
          </div>
          <div>
            <label className="label">SMTP Password</label>
            <input
              type="password"
              className="input-field"
              value={emailSettings.smtpPassword}
              onChange={e => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
            />
          </div>
          <div>
            <label className="label">From Email</label>
            <input
              type="email"
              className="input-field"
              value={emailSettings.fromEmail}
              onChange={e => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#E85D3D]" />
          Notification Settings
        </h2>
        <div className="space-y-3">
          {[
            { key: 'newOrderNotifications', label: 'New Order Notifications' },
            { key: 'subscriptionNotifications', label: 'Subscription Notifications' },
            { key: 'staffNotifications', label: 'Staff Activity Notifications' },
            { key: 'platformAlerts', label: 'Platform Alerts' },
            { key: 'emailNotifications', label: 'Email Notifications' },
            { key: 'smsNotifications', label: 'SMS Notifications' },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                onChange={e => setNotificationSettings({
                  ...notificationSettings,
                  [item.key]: e.target.checked,
                })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Server className="w-5 h-5 text-[#E85D3D]" />
          System Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Platform Version</p>
            <p className="font-medium text-slate-900">v1.0.0</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Database Status</p>
            <Badge variant="success">Connected</Badge>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">API Status</p>
            <Badge variant="success">Operational</Badge>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">WebSocket Status</p>
            <Badge variant="success">Connected</Badge>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
        <h2 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Maintenance Mode
        </h2>
        <p className="text-sm text-amber-700 mb-4">
          Putting the platform in maintenance mode will temporarily disable access for all users.
        </p>
        <Button
          variant="outline"
          onClick={() => setShowMaintenanceModal(true)}
        >
          {platformSettings.maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
        </Button>
      </div>

      {/* Maintenance Modal */}
      <Modal isOpen={showMaintenanceModal} onClose={() => setShowMaintenanceModal(false)} title="Maintenance Mode">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Are you sure you want to {platformSettings.maintenanceMode ? 'disable' : 'enable'} maintenance mode?
            {!platformSettings.maintenanceMode && ' Users will not be able to access the platform while maintenance is active.'}
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowMaintenanceModal(false)}>Cancel</Button>
            <Button
              variant={platformSettings.maintenanceMode ? 'primary' : 'destructive'}
              onClick={() => {
                setPlatformSettings({ ...platformSettings, maintenanceMode: !platformSettings.maintenanceMode });
                setShowMaintenanceModal(false);
                toast.success(`Maintenance mode ${platformSettings.maintenanceMode ? 'disabled' : 'enabled'}`);
              }}
            >
              {platformSettings.maintenanceMode ? 'Disable' : 'Enable'} Maintenance
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};