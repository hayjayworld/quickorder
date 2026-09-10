import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analytics.service';

export const dashboardController = {
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [todayOrders, todayRevenue, pendingOrders, totalOrders, totalRevenue] = await Promise.all([
        prisma.order.count({ where: { restaurantId, createdAt: { gte: today } } }),
        prisma.order.aggregate({
          where: { restaurantId, createdAt: { gte: today }, status: { not: 'CANCELLED' } },
          _sum: { total: true },
        }),
        prisma.order.count({ where: { restaurantId, status: 'PENDING' } }),
        prisma.order.count({ where: { restaurantId } }),
        prisma.order.aggregate({
          where: { restaurantId, status: { not: 'CANCELLED' } },
          _sum: { total: true },
        }),
      ]);

      const avgOrder = totalOrders > 0 ? Number(totalRevenue._sum.total || 0) / totalOrders : 0;

      res.json({
        success: true,
        data: {
          todayOrders,
          todayRevenue: Number(todayRevenue._sum.total || 0),
          pendingOrders,
          totalOrders,
          totalRevenue: Number(totalRevenue._sum.total || 0),
          avgOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getRecentOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const orders = await prisma.order.findMany({
        where: { restaurantId },
        include: { table: true, items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  },

  async getRevenueChart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { days = 30 } = req.query;
      const revenue = await analyticsService.getRevenueData(restaurantId, Number(days));
      res.json({ success: true, data: revenue });
    } catch (error) {
      next(error);
    }
  },
};