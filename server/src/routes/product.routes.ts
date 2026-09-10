import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema, createCategorySchema, updateCategorySchema } from '../validators/product.validator';
import { requirePermission } from '../middleware/permission';
import { upload } from '../config/multer';

const router = Router();

router.use(authenticate);

// Products
router.get('/', productController.listProducts);
router.post('/', requirePermission('products.create'), validate(createProductSchema), productController.createProduct);
router.post('/upload-image', requirePermission('products.create'), upload.single('image'), productController.uploadImage);

// Categories
router.get('/categories/list', productController.listCategories);
router.post('/categories', requirePermission('categories.create'), validate(createCategorySchema), productController.createCategory);
router.patch('/categories/:id', requirePermission('categories.update'), validate(updateCategorySchema), productController.updateCategory);
router.delete('/categories/:id', requirePermission('categories.delete'), productController.deleteCategory);

router.get('/:id', productController.getProduct);
router.patch('/:id', requirePermission('products.update'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', requirePermission('products.delete'), productController.deleteProduct);

export const productRoutes = router;