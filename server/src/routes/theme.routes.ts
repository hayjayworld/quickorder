import { Router } from 'express';
import { themeController } from '../controllers/theme.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const router = Router();

router.use(authenticate);

router.get('/', themeController.getTheme);
router.patch('/', requirePermission('themes.update'), themeController.updateTheme);
router.post('/preview', requirePermission('themes.update'), themeController.previewTheme);

export const themeRoutes = router;