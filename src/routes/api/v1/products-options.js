import { Router } from 'express';
import productsOptionsValidator from '../../../middlewares/api/productsoptions-validator';
import ProductsOptionsController from '../../../controllers/api/v1/ProductsOptionsController';

const router = Router();
const controller = new ProductsOptionsController();

router.post('/default', productsOptionsValidator, controller.defaultOptions.bind(controller));
router.post('/filtered', productsOptionsValidator, controller.filtered.bind(controller));

export default router;
