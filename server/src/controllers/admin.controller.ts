import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

export const adminController = {
  // Overview
  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [totalRestaurants, activeRestaurants, trialRestaurants, activeSubscriptions, monthlyRevenue, ordersToday] = await Promise.all([
        prisma.restaurant.count(),
        prisma.restaurant.count({ where: { status: 'ACTIVE' } }),
        prisma.restaurant.count({ where: { status: 'TRIAL' } }),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.payment.aggregate({
          where: { status: 'PAID', createdAt: { gte: new Date(new Date().setDate(1)) } },
          _sum: { amount: true },
        }),
        prisma.order.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
      ]);

      res.json({
        success: true,
        data: {
          totalRestaurants,
          activeRestaurants,
          trialRestaurants,
          activeSubscriptions,
          monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
          ordersToday,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // List restaurants
  async listRestaurants(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, search, page = 1, limit = 20 } = req.query;
      const where: any = {};
      if (status) where.status = status;
      if (search) where.name = { contains: search as string };

      const [restaurants, total] = await Promise.all([
        prisma.restaurant.findMany({
          where,
          include: {
            _count: { select: { outlets: true, orders: true } },
            subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.restaurant.count({ where }),
      ]);

      res.json({
        success: true,
        data: restaurants,
        pagination: { page: Number(page), limit: Number(limit), total },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single restaurant
  async getRestaurant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: {
          outlets: true,
          subscriptions: { include: { plan: true } },
          restaurantUsers: { include: { user: true } },
        },
      });
      if (!restaurant) throw new AppError('Restaurant not found', 404);
      res.json({ success: true, data: restaurant });
    } catch (error) {
      next(error);
    }
  },

  // Suspend restaurant
  async suspendRestaurant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.restaurant.update({
        where: { id },
        data: { status: 'SUSPENDED' },
      });
      res.json({ success: true, message: 'Restaurant suspended' });
    } catch (error) {
      next(error);
    }
  },

  // Reactivate restaurant
  async reactivateRestaurant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.restaurant.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });
      res.json({ success: true, message: 'Restaurant reactivated' });
    } catch (error) {
      next(error);
    }
  },

  // List subscriptions
  async listSubscriptions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subscriptions = await prisma.subscription.findMany({
        include: { restaurant: true, plan: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: subscriptions });
    } catch (error) {
      next(error);
    }
  },

  // List plans
  async listPlans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      res.json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  },

  // Create plan
  async createPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plan = await prisma.subscriptionPlan.create({ data: req.body });
      res.status(201).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  },

  // List payments
  async listPayments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payments = await prisma.payment.findMany({
        include: { restaurant: true, plan: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  },

  // Analytics
  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [revenue, restaurants, orders] = await Promise.all([
        prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
        prisma.restaurant.count(),
        prisma.order.count(),
      ]);
      res.json({
        success: true,
        data: {
          totalRevenue: Number(revenue._sum.amount || 0),
          totalRestaurants: restaurants,
          totalOrders: orders,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Activity logs
  async getActivityLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const logs = await prisma.auditLog.findMany({
        include: { user: true, restaurant: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  },
};