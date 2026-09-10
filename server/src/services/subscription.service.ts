import { prisma } from '../config/database';

export const subscriptionService = {
  async getActiveSubscription(restaurantId: string) {
    return prisma.subscription.findFirst({
      where: {
        restaurantId,
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async canCreateOutlet(restaurantId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(restaurantId);
    if (!subscription) return false;

    const currentOutlets = await prisma.outlet.count({ where: { restaurantId } });
    return currentOutlets < subscription.plan.maxOutlets;
  },

  async canAddStaff(restaurantId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(restaurantId);
    if (!subscription) return false;

    const currentStaff = await prisma.restaurantUser.count({ where: { restaurantId } });
    return currentStaff < subscription.plan.maxStaff;
  },

  async hasFeature(restaurantId: string, featureKey: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(restaurantId);
    if (!subscription) return false;
    
    const features = subscription.plan.features as Record<string, boolean>;
    return features?.[featureKey] === true;
  },
};