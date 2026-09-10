import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from '../utils/AppError';

export type Permission =
  | 'dashboard.view'
  | 'orders.view'
  | 'orders.create'
  | 'orders.update'
  | 'orders.cancel'
  | 'products.view'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'categories.view'
  | 'categories.create'
  | 'categories.update'
  | 'categories.delete'
  | 'outlets.view'
  | 'outlets.create'
  | 'outlets.update'
  | 'outlets.delete'
  | 'tables.view'
  | 'tables.create'
  | 'tables.update'
  | 'tables.delete'
  | 'qr.view'
  | 'qr.create'
  | 'qr.update'
  | 'qr.delete'
  | 'analytics.view'
  | 'themes.view'
  | 'themes.update'
  | 'staff.view'
  | 'staff.create'
  | 'staff.update'
  | 'staff.delete'
  | 'subscription.view'
  | 'subscription.update'
  | 'settings.view'
  | 'settings.update';

const rolePermissions: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    'dashboard.view', 'orders.view', 'orders.create', 'orders.update', 'orders.cancel',
    'products.view', 'products.create', 'products.update', 'products.delete',
    'categories.view', 'categories.create', 'categories.update', 'categories.delete',
    'outlets.view', 'outlets.create', 'outlets.update', 'outlets.delete',
    'tables.view', 'tables.create', 'tables.update', 'tables.delete',
    'qr.view', 'qr.create', 'qr.update', 'qr.delete',
    'analytics.view', 'themes.view', 'themes.update',
    'staff.view', 'staff.create', 'staff.update', 'staff.delete',
    'subscription.view', 'subscription.update',
    'settings.view', 'settings.update',
  ],
  RESTAURANT_ADMIN: [
    'dashboard.view', 'orders.view', 'orders.create', 'orders.update', 'orders.cancel',
    'products.view', 'products.create', 'products.update', 'products.delete',
    'categories.view', 'categories.create', 'categories.update', 'categories.delete',
    'outlets.view', 'outlets.create', 'outlets.update', 'outlets.delete',
    'tables.view', 'tables.create', 'tables.update', 'tables.delete',
    'qr.view', 'qr.create', 'qr.update', 'qr.delete',
    'analytics.view', 'themes.view', 'themes.update',
    'staff.view', 'staff.create', 'staff.update', 'staff.delete',
    'subscription.view', 'subscription.update',
    'settings.view', 'settings.update',
  ],
  RESTAURANT_MANAGER: [
    'dashboard.view', 'orders.view', 'orders.create', 'orders.update', 'orders.cancel',
    'products.view', 'products.create', 'products.update',
    'categories.view', 'categories.create', 'categories.update',
    'tables.view', 'tables.create', 'tables.update',
    'qr.view', 'qr.create',
    'analytics.view',
    'staff.view', 'staff.create', 'staff.update',
  ],
  FRONT_DESK: [
    'dashboard.view', 'orders.view', 'orders.create', 'orders.update',
    'tables.view',
    'qr.view',
    'analytics.view',
  ],
};

export const requirePermission = (permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.role;
    if (!userRole) {
      throw new AppError('Authentication required', 401);
    }

    const permissions = rolePermissions[userRole] || [];
    if (!permissions.includes(permission)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }

    next();
  };
};

export const requireAnyPermission = (...requiredPermissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.role;
    if (!userRole) {
      throw new AppError('Authentication required', 401);
    }

    const userPermissions = rolePermissions[userRole] || [];
    const hasPermission = requiredPermissions.some(p => userPermissions.includes(p));
    
    if (!hasPermission) {
      throw new AppError('You do not have permission to perform this action', 403);
    }

    next();
  };
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role !== 'SUPER_ADMIN') {
    throw new AppError('Admin access required', 403);
  }
  next();
};