import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analytics.service';
import { AppError } from '../utils/AppError';

export const analyticsController = {
  // Overview stats
  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { period = 'today' } = req.query;
      
      const fromDate = getDateFromPeriod(period as string);
      const overview = await analyticsService.getOverview(restaurantId, fromDate);
      
      res.json({ success: true, data: overview });
    } catch (error) {
      next(error);
    }
  },

  // Revenue data
  async getRevenueData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { days = 30 } = req.query;
      
      const revenue = await analyticsService.getRevenueData(restaurantId, Number(days));
      res.json({ success: true, data: revenue });
    } catch (error) {
      next(error);
    }
  },

  // Order data
  async getOrderData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { days = 30 } = req.query;
      
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - Number(days));
      
      const orders = await prisma.order.groupBy({
        by: ['status'],
        where: { restaurantId, createdAt: { gte: fromDate } },
        _count: true,
      });
      
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  },

  // Top products
  async getProductAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const topProducts = await analyticsService.getTopProducts(restaurantId);
      res.json({ success: true, data: topProducts });
    } catch (error) {
      next(error);
    }
  },

  // Category analytics
  async getCategoryAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const categories = await prisma.orderItem.findMany({
        where: { order: { restaurantId, status: { not: 'CANCELLED' } } },
        select: { product: { select: { category: { select: { name: true } } } }, quantity: true, total: true },
      });
      
      const grouped: Record<string, { name: string; revenue: number; orders: number }> = {};
      categories.forEach(item => {
        const name = item.product?.category?.name || 'Uncategorized';
        if (!grouped[name]) grouped[name] = { name, revenue: 0, orders: 0 };
        grouped[name].revenue += Number(item.total);
        grouped[name].orders += item.quantity;
      });
      
      res.json({ success: true, data: Object.values(grouped) });
    } catch (error) {
      next(error);
    }
  },

  // QR analytics
  async getQrAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { days = 30 } = req.query;
      
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - Number(days));
      
      const qrAnalytics = await analyticsService.getQrAnalytics(restaurantId, fromDate);
      res.json({ success: true, data: qrAnalytics });
    } catch (error) {
      next(error);
    }
  },

  // Outlet analytics
  async getOutletAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { days = 30 } = req.query;
      
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - Number(days));
      
      const outlets = await prisma.outlet.findMany({
        where: { restaurantId },
        select: {
          id: true,
          name: true,
          _count: { select: { orders: { where: { createdAt: { gte: fromDate } } } } },
          orders: {
            where: { createdAt: { gte: fromDate }, status: { not: 'CANCELLED' } },
            select: { total: true },
          },
        },
      });
      
      const formatted = outlets.map(o => ({
        id: o.id,
        name: o.name,
        orderCount: o._count.orders,
        revenue: o.orders.reduce((sum, ord) => sum + Number(ord.total), 0),
      }));
      
      res.json({ success: true, data: formatted });
    } catch (error) {
      next(error);
    }
  },
};

function getDateFromPeriod(period: string): Date | undefined {
  const now = new Date();
  switch (period) {
    case 'today':
      return new Date(now.setHours(0, 0, 0, 0));
    case '7days':
      return new Date(now.setDate(now.getDate() - 7));
    case '30days':
      return new Date(now.setDate(now.getDate() - 30));
    case '90days':
      return new Date(now.setDate(now.getDate() - 90));
    default:
      return undefined;
  }
}