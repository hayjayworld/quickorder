import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
  restaurantId?: string;
  outletId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        restaurantUsers: {
          include: { restaurant: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    req.userId = user.id;
    req.role = user.role;

    if (user.role !== 'SUPER_ADMIN') {
      const restaurantUser = user.restaurantUsers[0];
      if (!restaurantUser) {
        throw new AppError('No restaurant association found', 403);
      }
      
      if (restaurantUser.restaurant.status === 'SUSPENDED') {
        throw new AppError('Restaurant is suspended', 403);
      }

      req.restaurantId = restaurantUser.restaurantId;
      req.outletId = restaurantUser.assignedOutletId || undefined;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Session expired. Please login again.', 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    next(error);
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { restaurantUsers: true },
      });
      if (user) {
        req.userId = user.id;
        req.role = user.role;
        if (user.role !== 'SUPER_ADMIN' && user.restaurantUsers[0]) {
          req.restaurantId = user.restaurantUsers[0].restaurantId;
          req.outletId = user.restaurantUsers[0].assignedOutletId || undefined;
        }
      }
    }
    next();
  } catch {
    next();
  }
};