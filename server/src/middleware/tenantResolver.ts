import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  userId?: string;
  restaurantId?: string;
  role?: string;
  outletId?: string;
}

export const tenantResolver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new AppError('Unauthorized', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { restaurantUsers: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('Unauthorized', 401);
    }

    req.userId = user.id;
    req.role = user.role;

    if (user.role === 'SUPER_ADMIN') {
      // Super admin has no tenant restriction
      return next();
    }

    const restaurantUser = user.restaurantUsers[0];
    if (!restaurantUser) {
      throw new AppError('No restaurant association found', 403);
    }

    req.restaurantId = restaurantUser.restaurantId;
    req.outletId = restaurantUser.assignedOutletId || undefined;

    next();
  } catch (error) {
    next(error);
  }
};