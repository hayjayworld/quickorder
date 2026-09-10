import { Router } from 'express';
import { staffController } from '../controllers/staff.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const inviteStaffSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  role: z.enum(['RESTAURANT_ADMIN', 'RESTAURANT_MANAGER', 'FRONT_DESK']),
  outletId: z.string().optional(),
});

const updateStaffSchema = z.object({
  role: z.enum(['RESTAURANT_ADMIN', 'RESTAURANT_MANAGER', 'FRONT_DESK']).optional(),
  outletId: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get('/', requirePermission('staff.view'), staffController.listStaff);
router.post('/invite', requirePermission('staff.create'), validate(inviteStaffSchema), staffController.inviteStaff);
router.patch('/:id', requirePermission('staff.update'), validate(updateStaffSchema), staffController.updateStaff);
router.delete('/:id', requirePermission('staff.delete'), staffController.removeStaff);
router.post('/:id/reset-password', requirePermission('staff.update'), staffController.resetPassword);

export const staffRoutes = router;