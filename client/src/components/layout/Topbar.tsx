import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';

export const Topbar: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = React.useState(false);
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: () => apiRequest('GET', '/notifications/unread-count'),
    refetchInterval: 30000,
  });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-lg">
          <Menu className="w-5 h-5 text-slate-500" />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:outline-none focus:border-[#E85D3D]"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setNotifications(!notifications)}
          className="relative p-2 hover:bg-slate-100 rounded-lg"
        >
          <Bell className="w-5 h-5 text-slate-500" />
          {unreadCount?.data > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount.data}
            </span>
          )}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            {user?.fullName}
          </span>
        </div>
      </div>
      {notifications && (
        <div className="absolute right-6 top-16 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {/* Notifications would be loaded here */}
            <p className="text-sm text-slate-400 text-center py-8">No notifications</p>
          </div>
        </div>
      )}
    </header>
  );
};