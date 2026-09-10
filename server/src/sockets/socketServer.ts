import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/database';

let io: SocketIOServer | null = null;

export function setupSocketServer(httpServer: any) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1];
      if (!token) return next(new Error('Unauthorized'));

      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { restaurantUsers: true },
      });

      if (!user) return next(new Error('User not found'));
      
      socket.data.userId = user.id;
      socket.data.role = user.role;
      
      if (user.role === 'SUPER_ADMIN') {
        socket.data.restaurantId = null;
        socket.join('admin-room');
      } else {
        const restaurantUser = user.restaurantUsers[0];
        socket.data.restaurantId = restaurantUser?.restaurantId;
        if (restaurantUser?.restaurantId) {
          socket.join(`restaurant:${restaurantUser.restaurantId}`);
        }
        if (restaurantUser?.assignedOutletId) {
          socket.join(`outlet:${restaurantUser.assignedOutletId}`);
        }
      }

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join order tracking room for public customers
    socket.on('track-order', (orderToken: string) => {
      socket.join(`order-track:${orderToken}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitOrderEvent(restaurantId: string, event: string, data: any) {
  if (!io) return;
  io.to(`restaurant:${restaurantId}`).emit(event, data);
  io.to('admin-room').emit(event, { ...data, restaurantId });
}

export function emitOrderTrackingUpdate(publicToken: string, data: any) {
  if (!io) return;
  io.to(`order-track:${publicToken}`).emit('order.status.updated', data);
}

export { io };