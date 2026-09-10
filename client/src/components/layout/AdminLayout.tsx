import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, CreditCard, Package, BarChart3, Settings, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/restaurants', icon: Building2, label: 'Restaurants' },
  { to: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/admin/plans', icon: Package, label: 'Plans' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <span className="font-bold text-lg">QuickOrder Admin</span>
        </div>
        <nav className="flex-1 p-3">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#E85D3D]/10 text-[#E85D3D]'
                    : 'text-slate-600 hover:bg-slate-100'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};