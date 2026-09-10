import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { tenantResolver } from './middleware/tenantResolver';
import { authRoutes } from './routes/auth.routes';
import { restaurantRoutes } from './routes/restaurant.routes';
import { outletRoutes } from './routes/outlet.routes';
import { productRoutes } from './routes/product.routes';
import { orderRoutes } from './routes/order.routes';
import { qrRoutes } from './routes/qr.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import { themeRoutes } from './routes/theme.routes';
import { staffRoutes } from './routes/staff.routes';
import { subscriptionRoutes } from './routes/subscription.routes';
import { adminRoutes } from './routes/admin.routes';
import { publicRoutes } from './routes/public.routes';
import { notificationRoutes } from './routes/notification.routes';
import { tableRoutes } from './routes/table.routes';
import { setupSocketServer } from './sockets/socketServer';

const app = express();
const httpServer = createServer(app);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'quickorder-api' });
});

// Global middleware
app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(__dirname, '..', config.uploadDir)));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: 'Too many requests',
});
app.use('/api', apiLimiter);

// Public routes (no auth required)
app.use('/api/public', publicRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Tenant-aware routes
app.use('/api', tenantResolver);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/outlets', outletRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// WebSocket
setupSocketServer(httpServer);

const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log(`QuickOrder server running on port ${PORT}`);
});

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}; shutting down`);
  httpServer.close(() => process.exit(0));
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

export default app;