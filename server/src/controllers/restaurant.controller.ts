import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

export const restaurantController = {
  // Get current restaurant
  async getRestaurant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId;
      if (!restaurantId) throw new AppError('Restaurant not found', 404);

      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
          _count: {
            select: {
              outlets: true,
              products: true,
              categories: true,
              orders: true,
              qrCodes: true,
            },
          },
        },
      });

      if (!restaurant) throw new AppError('Restaurant not found', 404);

      res.json({ success: true, data: restaurant });
    } catch (error) {
      next(error);
    }
  },

  // Update restaurant
  async updateRestaurant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId;
      if (!restaurantId) throw new AppError('Restaurant not found', 404);

      const updated = await prisma.restaurant.update({
        where: { id: restaurantId },
        data: req.body,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  // Get all outlets for current restaurant
  async getOutlets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId;
      const outlets = await prisma.outlet.findMany({
        where: { restaurantId },
        include: {
          _count: { select: { tables: true, qrCodes: true, orders: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ success: true, data: outlets });
    } catch (error) {
      next(error);
    }
  },

  // Get basic stats
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId;
      const [totalOrders, totalRevenue, totalProducts, totalOutlets] = await Promise.all([
        prisma.order.count({ where: { restaurantId } }),
        prisma.order.aggregate({
          where: { restaurantId, status: { not: 'CANCELLED' } },
          _sum: { total: true },
        }),
        prisma.product.count({ where: { restaurantId } }),
        prisma.outlet.count({ where: { restaurantId } }),
      ]);

      res.json({
        success: true,
        data: {
          totalOrders,
          totalRevenue: Number(totalRevenue._sum.total || 0),
          totalProducts,
          totalOutlets,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};