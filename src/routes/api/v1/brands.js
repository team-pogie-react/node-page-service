import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import BrandsController from '../../../controllers/api/v1/BrandsController';

const router = Router();
const controller = new BrandsController();

router.get('/top', domainValidator, controller.topBrands.bind(controller));

export default router;
