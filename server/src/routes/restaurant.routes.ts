import { Router } from 'express';
import { restaurantController } from '../controllers/restaurant.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateRestaurantSchema } from '../validators/restaurant.validator';
import { requirePermission } from '../middleware/permission';

const router = Router();

router.get('/', authenticate, restaurantController.getRestaurant);
router.patch('/', authenticate, requirePermission('settings.update'), validate(updateRestaurantSchema), restaurantController.updateRestaurant);
router.get('/outlets', authenticate, restaurantController.getOutlets);
router.get('/stats', authenticate, restaurantController.getStats);

export const restaurantRoutes = router;