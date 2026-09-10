import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/tenantResolver';
import { AppError } from '../utils/AppError';
import { generateQrToken } from '../utils/qrToken';
import QRCode from 'qrcode';

export const qrController = {
  // Generate single QR
  async generateQr(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { outletId, tableId, label, customLabel, status } = req.body;
      const restaurantId = req.restaurantId;
      if (!restaurantId) throw new AppError('Restaurant context is required', 403);

      // Verify outlet belongs to restaurant
      const outlet = await prisma.outlet.findFirst({
        where: { id: outletId, restaurantId },
      });
      if (!outlet) throw new AppError('Outlet not found', 404);

      const token = generateQrToken();
      
      const qrCode = await prisma.qRCode.create({
        data: {
          token,
          restaurantId,
          outletId,
          tableId,
          label: label || customLabel || null,
          status: status || 'ACTIVE',
        },
        include: { table: true, outlet: true },
      });

      // Generate QR image
      const orderUrl = `${process.env.CLIENT_URL}/order/${token}`;
      const qrDataUrl = await QRCode.toDataURL(orderUrl, {
        width: 400,
        margin: 2,
      });

      res.status(201).json({
        success: true,
        data: { ...qrCode, qrDataUrl, orderUrl },
      });
    } catch (error) {
      next(error);
    }
  },

  // Bulk generate QR codes
  async bulkGenerate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { outletId, tableIds, labelPrefix, status } = req.body;
      const restaurantId = req.restaurantId;
      if (!restaurantId) throw new AppError('Restaurant context is required', 403);

      const outlet = await prisma.outlet.findFirst({
        where: { id: outletId, restaurantId },
      });
      if (!outlet) throw new AppError('Outlet not found', 404);

      const results = [];
      for (const tableId of tableIds) {
        const token = generateQrToken();
        const qrCode = await prisma.qRCode.create({
          data: {
            token,
            restaurantId,
            outletId,
            tableId,
            label: `${labelPrefix || 'Table'} ${tableId}`,
            status: status || 'ACTIVE',
          },
          include: { table: true, outlet: true },
        });

        const orderUrl = `${process.env.CLIENT_URL}/order/${token}`;
        const qrDataUrl = await QRCode.toDataURL(orderUrl, {
          width: 400,
          margin: 2,
        });

        results.push({ ...qrCode, qrDataUrl, orderUrl });
      }

      res.status(201).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  },

  // List all QR codes
  async listQr(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { outletId, status, search, page = 1, limit = 20 } = req.query;
      const restaurantId = req.restaurantId;

      const where: any = { restaurantId };
      if (outletId) where.outletId = outletId;
      if (status) where.status = status;
      if (search) {
        where.label = { contains: search as string };
      }

      const [qrCodes, total] = await Promise.all([
        prisma.qRCode.findMany({
          where,
          include: { table: true, outlet: true },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.qRCode.count({ where }),
      ]);

      res.json({
        success: true,
        data: qrCodes,
        pagination: { page: Number(page), limit: Number(limit), total },
      });
    } catch (error) {
      next(error);
    }
  },

  // Update QR
  async getQr(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId;
      if (!restaurantId) throw new AppError('Restaurant context is required', 403);
      const qrCode = await prisma.qRCode.findFirst({
        where: { id: req.params.id, restaurantId },
        include: { table: true, outlet: true },
      });
      if (!qrCode) throw new AppError('QR code not found', 404);
      res.json({ success: true, data: qrCode });
    } catch (error) {
      next(error);
    }
  },

  async getQrAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.restaurantId;
      if (!restaurantId) throw new AppError('Restaurant context is required', 403);
      const qrCode = await prisma.qRCode.findFirst({ where: { id: req.params.id, restaurantId } });
      if (!qrCode) throw new AppError('QR code not found', 404);
      const [scans, orders] = await Promise.all([
        prisma.qRScan.count({ where: { qrCodeId: qrCode.id } }),
        prisma.order.count({ where: { qrCodeId: qrCode.id } }),
      ]);
      res.json({ success: true, data: { scans, orders, totalScans: qrCode.totalScans } });
    } catch (error) {
      next(error);
    }
  },

  // Update QR
  async updateQr(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId;
      const { label, status, tableId } = req.body;

      const qrCode = await prisma.qRCode.findFirst({
        where: { id, restaurantId },
      });
      if (!qrCode) throw new AppError('QR code not found', 404);

      const updated = await prisma.qRCode.update({
        where: { id },
        data: { label, status, tableId },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  // Delete/revoke QR
  async deleteQr(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const restaurantId = req.restaurantId;

      const qrCode = await prisma.qRCode.findFirst({
        where: { id, restaurantId },
      });
      if (!qrCode) throw new AppError('QR code not found', 404);

      await prisma.qRCode.update({
        where: { id },
        data: { status: 'REVOKED' },
      });

      res.json({ success: true, message: 'QR code revoked' });
    } catch (error) {
      next(error);
    }
  },
};