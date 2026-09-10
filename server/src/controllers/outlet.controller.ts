import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { subscriptionService } from '../services/subscription.service';

export const outletController = {
  // List outlets
  async listOutlets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const outlets = await prisma.outlet.findMany({
        where: { restaurantId },
        include: {
          _count: { select: { tables: true, qrCodes: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
      res.json({ success: true, data: outlets });
    } catch (error) {
      next(error);
    }
  },

  // Create outlet
  async createOutlet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      
      // Check outlet limit
      const canCreate = await subscriptionService.canCreateOutlet(restaurantId);
      if (!canCreate) {
        throw new AppError('You have reached the outlet limit for your current plan. Please upgrade.', 403);
      }

      const outlet = await prisma.outlet.create({
        data: {
          restaurantId,
          ...req.body,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          restaurantId,
          userId: req.userId,
          action: 'OUTLET_CREATED',
          entityType: 'outlet',
          entityId: outlet.id,
          newValue: outlet,
        },
      });

      res.status(201).json({ success: true, data: outlet });
    } catch (error) {
      next(error);
    }
  },

  // Get single outlet
  async getOutlet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;
      
      const outlet = await prisma.outlet.findFirst({
        where: { id, restaurantId },
        include: { tables: true, qrCodes: true },
      });

      if (!outlet) throw new AppError('Outlet not found', 404);
      res.json({ success: true, data: outlet });
    } catch (error) {
      next(error);
    }
  },

  // Update outlet
  async updateOutlet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const outlet = await prisma.outlet.findFirst({ where: { id, restaurantId } });
      if (!outlet) throw new AppError('Outlet not found', 404);

      const updated = await prisma.outlet.update({
        where: { id },
        data: req.body,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  // Delete outlet
  async deleteOutlet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const outlet = await prisma.outlet.findFirst({ where: { id, restaurantId } });
      if (!outlet) throw new AppError('Outlet not found', 404);

      // Check if outlet has tables or orders
      const tableCount = await prisma.table.count({ where: { outletId: id } });
      if (tableCount > 0) {
        throw new AppError('Cannot delete outlet with existing tables. Delete tables first.', 400);
      }

      const orderCount = await prisma.order.count({ where: { outletId: id } });
      if (orderCount > 0) {
        throw new AppError('Cannot delete outlet with existing orders.', 400);
      }

      await prisma.outlet.delete({ where: { id } });
      res.json({ success: true, message: 'Outlet deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Get tables for outlet
  async getTables(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const tables = await prisma.table.findMany({
        where: { outletId: id, outlet: { restaurantId } },
        include: { qrCodes: true },
      });

      res.json({ success: true, data: tables });
    } catch (error) {
      next(error);
    }
  },
};