import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, FolderTree, Store, Grid3x3,
  QrCode, BarChart3, Palette, Users, CreditCard, Settings, UtensilsCrossed,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/app/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/app/products', icon: Package, label: 'Products' },
  { to: '/app/categories', icon: FolderTree, label: 'Categories' },
  { to: '/app/outlets', icon: Store, label: 'Outlets' },
  { to: '/app/tables', icon: Grid3x3, label: 'Tables' },
  { to: '/app/qr-codes', icon: QrCode, label: 'QR Codes' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/app/themes', icon: Palette, label: 'Themes' },
  { to: '/app/staff', icon: Users, label: 'Staff' },
  { to: '/app/subscription', icon: CreditCard, label: 'Subscription' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#E85D3D] flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg block leading-tight">QuickOrder</span>
            <span className="text-xs text-slate-400">Restaurant SaaS</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Menu</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-[#E85D3D]/10 text-[#E85D3D]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  )}
                >
                  <item.icon className={cn('w-4.5 h-4.5', isActive ? 'text-[#E85D3D]' : 'text-slate-400 group-hover:text-slate-600')} />
                  {item.label}
                  {item.label === 'Orders' && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-[#E85D3D] animate-pulse" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
            RA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">Restaurant Admin</p>
            <p className="text-xs text-slate-400 truncate">admin@restaurant.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};