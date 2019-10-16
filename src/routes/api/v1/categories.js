import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import CategoriesController from '../../../controllers/api/v1/CategoriesController';

const router = Router();
const controller = new CategoriesController();

router.get('/', domainValidator, controller.index.bind(controller));
router.get('/search/:topTier?/:secondTier?', domainValidator, controller.getCategoryByLevel.bind(controller));

export default router;
