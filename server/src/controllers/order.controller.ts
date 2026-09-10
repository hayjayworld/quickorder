import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/tenantResolver';
import { AppError } from '../utils/AppError';
import { generateOrderNumber } from '../utils/orderNumber';
import { emitOrderEvent } from '../sockets/socketServer';
import { OrderStatus } from '@prisma/client';

export const orderController = {
  async createManualOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId;
      const { outletId, items, customerName, customerPhone, customerNotes, orderType } = req.body;
      if (!restaurantId) throw new AppError('Restaurant context is required', 403);

      const outlet = await prisma.outlet.findFirst({ where: { id: outletId, restaurantId } });
      if (!outlet) throw new AppError('Outlet not found', 404);

      const orderItems = [];
      let subtotal = 0;
      for (const item of items) {
        const product = await prisma.product.findFirst({
          where: { id: item.productId, restaurantId, status: 'ACTIVE' },
        });
        if (!product) throw new AppError(`Product not found: ${item.productId}`, 400);
        const total = Number(product.price) * item.quantity;
        subtotal += total;
        orderItems.push({
          product: { connect: { id: product.id } },
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          total,
        });
      }

      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          restaurantId,
          outletId,
          customerName,
          customerPhone,
          customerNotes,
          status: 'PENDING',
          orderType: orderType || 'DINE_IN',
          subtotal,
          serviceFee: 0,
          total: subtotal,
          currency: 'NGN',
          items: { create: orderItems },
          timeline: { create: { status: 'PENDING', notes: 'Manual order received', createdBy: req.userId } },
        },
        include: { items: true },
      });
      emitOrderEvent(restaurantId, 'order.created', order);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  },

  // Create order (public)
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { qrToken, items, customerName, customerPhone, customerNotes, orderType } = req.body;
      
      // Resolve QR code
      const qrCode = await prisma.qRCode.findUnique({
        where: { token: qrToken },
        include: { restaurant: true, outlet: true, table: true },
      });

      if (!qrCode || qrCode.status !== 'ACTIVE') {
        throw new AppError('Invalid or inactive QR code', 400);
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { options: { include: { values: true } } },
        });

        if (!product || product.status !== 'ACTIVE') {
          throw new AppError(`Product not found: ${item.productId}`, 400);
        }

        const itemTotal = Number(product.price) * item.quantity;
        subtotal += itemTotal;

        // Process options
        const optionsSnapshot = [];
        let optionsTotal = 0;
        if (item.options) {
          for (const opt of item.options) {
            const option = product.options.find(o => o.id === opt.optionId);
            if (option) {
              const value = option.values.find(v => v.id === opt.valueId);
              if (value) {
                optionsSnapshot.push({
                  optionName: option.name,
                  valueLabel: value.label,
                  priceDelta: Number(value.priceDelta),
                });
                optionsTotal += Number(value.priceDelta) * item.quantity;
              }
            }
          }
        }

        orderItems.push({
          product: { connect: { id: product.id } },
          productName: product.name,
          unitPrice: Number(product.price),
          quantity: item.quantity,
          total: (Number(product.price) + optionsTotal / item.quantity) * item.quantity,
          optionSnapshot: optionsSnapshot,
          options: { create: optionsSnapshot },
        });
      }

      const orderNumber = generateOrderNumber();
      const publicToken = `ord_${Date.now()}${Math.random().toString(36).slice(2, 10)}`;

      const order = await prisma.order.create({
        data: {
          orderNumber,
          publicToken,
          restaurantId: qrCode.restaurantId,
          outletId: qrCode.outletId,
          tableId: qrCode.tableId,
          qrCodeId: qrCode.id,
          sessionId: req.body.sessionId,
          status: 'PENDING',
          orderType: orderType || 'DINE_IN',
          customerName,
          customerPhone,
          customerNotes,
          subtotal,
          serviceFee: 0,
          total: subtotal,
          currency: qrCode.restaurant.currency,
          items: {
            create: orderItems,
          },
          timeline: {
            create: {
              status: 'PENDING',
              notes: 'Order received',
            },
          },
        },
        include: { items: true, timeline: true },
      });

      // Increment QR scans
      await prisma.qRCode.update({
        where: { id: qrCode.id },
        data: { totalScans: { increment: 1 } },
      });

      // Track analytics
      await prisma.analyticsEvent.create({
        data: {
          restaurantId: qrCode.restaurantId,
          outletId: qrCode.outletId,
          qrCodeId: qrCode.id,
          tableId: qrCode.tableId,
          sessionId: req.body.sessionId,
          eventType: 'order_created',
          metadata: { orderId: order.id, total: subtotal },
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          restaurantId: qrCode.restaurantId,
          orderId: order.id,
          type: 'NEW_ORDER',
          title: `New Order ${order.orderNumber}`,
          body: `${order.items.length} items | Total: ${order.total}`,
        },
      });

      // Emit realtime event
      emitOrderEvent(qrCode.restaurantId, 'order.created', order);

      res.status(201).json({
        success: true,
        data: {
          orderNumber: order.orderNumber,
          publicToken: order.publicToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Update order status
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: OrderStatus };
      const restaurantId = req.restaurantId;

      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order || order.restaurantId !== restaurantId) {
        throw new AppError('Order not found', 404);
      }

      const validTransitions: Record<string, string[]> = {
        PENDING: ['ACCEPTED', 'CANCELLED'],
        ACCEPTED: ['PREPARING', 'CANCELLED'],
        PREPARING: ['READY', 'CANCELLED'],
        READY: ['COMPLETED', 'CANCELLED'],
      };

      if (!validTransitions[order.status]?.includes(status)) {
        throw new AppError(`Invalid status transition: ${order.status} → ${status}`, 400);
      }

      const timestampFields = {
        ACCEPTED: 'acceptedAt',
        PREPARING: 'preparingAt',
        READY: 'readyAt',
        COMPLETED: 'completedAt',
        CANCELLED: 'cancelledAt',
      } as const;
      const timestampField = timestampFields[status as keyof typeof timestampFields];

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status,
          ...(timestampField ? { [timestampField]: new Date() } : {}),
          timeline: {
            create: {
              status,
              notes: `Order ${status.toLowerCase()}`,
              createdBy: req.userId,
            },
          },
        },
        include: { items: true, timeline: true },
      });

      emitOrderEvent(restaurantId, `order.${status.toLowerCase()}`, updatedOrder);

      res.json({ success: true, data: updatedOrder });
    } catch (error) {
      next(error);
    }
  },

  // Cancel order
  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    // Similar to updateStatus with CANCELLED
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId;

      const order = await prisma.order.findUnique({ where: { id } });
      if (!order || order.restaurantId !== restaurantId) {
        throw new AppError('Order not found', 404);
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          timeline: {
            create: {
              status: 'CANCELLED',
              notes: req.body.reason || 'Order cancelled',
              createdBy: req.userId,
            },
          },
        },
        include: { items: true },
      });

      emitOrderEvent(restaurantId, 'order.cancelled', updatedOrder);
      res.json({ success: true, data: updatedOrder });
    } catch (error) {
      next(error);
    }
  },

  // List orders (tenant-scoped)
  async listOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId;
      const { status, outletId, search, page = 1, limit = 20 } = req.query;

      const where: any = { restaurantId };
      if (status) where.status = status;
      if (outletId) where.outletId = outletId;
      if (search) {
        where.OR = [
          { orderNumber: { contains: search as string } },
          { customerName: { contains: search as string } },
        ];
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: { items: true, table: true, outlet: true },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.order.count({ where }),
      ]);

      res.json({
        success: true,
        data: orders,
        pagination: { page: Number(page), limit: Number(limit), total },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get order by ID (tenant-scoped)
  async getOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId;

      const order = await prisma.order.findFirst({
        where: { id, restaurantId },
        include: {
          items: { include: { options: true } },
          table: true,
          outlet: true,
          timeline: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!order) throw new AppError('Order not found', 404);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  },
};