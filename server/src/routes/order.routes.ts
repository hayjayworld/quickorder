import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateOrderStatusSchema, cancelOrderSchema } from '../validators/order.validator';
import { requirePermission } from '../middleware/permission';
import { verifyOrderAccess } from '../middleware/tenant';

const router = Router();

router.use(authenticate);

router.get('/', orderController.listOrders);
router.post('/', requirePermission('orders.create'), orderController.createManualOrder);
router.get('/:id', verifyOrderAccess, orderController.getOrder);
router.patch('/:id/status', requirePermission('orders.update'), verifyOrderAccess, validate(updateOrderStatusSchema), orderController.updateStatus);
router.post('/:id/cancel', requirePermission('orders.cancel'), verifyOrderAccess, validate(cancelOrderSchema), orderController.cancelOrder);

export const orderRoutes = router;