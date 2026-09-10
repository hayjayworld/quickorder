import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

export const subscriptionController = {
  // Get current subscription
  async getCurrentSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const subscription = await prisma.subscription.findFirst({
        where: { restaurantId, status: { in: ['ACTIVE', 'TRIAL'] } },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  },

  // Get available plans
  async getPlans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      res.json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  },

  // Change plan
  async changePlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { planId } = req.body;

      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!plan) throw new AppError('Plan not found', 404);

      const currentSub = await prisma.subscription.findFirst({
        where: { restaurantId, status: 'ACTIVE' },
      });

      if (currentSub) {
        await prisma.subscription.update({
          where: { id: currentSub.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        });
      }

      const newSub = await prisma.subscription.create({
        data: {
          restaurantId,
          planId,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        include: { plan: true },
      });

      res.json({ success: true, data: newSub });
    } catch (error) {
      next(error);
    }
  },

  // Cancel subscription
  async cancelSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const subscription = await prisma.subscription.findFirst({
        where: { restaurantId, status: 'ACTIVE' },
      });
      if (!subscription) throw new AppError('No active subscription found', 404);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });

      res.json({ success: true, message: 'Subscription cancelled' });
    } catch (error) {
      next(error);
    }
  },

  // Get invoices (simplified - no real payment integration)
  async getInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const payments = await prisma.payment.findMany({
        where: { restaurantId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  },
};