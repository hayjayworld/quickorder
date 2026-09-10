import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

export const notificationController = {
  async listNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { page = 1, limit = 20 } = req.query;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { restaurantId },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.notification.count({ where: { restaurantId } }),
      ]);

      res.json({
        success: true,
        data: notifications,
        pagination: { page: Number(page), limit: Number(limit), total },
      });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const count = await prisma.notification.count({
        where: { restaurantId, isRead: false },
      });
      res.json({ success: true, data: count });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const notification = await prisma.notification.findFirst({
        where: { id, restaurantId },
      });
      if (!notification) throw new AppError('Notification not found', 404);

      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      await prisma.notification.updateMany({
        where: { restaurantId, isRead: false },
        data: { isRead: true },
      });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};