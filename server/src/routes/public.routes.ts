import { Router } from 'express';
import { publicController } from '../controllers/public.controller';
import { validate } from '../middleware/validate';
import { createOrderSchema } from '../validators/order.validator';

const router = Router();

router.get('/menu/:qrToken', publicController.getMenu);
router.post('/orders', validate(createOrderSchema), publicController.createOrder);
router.get('/orders/:publicToken', publicController.getOrderStatus);

export const publicRoutes = router;