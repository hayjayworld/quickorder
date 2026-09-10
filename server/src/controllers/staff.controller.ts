import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { subscriptionService } from '../services/subscription.service';

export const staffController = {
  // List staff
  async listStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const staff = await prisma.restaurantUser.findMany({
        where: { restaurantId },
        include: {
          user: { select: { id: true, email: true, fullName: true, phone: true, role: true, isActive: true, lastLoginAt: true } },
          outlet: true,
        },
      });
      res.json({ success: true, data: staff });
    } catch (error) {
      next(error);
    }
  },

  // Invite staff
  async inviteStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { email, fullName, role, outletId } = req.body;

      // Check staff limit
      const canAdd = await subscriptionService.canAddStaff(restaurantId);
      if (!canAdd) {
        throw new AppError('You have reached the staff limit for your plan.', 403);
      }

      // Check if user already exists
      let user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        // Check if already associated with this restaurant
        const existingAssoc = await prisma.restaurantUser.findFirst({
          where: { userId: user.id, restaurantId },
        });
        if (existingAssoc) {
          throw new AppError('User is already a staff member of this restaurant', 409);
        }
      } else {
        // Create new user with default password (should be changed on first login)
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashed = await bcrypt.hash(tempPassword, 10);
        user = await prisma.user.create({
          data: {
            email,
            fullName,
            role: role || 'FRONT_DESK',
            passwordHash: hashed,
          },
        });
      }

      const association = await prisma.restaurantUser.create({
        data: {
          restaurantId,
          userId: user.id,
          assignedOutletId: outletId,
        },
        include: { user: true, outlet: true },
      });

      res.status(201).json({
        success: true,
        data: association,
        message: 'Staff invited successfully. They can login with their email and temporary password.',
      });
    } catch (error) {
      next(error);
    }
  },

  // Update staff
  async updateStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;
      const { role, outletId, isActive } = req.body;

      const assoc = await prisma.restaurantUser.findFirst({
        where: { id, restaurantId },
      });
      if (!assoc) throw new AppError('Staff not found', 404);

      // Update user role
      if (role) {
        await prisma.user.update({
          where: { id: assoc.userId },
          data: { role },
        });
      }

      // Update association
      const updated = await prisma.restaurantUser.update({
        where: { id },
        data: { assignedOutletId: outletId },
        include: { user: true, outlet: true },
      });

      if (isActive !== undefined) {
        await prisma.user.update({
          where: { id: assoc.userId },
          data: { isActive },
        });
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  // Remove staff
  async removeStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const assoc = await prisma.restaurantUser.findFirst({
        where: { id, restaurantId },
      });
      if (!assoc) throw new AppError('Staff not found', 404);

      // Deactivate user instead of deleting to preserve audit history
      await prisma.user.update({
        where: { id: assoc.userId },
        data: { isActive: false },
      });

      await prisma.restaurantUser.delete({ where: { id } });
      res.json({ success: true, message: 'Staff removed' });
    } catch (error) {
      next(error);
    }
  },

  // Reset password
  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;
      const { newPassword } = req.body;

      const assoc = await prisma.restaurantUser.findFirst({
        where: { id, restaurantId },
      });
      if (!assoc) throw new AppError('Staff not found', 404);

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: assoc.userId },
        data: { passwordHash: hashed },
      });

      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  },
};