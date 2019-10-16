import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import ProductsController from '../../../controllers/api/v1/ProductsController';
import productsOptions from './products-options';

const router = Router();
const controller = new ProductsController();

router.get('/', domainValidator, controller.index.bind(controller));
router.use('/options', domainValidator, productsOptions);

export default router;
