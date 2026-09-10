import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import path from 'path';

export const productController = {
  // List products with filters
  async listProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { categoryId, status, search, page = 1, limit = 20 } = req.query;

      const where: any = { restaurantId };
      if (categoryId) where.categoryId = categoryId;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search as string } },
          { description: { contains: search as string } },
        ];
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true, options: { include: { values: true } } },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.product.count({ where }),
      ]);

      res.json({
        success: true,
        data: products,
        pagination: { page: Number(page), limit: Number(limit), total },
      });
    } catch (error) {
      next(error);
    }
  },

  // Create product
  async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const { options, ...productData } = req.body;

      const product = await prisma.product.create({
        data: {
          restaurantId,
          ...productData,
          options: options ? {
            create: options.map((opt: any) => ({
              name: opt.name,
              isRequired: opt.isRequired,
              minSelections: opt.minSelections,
              maxSelections: opt.maxSelections,
              values: {
                create: opt.values.map((val: any) => ({
                  label: val.label,
                  priceDelta: val.priceDelta,
                })),
              },
            })),
          } : undefined,
        },
        include: { options: { include: { values: true } }, category: true },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          restaurantId,
          userId: req.userId,
          action: 'PRODUCT_CREATED',
          entityType: 'product',
          entityId: product.id,
          newValue: product,
        },
      });

      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  // Get single product
  async getProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const product = await prisma.product.findFirst({
        where: { id, restaurantId },
        include: { category: true, options: { include: { values: true } } },
      });

      if (!product) throw new AppError('Product not found', 404);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  // Update product
  async updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const product = await prisma.product.findFirst({ where: { id, restaurantId } });
      if (!product) throw new AppError('Product not found', 404);

      const updated = await prisma.product.update({
        where: { id },
        data: req.body,
        include: { options: { include: { values: true } } },
      });

      // Audit log for price changes
      if (req.body.price && req.body.price !== product.price) {
        await prisma.auditLog.create({
          data: {
            restaurantId,
            userId: req.userId,
            action: 'PRODUCT_PRICE_CHANGED',
            entityType: 'product',
            entityId: id,
            oldValue: { price: product.price },
            newValue: { price: req.body.price },
          },
        });
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  // Delete product
  async deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const product = await prisma.product.findFirst({ where: { id, restaurantId } });
      if (!product) throw new AppError('Product not found', 404);

      await prisma.product.delete({ where: { id } });

      res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Upload product image
  async uploadImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('No file uploaded', 400);

      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      res.json({ success: true, data: { url: fileUrl } });
    } catch (error) {
      next(error);
    }
  },

  // List categories
  async listCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const categories = await prisma.category.findMany({
        where: { restaurantId },
        include: { _count: { select: { products: true } } },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      });
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  },

  // Create category
  async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId!;
      const category = await prisma.category.create({
        data: { restaurantId, ...req.body },
      });
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  },

  // Update category
  async updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const category = await prisma.category.findFirst({ where: { id, restaurantId } });
      if (!category) throw new AppError('Category not found', 404);

      const updated = await prisma.category.update({
        where: { id },
        data: req.body,
      });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  // Delete category
  async deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId!;

      const category = await prisma.category.findFirst({ where: { id, restaurantId } });
      if (!category) throw new AppError('Category not found', 404);

      const productCount = await prisma.product.count({ where: { categoryId: id } });
      if (productCount > 0) {
        throw new AppError('Cannot delete category with products. Move or delete products first.', 400);
      }

      await prisma.category.delete({ where: { id } });
      res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
      next(error);
    }
  },
};