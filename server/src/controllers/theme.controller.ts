import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

export const themeController = {
  async getTheme(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: {
          themePreset: true,
          accentColor: true,
          logoUrl: true,
          coverUrl: true,
        },
      });
      res.json({ success: true, data: restaurant });
    } catch (error) {
      next(error);
    }
  },

  async updateTheme(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { themePreset, accentColor, logoUrl, coverUrl } = req.body;

      const updated = await prisma.restaurant.update({
        where: { id: restaurantId },
        data: { themePreset, accentColor, logoUrl, coverUrl },
        select: { themePreset: true, accentColor: true, logoUrl: true, coverUrl: true },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  async previewTheme(req: AuthRequest, res: Response, next: NextFunction) {
    // Return a sample menu structure for preview
    try {
      const restaurantId = req.restaurantId!;
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { name: true, logoUrl: true, coverUrl: true, accentColor: true, themePreset: true },
      });
      const categories = await prisma.category.findMany({
        where: { restaurantId, isActive: true },
        include: { products: { where: { status: 'ACTIVE' }, take: 3 } },
      });
      res.json({ success: true, data: { restaurant, categories } });
    } catch (error) {
      next(error);
    }
  },
};