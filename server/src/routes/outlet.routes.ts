import { Router } from 'express';
import { outletController } from '../controllers/outlet.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOutletSchema, updateOutletSchema } from '../validators/restaurant.validator';
import { requirePermission } from '../middleware/permission';
import { verifyOutletAccess } from '../middleware/tenant';

const router = Router();

router.use(authenticate);

router.get('/', outletController.listOutlets);
router.post('/', requirePermission('outlets.create'), validate(createOutletSchema), outletController.createOutlet);
router.get('/:id', verifyOutletAccess, outletController.getOutlet);
router.patch('/:id', requirePermission('outlets.update'), verifyOutletAccess, validate(updateOutletSchema), outletController.updateOutlet);
router.delete('/:id', requirePermission('outlets.delete'), verifyOutletAccess, outletController.deleteOutlet);
router.get('/:id/tables', verifyOutletAccess, outletController.getTables);

export const outletRoutes = router;