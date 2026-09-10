import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { emitOrderEvent, emitOrderTrackingUpdate } from '../sockets/socketServer';
import { generateOrderNumber } from '../utils/orderNumber';
import crypto from 'crypto';

export const publicController = {
  // Get menu for a QR token
  async getMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { qrToken } = req.params;

      const qrCode = await prisma.qRCode.findUnique({
        where: { token: qrToken },
        include: {
          restaurant: true,
          outlet: true,
          table: true,
        },
      });

      if (!qrCode || qrCode.status !== 'ACTIVE') {
        throw new AppError('Invalid or inactive QR code', 404);
      }

      if (qrCode.restaurant.status !== 'ACTIVE') {
        throw new AppError('Restaurant is currently unavailable', 403);
      }

      // Track QR scan
      await prisma.qRScan.create({
        data: {
          qrCodeId: qrCode.id,
          sessionId: req.body?.sessionId || null,
          userAgent: req.headers['user-agent'],
        },
      });

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
          sessionId: req.body?.sessionId,
          eventType: 'qr_scanned',
        },
      });

      // Get categories with products
      const categories = await prisma.category.findMany({
        where: { restaurantId: qrCode.restaurantId, isActive: true },
        include: {
          products: {
            where: { status: 'ACTIVE' },
            include: { options: { include: { values: true } } },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      res.json({
        success: true,
        data: {
          restaurant: {
            id: qrCode.restaurantId,
            name: qrCode.restaurant.name,
            logoUrl: qrCode.restaurant.logoUrl,
            coverUrl: qrCode.restaurant.coverUrl,
            accentColor: qrCode.restaurant.accentColor,
            themePreset: qrCode.restaurant.themePreset,
            currency: qrCode.restaurant.currency,
          },
          outlet: { id: qrCode.outletId, name: qrCode.outlet.name },
          table: qrCode.table ? { id: qrCode.tableId, label: qrCode.table.label } : null,
          categories,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Create order (public)
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { qrToken, items, customerName, customerPhone, customerNotes, orderType, sessionId } = req.body;

      const qrCode = await prisma.qRCode.findUnique({
        where: { token: qrToken },
        include: { restaurant: true, outlet: true, table: true },
      });

      if (!qrCode || qrCode.status !== 'ACTIVE') {
        throw new AppError('Invalid or inactive QR code', 400);
      }

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

        // Process options
        let optionsTotal = 0;
        const optionsSnapshot = [];
        if (item.options) {
          for (const opt of item.options) {
            const option = product.options.find(o => o.id === opt.optionId);
            if (!option) throw new AppError('Invalid option', 400);
            const value = option.values.find(v => v.id === opt.valueId);
            if (!value) throw new AppError('Invalid option value', 400);
            optionsSnapshot.push({
              optionName: option.name,
              valueLabel: value.label,
              priceDelta: Number(value.priceDelta),
            });
            optionsTotal += Number(value.priceDelta);
          }
        }

        const unitPrice = Number(product.price) + optionsTotal;
        const total = unitPrice * item.quantity;
        subtotal += total;

        orderItems.push({
          product: { connect: { id: product.id } },
          productName: product.name,
          unitPrice,
          quantity: item.quantity,
          total,
          optionSnapshot: optionsSnapshot,
          options: { create: optionsSnapshot },
        });
      }

      const orderNumber = generateOrderNumber();
      const publicToken = `ord_${crypto.randomBytes(16).toString('hex')}`;

      const order = await prisma.order.create({
        data: {
          orderNumber,
          publicToken,
          restaurantId: qrCode.restaurantId,
          outletId: qrCode.outletId,
          tableId: qrCode.tableId,
          qrCodeId: qrCode.id,
          sessionId,
          status: 'PENDING',
          orderType: orderType || 'DINE_IN',
          customerName,
          customerPhone,
          customerNotes,
          subtotal,
          serviceFee: 0,
          total: subtotal,
          currency: qrCode.restaurant.currency,
          items: { create: orderItems },
          timeline: {
            create: { status: 'PENDING', notes: 'Order received' },
          },
        },
        include: { items: true },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          restaurantId: qrCode.restaurantId,
          orderId: order.id,
          type: 'NEW_ORDER',
          title: `New Order ${orderNumber}`,
          body: `Table ${qrCode.table?.label || 'N/A'} | Total: ${order.total}`,
        },
      });

      // Track analytics
      await prisma.analyticsEvent.create({
        data: {
          restaurantId: qrCode.restaurantId,
          outletId: qrCode.outletId,
          qrCodeId: qrCode.id,
          tableId: qrCode.tableId,
          sessionId,
          eventType: 'order_created',
          metadata: { orderId: order.id, total: subtotal },
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

  // Get order status (public)
  async getOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicToken } = req.params;
      const order = await prisma.order.findUnique({
        where: { publicToken },
        select: {
          orderNumber: true,
          status: true,
          items: { select: { productName: true, quantity: true, unitPrice: true, total: true } },
          total: true,
          createdAt: true,
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