import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken';
import { config } from '../config/env';

export const authController = {
  // Register a new restaurant and admin user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email: submittedEmail, password, fullName, phone, restaurantName, restaurantSlug } = req.body;
      const email = submittedEmail.trim().toLowerCase();

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new AppError('Email already registered', 409);
      }

      // Check if restaurant slug is unique
      const existingRestaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
      if (existingRestaurant) {
        throw new AppError('Restaurant slug already taken', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create restaurant and admin user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create restaurant
        const restaurant = await tx.restaurant.create({
          data: {
            name: restaurantName,
            slug: restaurantSlug,
            currency: 'NGN',
            status: 'TRIAL',
          },
        });

        // Create user
        const user = await tx.user.create({
          data: {
            email,
            passwordHash: hashedPassword,
            fullName,
            phone,
            role: 'RESTAURANT_ADMIN',
          },
        });

        // Create association
        await tx.restaurantUser.create({
          data: {
            restaurantId: restaurant.id,
            userId: user.id,
          },
        });

        // Create trial subscription
        const trialPlan = await tx.subscriptionPlan.findUnique({
          where: { slug: 'starter' },
        });

        if (trialPlan) {
          await tx.subscription.create({
            data: {
              restaurantId: restaurant.id,
              planId: trialPlan.id,
              status: 'TRIAL',
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            },
          });
        }

        return { restaurant, user };
      });

      // Generate tokens
      const accessToken = generateAccessToken(result.user.id, result.user.role, result.restaurant.id);
      const refreshToken = generateRefreshToken(result.user.id);

      // Set cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: config.cookieSameSite,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: config.cookieSameSite,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            fullName: result.user.fullName,
            role: result.user.role,
          },
          restaurant: {
            id: result.restaurant.id,
            name: result.restaurant.name,
            slug: result.restaurant.slug,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email: submittedEmail, password } = req.body;
      const email = submittedEmail.trim().toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          restaurantUsers: {
            include: { restaurant: true },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new AppError('Invalid credentials', 401);
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check if restaurant is suspended
      if (user.role !== 'SUPER_ADMIN' && user.restaurantUsers[0]?.restaurant.status === 'SUSPENDED') {
        throw new AppError('Your restaurant account is suspended. Contact support.', 403);
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const restaurantId = user.role !== 'SUPER_ADMIN' ? user.restaurantUsers[0]?.restaurantId : undefined;

      const accessToken = generateAccessToken(user.id, user.role, restaurantId);
      const refreshToken = generateRefreshToken(user.id);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: config.cookieSameSite,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: config.cookieSameSite,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            restaurantId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout
  async logout(req: Request, res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  },

  // Get current user
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: {
          restaurantUsers: {
            include: { restaurant: true, outlet: true },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          restaurant: user.restaurantUsers[0]?.restaurant,
          outlet: user.restaurantUsers[0]?.outlet,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Refresh token
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new AppError('No refresh token', 401);
      }

      const decoded = verifyRefreshToken(refreshToken) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { restaurantUsers: true },
      });

      if (!user || !user.isActive) {
        throw new AppError('Invalid token', 401);
      }

      const restaurantId = user.role !== 'SUPER_ADMIN' ? user.restaurantUsers[0]?.restaurantId : undefined;
      const newAccessToken = generateAccessToken(user.id, user.role, restaurantId);

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: config.cookieSameSite,
        maxAge: 15 * 60 * 1000,
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};