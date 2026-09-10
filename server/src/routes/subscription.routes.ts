import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const router = Router();

router.use(authenticate);

router.get('/', subscriptionController.getCurrentSubscription);
router.get('/plans', subscriptionController.getPlans);
router.post('/change', requirePermission('subscription.update'), subscriptionController.changePlan);
router.post('/cancel', requirePermission('subscription.update'), subscriptionController.cancelSubscription);
router.get('/invoices', subscriptionController.getInvoices);

export const subscriptionRoutes = router;