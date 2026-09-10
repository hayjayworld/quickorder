import { Router } from 'express';
import { tableController } from '../controllers/table.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTableSchema, updateTableSchema } from '../validators/restaurant.validator';
import { requirePermission } from '../middleware/permission';

const router = Router();

router.use(authenticate);

router.get('/', tableController.listTables);
router.post('/', requirePermission('tables.create'), validate(createTableSchema), tableController.createTable);
router.get('/:id', tableController.getTable);
router.patch('/:id', requirePermission('tables.update'), validate(updateTableSchema), tableController.updateTable);
router.delete('/:id', requirePermission('tables.delete'), tableController.deleteTable);

export const tableRoutes = router;