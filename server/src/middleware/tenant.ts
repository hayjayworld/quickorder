import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

/**
 * Middleware to ensure the request is scoped to the authenticated user's restaurant.
 * This prevents cross-tenant data access by ensuring restaurantId matches.
 */
export const tenantIsolation = (req: AuthRequest, res: Response, next: NextFunction) => {
  const restaurantId = req.restaurantId;
  
  if (!restaurantId) {
    if (req.role === 'SUPER_ADMIN') {
      return next();
    }
    throw new AppError('Restaurant context required', 403);
  }

  // If the request body or params contain a restaurantId, verify it matches
  const requestedRestaurantId = req.body?.restaurantId || req.params?.restaurantId;
  
  if (requestedRestaurantId && requestedRestaurantId !== restaurantId && req.role !== 'SUPER_ADMIN') {
    throw new AppError('Access denied: Restaurant mismatch', 403);
  }

  next();
};

/**
 * Verify that an outlet belongs to the authenticated restaurant.
 */
export const verifyOutletAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const outletId = req.params.outletId || req.body.outletId;
    if (!outletId) return next();

    const restaurantId = req.restaurantId;
    if (!restaurantId) return next();

    const outlet = await prisma.outlet.findFirst({
      where: { id: outletId, restaurantId },
    });

    if (!outlet) {
      throw new AppError('Outlet not found or access denied', 404);
    }

    // If user is assigned to a specific outlet, verify it matches
    if (req.outletId && req.outletId !== outletId && req.role !== 'RESTAURANT_ADMIN') {
      throw new AppError('Access denied: Outlet mismatch', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verify that an order belongs to the authenticated restaurant.
 */
export const verifyOrderAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id || req.params.orderId;
    if (!orderId) return next();

    const restaurantId = req.restaurantId;
    if (!restaurantId) return next();

    const order = await prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });

    if (!order) {
      throw new AppError('Order not found or access denied', 404);
    }

    // If user is assigned to a specific outlet, verify the order belongs to that outlet
    if (req.outletId && order.outletId !== req.outletId && req.role !== 'RESTAURANT_ADMIN') {
      throw new AppError('Access denied: Outlet mismatch', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};