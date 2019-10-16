import { Router } from 'express';
import QuickaddressController from '../../../controllers/api/v1/QuickaddressController';

const router = Router();
const controller = new QuickaddressController();

router.get('/:orderId/verify', controller.verify.bind(controller));
router.get('/:orderId/refine', controller.refine.bind(controller));

export default router;
