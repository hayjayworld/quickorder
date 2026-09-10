import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export const analyticsService = {
  async getOverview(restaurantId: string, fromDate?: Date) {
    const ordersQuery: Prisma.OrderWhereInput = { restaurantId };
    if (fromDate) {
      ordersQuery.createdAt = { gte: fromDate };
    }

    const [totalOrders, totalRevenue, pendingOrders, completedOrders, cancelledOrders] =
      await Promise.all([
        prisma.order.count({ where: ordersQuery }),
        prisma.order.aggregate({ where: { ...ordersQuery, status: { not: 'CANCELLED' } }, _sum: { total: true } }),
        prisma.order.count({ where: { ...ordersQuery, status: 'PENDING' } }),
        prisma.order.count({ where: { ...ordersQuery, status: 'COMPLETED' } }),
        prisma.order.count({ where: { ...ordersQuery, status: 'CANCELLED' } }),
      ]);

    const avgOrder = totalOrders > 0 ? Number(totalRevenue._sum.total || 0) / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      pendingOrders,
      completedOrders,
      cancelledOrders,
      avgOrder,
    };
  },

  async getRevenueData(restaurantId: string, days: number) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: fromDate },
        status: { not: 'CANCELLED' },
      },
      select: { total: true, createdAt: true },
    });

    // Group by day
    const grouped: Record<string, number> = {};
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      grouped[dateKey] = (grouped[dateKey] || 0) + Number(order.total);
    });

    return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
  },

  async getTopProducts(restaurantId: string, limit: number = 5) {
    const products = await prisma.orderItem.findMany({
      where: {
        order: {
          restaurantId,
          status: { not: 'CANCELLED' },
        },
      },
      select: {
        productName: true,
        quantity: true,
        total: true,
      },
    });

    const grouped: Record<string, { name: string; quantity: number; revenue: number }> = {};
    products.forEach(p => {
      if (!grouped[p.productName]) {
        grouped[p.productName] = { name: p.productName, quantity: 0, revenue: 0 };
      }
      grouped[p.productName].quantity += p.quantity;
      grouped[p.productName].revenue += Number(p.total);
    });

    return Object.values(grouped)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  },

  async getQrAnalytics(restaurantId: string, fromDate?: Date) {
    const qrQuery: Prisma.QRCodeWhereInput = { restaurantId };
    const scanQuery: Prisma.QRScanWhereInput = {};

    if (fromDate) {
      scanQuery.scannedAt = { gte: fromDate };
    }

    const [totalQrCodes, totalScans, activeQrCodes] = await Promise.all([
      prisma.qRCode.count({ where: qrQuery }),
      prisma.qRScan.count({ where: { qrCode: qrQuery, ...scanQuery } }),
      prisma.qRCode.count({ where: { ...qrQuery, status: 'ACTIVE' } }),
    ]);

    // Orders from QR
    const qrOrders = await prisma.order.count({
      where: {
        restaurantId,
        qrCodeId: { not: null },
        ...(fromDate ? { createdAt: { gte: fromDate } } : {}),
      },
    });

    return {
      totalQrCodes,
      activeQrCodes,
      totalScans,
      qrOrders,
      conversionRate: totalScans > 0 ? (qrOrders / totalScans) * 100 : 0,
    };
  },
};