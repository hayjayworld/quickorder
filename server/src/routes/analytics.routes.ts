import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const router = Router();

router.use(authenticate);
router.use(requirePermission('analytics.view'));

router.get('/overview', analyticsController.getOverview);
router.get('/revenue', analyticsController.getRevenueData);
router.get('/orders', analyticsController.getOrderData);
router.get('/products', analyticsController.getProductAnalytics);
router.get('/categories', analyticsController.getCategoryAnalytics);
router.get('/qr', analyticsController.getQrAnalytics);
router.get('/outlets', analyticsController.getOutletAnalytics);

export const analyticsRoutes = router;