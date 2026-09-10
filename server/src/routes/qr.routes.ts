import { Router } from 'express';
import { qrController } from '../controllers/qr.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generateQrSchema, bulkGenerateQrSchema, updateQrSchema } from '../validators/qr.validator';
import { requirePermission } from '../middleware/permission';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('qr.view'), qrController.listQr);
router.post('/', requirePermission('qr.create'), validate(generateQrSchema), qrController.generateQr);
router.post('/bulk', requirePermission('qr.create'), validate(bulkGenerateQrSchema), qrController.bulkGenerate);
router.get('/:id', requirePermission('qr.view'), qrController.getQr);
router.patch('/:id', requirePermission('qr.update'), validate(updateQrSchema), qrController.updateQr);
router.delete('/:id', requirePermission('qr.delete'), qrController.deleteQr);
router.get('/:id/analytics', requirePermission('analytics.view'), qrController.getQrAnalytics);

export const qrRoutes = router;