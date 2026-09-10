import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/permission';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

const createPlanSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  priceMonthly: z.number().min(0),
  maxOutlets: z.number().int().min(1),
  maxStaff: z.number().int().min(1),
  features: z.record(z.boolean()),
});

router.get('/overview', adminController.getOverview);
router.get('/restaurants', adminController.listRestaurants);
router.get('/restaurants/:id', adminController.getRestaurant);
router.patch('/restaurants/:id/suspend', adminController.suspendRestaurant);
router.patch('/restaurants/:id/reactivate', adminController.reactivateRestaurant);
router.get('/subscriptions', adminController.listSubscriptions);
router.get('/plans', adminController.listPlans);
router.post('/plans', validate(createPlanSchema), adminController.createPlan);
router.get('/payments', adminController.listPayments);
router.get('/analytics', adminController.getAnalytics);
router.get('/activity-logs', adminController.getActivityLogs);

export const adminRoutes = router;