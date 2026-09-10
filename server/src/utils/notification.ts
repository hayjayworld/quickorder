import { prisma } from '../config/database';

interface CreateNotificationParams {
  restaurantId: string;
  userId?: string;
  orderId?: string;
  type: string;
  title: string;
  body: string;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  await prisma.notification.create({
    data: {
      restaurantId: params.restaurantId,
      userId: params.userId,
      orderId: params.orderId,
      type: params.type,
      title: params.title,
      body: params.body,
    },
  });
}