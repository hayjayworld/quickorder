import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { createAuditLog } from '../utils/auditLog';

export const tableController = {
  async listTables(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { outletId, status } = req.query;

      const where: any = {
        outlet: { restaurantId },
      };
      if (outletId) where.outletId = outletId;
      if (status) where.status = status;

      const tables = await prisma.table.findMany({
        where,
        include: {
          outlet: true,
          qrCodes: { where: { status: 'ACTIVE' } },
        },
        orderBy: { label: 'asc' },
      });

      res.json({ success: true, data: tables });
    } catch (error) {
      next(error);
    }
  },

  async createTable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { outletId, ...tableData } = req.body;

      // Verify outlet belongs to restaurant
      const outlet = await prisma.outlet.findFirst({
        where: { id: outletId, restaurantId },
      });
      if (!outlet) throw new AppError('Outlet not found', 404);

      const table = await prisma.table.create({
        data: { outletId, ...tableData },
        include: { outlet: true },
      });

      await createAuditLog({
        restaurantId,
        userId: req.userId,
        action: 'TABLE_CREATED',
        entityType: 'table',
        entityId: table.id,
        newValue: table,
      });

      res.status(201).json({ success: true, data: table });
    } catch (error) {
      next(error);
    }
  },

  async getTable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const table = await prisma.table.findFirst({
        where: { id, outlet: { restaurantId } },
        include: { outlet: true, qrCodes: true },
      });

      if (!table) throw new AppError('Table not found', 404);
      res.json({ success: true, data: table });
    } catch (error) {
      next(error);
    }
  },

  async updateTable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const table = await prisma.table.findFirst({
        where: { id, outlet: { restaurantId } },
      });
      if (!table) throw new AppError('Table not found', 404);

      const updated = await prisma.table.update({
        where: { id },
        data: req.body,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  async deleteTable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const table = await prisma.table.findFirst({
        where: { id, outlet: { restaurantId } },
      });
      if (!table) throw new AppError('Table not found', 404);

      // Check if table has active orders
      const activeOrders = await prisma.order.count({
        where: { tableId: id, status: { in: ['PENDING', 'ACCEPTED', 'PREPARING'] } },
      });
      if (activeOrders > 0) {
        throw new AppError('Cannot delete table with active orders', 400);
      }

      await prisma.table.delete({ where: { id } });
      res.json({ success: true, message: 'Table deleted' });
    } catch (error) {
      next(error);
    }
  },
};